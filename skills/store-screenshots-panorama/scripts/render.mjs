#!/usr/bin/env node
/*
Render a panorama page (a copy of assets/panorama.html) into store-size PNG slices with headless Chrome.

Usage:
    node render.mjs <panorama.html> --out <dir> [--theme light|dark] [--device iphone|duo-outer|duo-inner]
                    [--size WxH] [--preview <file.png>] [--only 2,5] [--no-slices]

Devices and their default sizes (App Store Connect screenshot specifications, checked October 2026):
    iphone      1320x2868 (6.9"). Also render --size 1206x2622 (6.3"): App Store Connect requires the 6.3" class,
                plus a 6.9" (or 6.5") set.
    duo-outer   1398x2034  iPhone Duo outer display
    duo-inner   2007x2853  iPhone Duo inner display

- Every <section class="shot"> is one image; the count is read from the page.
- Slice i is the whole panorama seen through a W×H window moved i×W to the left, so shapes and
  objects crossing a seam continue exactly in the next image.
- Files: <dir>/01.png … NN.png, RGB without alpha (both stores reject transparency).
- --preview writes the whole strip at 1/5 scale with thin seam marks, to check the flow.
- Each slice is a fresh Chrome run (~10 s). While fixing, re-render only what changed: --only 2,5 renders
  those images (1-based), --no-slices with --preview renders just the preview.
- Prints JSON: files, size, warnings (wrong size, alpha, page errors, the page's own "WARN:" lines).

Needs Node 18+ and Chrome, Chromium, Edge or Brave (set CHROME_PATH if not found). No npm packages.
*/

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BROWSERS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const COMMANDS = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'brave-browser'];
const PREVIEW_SCALE = 0.2;
// Portrait sizes App Store Connect accepts for each layout in assets/panorama.html; ratio = height / width.
const DEVICES = {
  'iphone':    { size: '1320x2868', ratio: 2868 / 1320 },
  'duo-outer': { size: '1398x2034', ratio: 2034 / 1398 },
  'duo-inner': { size: '2007x2853', ratio: 2853 / 2007 },
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function fail(message) { console.error(message); process.exit(1); }

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const candidate of BROWSERS) if (fs.existsSync(candidate)) return candidate;
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    for (const name of COMMANDS) if (fs.existsSync(path.join(dir, name))) return path.join(dir, name);
  }
  fail('No Chromium-based browser found. Install Chrome or set CHROME_PATH.');
}

function parseArgs(argv) {
  const opts = { page: null, out: null, theme: 'light', device: 'iphone', size: null, preview: null, only: null, slices: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) fail(`${a} needs a value`);
      return argv[++i];
    };
    if (a === '--out') opts.out = value();
    else if (a === '--theme') opts.theme = value();
    else if (a === '--device') opts.device = value();
    else if (a === '--size') opts.size = value();
    else if (a === '--preview') opts.preview = value();
    else if (a === '--only') opts.only = value().split(',').map(Number);
    else if (a === '--no-slices') opts.slices = false;
    else if (a === '-h' || a === '--help') opts.help = true;
    else opts.page = a;
  }
  return opts;
}

/*
Screenshot url at the given window size. Chrome finishes the work but does not always exit on its own
(seen on macOS and in sandboxed shells), so poll for the file to stop growing instead of waiting for exit.
Returns the page's console warnings and errors (Chrome logs them to stderr, iframes included).
*/
async function shoot(browser, workDir, [w, h], url, out, timeoutMs = 120000) {
  const errPath = path.join(workDir, 'stderr.txt');
  const stderr = fs.openSync(errPath, 'w');
  const proc = spawn(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--allow-file-access-from-files', '--enable-logging=stderr', '--v=0', `--user-data-dir=${path.join(workDir, 'profile')}`,
    '--force-device-scale-factor=1', `--window-size=${w},${h}`, '--virtual-time-budget=15000',
    `--screenshot=${out}`, url,
  ], { stdio: ['ignore', 'ignore', stderr] });
  let exited = false;
  proc.on('exit', () => { exited = true; });
  proc.on('error', error => fail(`could not start the browser: ${error.message}`));

  const sizes = [];
  const deadline = Date.now() + timeoutMs;
  while (!exited && Date.now() < deadline) {
    await sleep(300);
    sizes.push(fs.existsSync(out) ? fs.statSync(out).size : 0);
    if (sizes.length >= 4 && sizes.at(-1) > 0 && sizes.slice(-4).every(s => s === sizes.at(-1))) break;
  }
  if (!exited) {
    proc.kill('SIGTERM');
    for (let i = 0; i < 20 && !exited; i++) await sleep(250);
    if (!exited) proc.kill('SIGKILL');
  }
  fs.closeSync(stderr);
  const log = fs.readFileSync(errPath, 'utf8');
  const messages = [...log.matchAll(/CONSOLE[^\]]*\] "((?:WARN:|Uncaught|Error)[^"]*)"/g)].map(m => m[1]);
  return [...new Set(messages)];
}

