# store-screenshots-panorama

An Agent Skill that turns raw app screenshots into a finished App Store or Google Play screenshot set that reads as one
flowing panorama — in light and dark themes, for every required iPhone size, for iPhone Duo and for Android phones.

![A six-image App Store set for a prayer app, light theme on top and dark theme below](assets/demo.jpg)

The set above was made by the skill from five raw screenshots. Every UI pixel is the original screenshot, only
resized and cropped; the background, headlines, device frames and 3D objects are rendered around it.

## What it makes

- **One panorama, not separate cards.** The background is designed as one strip and sliced, so its large curves flow
  across every seam while the gallery scrolls.
- **Big, steady layout.** Heavy centred headlines and a device at the same spot in every image, so the eye goes to
  what changes.
- **The proof, pulled forward.** The screen is dimmed while one cropped part of it — a countdown, a player, a card —
  pops out past the device at 1:1 raw pixels. Spotlights, 2×2 card grids, fans, feature chips and gradient frames are
  built in.
- **3D objects from the app's own world.** Glossy, puffy SVG objects with real lighting filters, picked from the app's
  subject (a crescent and stars for a prayer app, speech bubbles and notes for a subtitle app) and placed on the seams.
- **A hero first.** No phone: the app's symbol as a giant 3D object holding the app's own UI cards.
- **Light and a real dark theme.** The dark theme is dark-dominant: accent colour only in headlines, objects and
  frames. Give it your app's dark-mode screenshots and the dark set shows the dark UI.
- **Every required size.** iPhone 6.9" (1320×2868) and 6.3" (1206×2622), plus iPhone Duo outer (1398×2034) and inner
  (2007×2853) when Duo screenshots are provided, and a Google Play phone set (1080×1920) when Android screenshots are
  provided. Output is PNG without alpha.

What it won't do: redraw, regenerate or translate the UI, put iPhone screenshots in a Duo frame or Android screenshots
in an iPhone frame, or add shopping-ad clutter like campaign badges and discount ribbons.

## Install

```bash
npx skills add zaferayan/store-screenshots-panorama-skill
```

Works with any agent supported by the [skills](https://skills.sh) CLI (Claude Code, Codex, Cursor, and others).

Requirements: Node 18+ and a Chromium-based browser (Chrome, Chromium, Edge or Brave). No packages to install.

## Usage

Put your raw screenshots in a folder and ask your agent:

```text
Use the store-screenshots-panorama skill.
Make App Store screenshots from the screens in raw/, light and dark.
```

The agent derives the palette, headlines and 3D symbols from the screenshots and produces the sets directly — no plan
files or approval stops. Output lands in `out/<lang>/<theme>/<device>/01.png …`, with the editable source HTML in
`out/.src/` so you can change a headline and render again.

If your app has a dark mode, put the light-mode screenshots in `raw-light/` and the dark-mode ones in `raw-dark/`,
with the same names. The light set then shows the light UI and the dark set the dark UI. With a single `raw/` folder,
both sets use the same screenshots.

For iPhone Duo, add screenshots from the iPhone Duo simulator (Xcode 27.1) in `raw-duo-outer/` and `raw-duo-inner/`,
with the same names as in `raw/`. App Store Connect requires Duo screenshots from April 2027 for apps built with the
iOS 27.1 SDK or later.

For Google Play, put Android screenshots in `raw-android/` (or `raw-android-light/` and `raw-android-dark/`). If you
only have Android screenshots, you can ask for the Play Store set directly:

```text
Use the store-screenshots-panorama skill.
Make Google Play screenshots from the Android screens in raw/, light and dark.
```

The set is 1080×1920 (9:16), the size Play asks for to show screenshots in its recommendation formats.

You can also run the renderer yourself:

```bash
node skills/store-screenshots-panorama/scripts/render.mjs out/.src/panorama.html \
  --theme dark --device iphone --out out/en/dark/iphone-6.9 --preview out/.src/preview-dark.png
```

`--device` is `iphone`, `duo-outer`, `duo-inner` or `android`; pass `--size 1206x2622` for the 6.3" set, `--only 2,5`
to re-render single images.

## Repository structure

```text
store-screenshots-panorama-skill/
├── README.md
├── LICENSE
├── assets/
│   └── demo.jpg
└── skills/
    └── store-screenshots-panorama/
        ├── SKILL.md
        ├── references/
        │   └── style.md          measured layout, colour roles, 3D objects, dark theme, iPhone Duo, Google Play
        ├── assets/
        │   └── panorama.html     the template: devices, crops, dimming, 3D objects, hero
        └── scripts/
            ├── render.mjs        slices the panorama into store-size PNGs with headless Chrome
            └── grid.mjs          pixel grid for measuring crops
```

## License

MIT