function checkPng(file, [w, h]) {
  const header = fs.readFileSync(file).subarray(0, 26);
  const [width, height, colorType] = [header.readUInt32BE(16), header.readUInt32BE(20), header[25]];
  const warnings = [];
  if (width !== w || height !== h) warnings.push(`browser produced ${width}x${height}, expected ${w}x${h}`);
  if (colorType === 4 || colorType === 6) warnings.push('PNG has an alpha channel; give the page an opaque background and re-render');
  return warnings;
}

const frame = (src, w, h, left, extra = '') => `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin:0;overflow:hidden;background:#000;width:${w}px;height:${h}px">
<iframe src="${src}" scrolling="no" style="position:absolute;top:0;left:${left}px;border:0;${extra}"></iframe>
</body></html>`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.page || !opts.out) {
    const source = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
    console.log(source.slice(source.indexOf('/*') + 3, source.indexOf('*/')).trim());
    process.exit(opts.help ? 0 : 1);
  }
  if (!['light', 'dark'].includes(opts.theme)) fail('--theme must be light or dark');
  if (!DEVICES[opts.device]) fail(`--device must be one of ${Object.keys(DEVICES).join(', ')}`);
  opts.size ??= DEVICES[opts.device].size;
  if (!/^[1-9]\d*x[1-9]\d*$/i.test(opts.size)) fail(`--size must look like 1320x2868, got "${opts.size}"`);
  const pagePath = path.resolve(opts.page);
  if (!fs.existsSync(pagePath)) fail(`page not found: ${pagePath}`);
  const html = fs.readFileSync(pagePath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const count = (html.match(/<section\b[^>]*\bclass="[^"]*\bshot\b/g) || []).length;
  if (!count) fail('no <section class="shot"> found in the page');
  const [W, H] = opts.size.toLowerCase().split('x').map(Number);
  const ratio = H / W, expected = DEVICES[opts.device].ratio;
  const sizeWarning = Math.abs(ratio - expected) / expected > 0.02
    ? `size ${W}x${H} has ratio ${ratio.toFixed(3)}, but ${opts.device} layouts are made for ${expected.toFixed(3)}; the device frame will not fit`
    : null;
  const outDir = path.resolve(opts.out);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = findBrowser();
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'store-pano-'));
  const src = `${pathToFileURL(pagePath).href}?w=${W}&h=${H}&theme=${opts.theme}&device=${opts.device}`;
  const iframeSize = `width:${count * W}px;height:${H}px`;
  const files = [];
  const warnings = sizeWarning ? [sizeWarning] : [];
  try {
    const wanted = !opts.slices ? [] : opts.only ? opts.only.map(n => n - 1) : [...Array(count).keys()];
    for (const i of wanted) {
      if (!(Number.isInteger(i) && i >= 0 && i < count)) fail(`--only: use image numbers from 1 to ${count}`);
      const wrapper = path.join(workDir, `slice-${i}.html`);
      fs.writeFileSync(wrapper, frame(src, W, H, -i * W, iframeSize));
      const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`);
      fs.rmSync(out, { force: true });
      const messages = await shoot(browser, workDir, [W, H], pathToFileURL(wrapper).href, out);
      if (!fs.existsSync(out)) fail(`browser produced no screenshot for ${path.basename(out)}`);
      files.push(out);
      for (const w of [...checkPng(out, [W, H]), ...messages]) warnings.push(`${path.basename(out)}: ${w}`);
    }
    if (opts.preview) {
      const pw = Math.round(count * W * PREVIEW_SCALE), ph = Math.round(H * PREVIEW_SCALE);
      const seams = Array.from({ length: count - 1 }, (_, i) =>
        `<div style="position:absolute;top:0;left:${Math.round((i + 1) * W * PREVIEW_SCALE)}px;width:1px;height:14px;background:#f0f"></div>`).join('');
      const wrapper = path.join(workDir, 'preview.html');
      fs.writeFileSync(wrapper, frame(src, pw, ph, 0, `${iframeSize};transform:scale(${PREVIEW_SCALE});transform-origin:0 0`)
        .replace('</body>', `${seams}</body>`));
      const preview = path.resolve(opts.preview);
      fs.mkdirSync(path.dirname(preview), { recursive: true });
      fs.rmSync(preview, { force: true });
      await shoot(browser, workDir, [pw, ph], pathToFileURL(wrapper).href, preview);
      if (fs.existsSync(preview)) files.push(preview);
      else warnings.push('preview: browser produced no image');
    }
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ theme: opts.theme, device: opts.device, size: [W, H], count, files, warnings: [...new Set(warnings)] }, null, 2));
}

main();
