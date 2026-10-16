# Style

The layout measurements (headline, device, cards, dimming, panorama) were taken at full resolution from a large
marketplace app's 2026 App Store set. The decoration and the hero do not come from that set: they come from each app's
own content. This skill deliberately leaves out the reference's shopping-specific elements (campaign badges, ribbons,
discount language).

The set works because it reads as one surface: the same two colours, the same headline, the device in the same place.
The only thing that changes from image to image is the part of the screen that is pulled forward and its message.
The 3D objects tell at a glance which app the set belongs to: a crescent and stars for a prayer app, a speech bubble
and a note for a subtitle app.

All values are design pixels on a 1290-wide canvas; `assets/panorama.html` already applies the layout measurements.

## Contents
1. Colour system
2. Background — one panorama
3. Headline
4. Devices
5. Highlight techniques
6. 3D objects — from context
7. Image types and order
8. Copy tone
9. Dark theme
10. iPhone Duo
11. Google Play (Android phone)

## 1. Colour system
The whole set uses only two backgrounds: the accent gradient and a second background (white in the light theme).
Other colours stay in small areas; a third colour over a large area breaks the set apart in the small search-result
thumbnail.

| Role | In the template | How to derive it | Example (prayer app with a gold accent) |
|---|---|---|---|
| Accent (A) | `--A` | The app's identity colour: buttons, the selected tab, the logo. In a dark-themed app this is the accent, not the background. | `#E6C177` |
| Background gradient | `--A-deep` → `--A-light` | The same hue as A, darkened until a white headline reaches at least 3:1 | `#9A6719` → `#BC8931` |
| Headline on white | `--A-ink` | A, darkened until it gets close to 4.5:1 on white | `#A16E1C` |
| 3D face and card frame (G) | `--G1..3` | Three light, vivid stops from A; because the background is darkened, the objects stand out | `#FFE7A3` → `#F6B443` → `#EC7A3C` |
| 3D side wall | `--S1..2` | Dark tones of G | `#C9802A` → `#B4561F` |
| 3D ground shadow | `--SH` | Almost black, in A's hue | `#3A1D05` |
| Sparkles | `--P*` | Yellow; stays as is for most palettes | `#FFF4B8` → `#F5A31C` |

Example: for a purple app, G becomes purple → magenta → coral, S dark purple, SH very dark purple.

## 2. Background — one panorama
In the reference, the edge columns of neighbouring images are identical at all 8 seams: the background was designed as
one piece and then sliced. When people scroll the gallery, shapes that flow without a break make the set read as one
surface.

- `svg.bg` covers the whole strip (width n×1290, height = the design height, §4). Pick one of two ways: accent regions
  on top of the second background (`class="fill-A"`), or an all-accent strip with second-background shapes on top
  (`class="fill-2"`).
- Each image is split by 1–2 large curves: circles with a radius larger than the canvas width, U-shaped fields, or soft
  waves. No straight or diagonal edges.
- A shape can come from context: a huge white disc behind the hero can be the moon, a wave can be a sound wave. But it
  always stays simple and large.
- The accent covers 25–75% of each image.
- The headline zone (y 0–650) sits on a single colour. If a curve passes behind the headline, the headline is split
  into two colours and becomes hard to read. A practical way: draw the second-background fields so that they cross the
  headline band vertically, on the seams.
- The background changes in groups of 2–3 images along the panorama (e.g. A A B B A A; B = second background).
  Decide the colour sequence of the headline zones first, then draw the curves to match it.

## 3. Headline
- Centred horizontally; the cap top of the first line at y≈150 (`.hl`).
- A heavy geometric sans (SF Pro Display Heavy on macOS, otherwise Inter), weight 800, 148px, line height 166px,
  letter spacing −1%.
- 2 lines, 3–4 on the hero. Break lines by meaning with `<br>`. The widest line is at most 1160px (90%).
- The size is fixed across the set. If a headline doesn't fit, cut words instead of shrinking the font: mixed sizes
  make a set look messy.
- Sentence case, no full stop at the end, no subheadline.
- `class="hl on-A"` on the accent, `class="hl on-2"` on the second background.
- Set `<html lang>` to the headline language so uppercase and line breaking follow its rules (e.g. `tr` for İ/ı).

## 4. Devices
App Store Connect screenshot specifications (checked October 2026):
- **iPhone 6.3" (Dynamic Island, medium display) is required:** 1206×2622 or 1179×2556.
- **iPhone 6.9" (Dynamic Island, large display):** 1320×2868, 1290×2796 or 1260×2736. Without it, 6.5"
  (1284×2778 / 1242×2688) becomes required. So the 6.9" set is always produced too.
- **iPhone Duo:** outer display 1398×2034, inner display 2007×2853 (2853×2007 in landscape). Required from April 2027
  for apps built with the iOS 27.1 SDK or later. App Store Connect does not scale other sizes into the Duo slots.
- 1–10 images per slot, PNG or JPEG, with no alpha channel or transparency.
- **Google Play phone:** JPEG or 24-bit PNG without alpha, each side 320–3840px, the long side at most twice the short
  one, up to 8 per device type. To be eligible for Play's screenshot-based recommendation formats, an app needs at
  least 4 portrait screenshots at 9:16, at least 1080×1920 (Play Console Help, "Add preview assets to showcase your
  app", checked October 2026). So the Google Play set is 1080×1920 with 4–8 images.

The template builds every device on a canvas 1290 design pixels wide and scales it to the output width. The design
height follows from the output's aspect ratio:

| Device (`--device`) | Output | Design height | Device frame (design px) |
|---|---|---|---|
| `iphone` | 1320×2868 and 1206×2622 | ≈2803 | outer 966×1999 @ (158,696), radius 180, screen 884 wide, Dynamic Island and buttons |
| `duo-outer` | 1398×2034 | ≈1877 | outer 884×1249 @ (203,568), radius 150, screen 802×1167 |
| `duo-inner` | 2007×2853 | ≈1834 | outer 884×1222 @ (203,552), radius 120, screen 802×1140 |
| `android` | 1080×1920 | ≈2293 | outer 790×1655 @ (250,560), radius 110, screen 708×1573 (20:9), no Dynamic Island or buttons |

- ~20px titanium rim, ~21px black bezel. The device is fully visible, with ~60–100px left below it.
- Position and size are the same in every image, regardless of how many lines the headline has.
- The raw screenshot is scaled to the screen width (1206 → 884 on iPhone). A raw screenshot much narrower than that gets
  upscaled and blurry; ask for the larger original.

## 5. Highlight techniques
Every standard image has one main highlight and at most one secondary one. The highlighted part is always cropped from
the raw screenshot (`data-crop`). Ask: which single part of this screen proves the headline? A countdown, a list of
prayer times, a continue-reading card, a player, a result or a button.

- **Pop-out card (the main technique)** — `.crop` + `data-center` + `data-scale="1.35"`.
  - ~1.35× its size inside the phone, i.e. 1:1 in raw pixels, so it stays sharp.
  - 85–90% of the canvas width (~1100px). It sticks out 60–120px past at least one side of the device.
  - Position: the card sits level with its real place on the screen, so it reads as a zoom. This comes before the
    y≈1750–1850 rule, which only applies when the card is in the middle of the screen.
  - Converting between screen and design (iPhone): design x = 199 + raw x × 884/1206, design y = 737 + raw y × 884/1206
    (for a 1206-wide raw screenshot; for other widths use 884/width). On Duo: x = 244 + raw x × 802/raw width;
    y = 609 (outer) or 593 (inner) + raw y × 802/raw width. On Android: x = 291 + raw x × 708/raw width;
    y = 601 + raw y × 708/raw width.
  - The enlarged card is ~17% larger than its box on every side. Its edge must not cut a line of text in the dimmed
    screen in half: move it until the edge falls between lines or covers the line completely.
  - Take the corner radius from the card's own corner on screen (`data-r`).
- **Dimming** — `.phone.dim`. When there is a pop-out card, a 50% black layer goes over the screen. This is the only
  thing applied to the screen, and it is a separate layer; the UI pixels do not change.
- **Spotlight** — `.crop.spot` + `data-spot`. One element stays bright in its real place, above the dimming, with a
  soft glow around it. It can be combined with a pop-out card: one shines in place, the other comes forward.
- **Card grid** — When the screen has several equal tiles, use four separate crops in a 2×2 grid. `data-scale`
  1.25–1.35, ~20px gaps. The gaps should fall on parts of the dimmed screen without text; lower the scale to 1.25 if
  needed, even if the overhang drops below 60px. Keep shadows off the neighbouring card: give the cards `.flat` and put
  a `.shadow-box` of the same size under each one.
- **Fan** — On list or content screens, 3 cards: the middle one ~1.25× larger and in front, the side ones sticking out
  past the device's edges.
- **Feature chip (secondary)** — `.chip`, ~400×360px. It holds an icon from the screen (`.crop.inline`) and 1–2 words
  ("Bookmark"). It sits on the device's top corner, sticking out at the side and at the top.
- **Gradient frame** — `.crop.framed`, a 14px G gradient. Use it for the set's one or two most important cards; used
  everywhere, it loses its effect.

## 6. 3D objects — from context
The objects repeat the app's subject and the symbols on its screens. Ask: which symbols appear in this app's icon, tab
icons and onboarding? Examples:

| App | Objects |
|---|---|
| Prayer / Quran | crescent, star, sparkle |
| Subtitles / video | speech bubble, play button, note |
| Fitness | dumbbell, heart, lightning bolt |
| Finance | coin, chart arrow, shield |
| Weather | sun, cloud, drop |

- `<div class="obj" data-shape="…" data-at="x,y" data-size="…" data-rot="…">`. Built-in shapes: `crescent`, `star`,
  `sparkle`, `bubble`, `play`, `note`, `heart`, `orb`. For any other symbol, give an SVG path in a 200×200 box with
  `data-path`. Use `data-round` (a stroke width) to soften corners and `data-rule="evenodd"` for holes.
- Placement: objects mostly sit on the seams (direct children of `.pano`, x = a multiple of 1290). They get split in
  two and tie two images together. Add the device's corners and the canvas's bottom corners to that.
- An object on a seam is split in two, and each half must still be recognisable. Pick symmetric shapes or shapes whose
  half still reads: stars, crescents, sparkles, orbs. Keep shapes like an open book, which turn into a blob when split
  down the middle, away from the seams.
- Size: ~400px large, ~300px medium, ~220px sparkle. Rotated 15–35°. At most 2 objects per image (the hero object does
  not count). Usually one object per seam.
- Objects never cover the headline, a pop-out card or important UI text. They may cover the device frame or an empty
  part of the screen.
- Prefer the app's own 3D art (icon, onboarding illustrations) if it exists. An image-generation tool, if available,
  may be used to make objects only — never with a phone or UI in them.

## 7. Image types and order
1. **Hero (image 1)** — no device.
   - A 3–4-line headline: the promise that sums up the whole app in one sentence ("Prayer, Quran and dua, all in
     one app").
   - The app's main symbol becomes a giant 3D object (`.obj.hero`, ~1900px). It runs off one or both sides of the
     canvas.
   - 2–3 crops of the app's own cards sit in its hollow or in front of it, each rotated ±8°, `data-scale` ≈1.1–1.2.
     `data-front` redraws the object's front rim over the cards, so they look as if they sit inside the symbol.
     The fade band must end above the rim where the cards cross it, and only the cards' corners should go behind the
     rim; otherwise the card looks like it is dissolving instead of tucked behind the edge.
   - The object may run into image 2, but its front copy (`data-front`) is drawn over the card and text there. The part
     that spills over must land on an empty area of image 2; otherwise shrink or rotate the object.
   - A small 3D object sits in front.
   - Behind it, a large second-background shape that fits the context (e.g. a white disc as the moon behind the
     crescent).
   - This is often the only image people see in search results, so it carries the promise.
2. **Standard** — headline + device + 1 main highlight (+ at most 1 secondary) + objects on the seams.

Order: hero → the most used feature → the other features in order of value. The number of images is usually the number
of raw screenshots + 1.

## 8. Copy tone
- Benefit phrases of 2–5 words, mixing noun phrases and imperatives ("Never miss a prayer", "Pick up where you left
  off"; in Turkish: "Vakitleri hiç kaçırma", "Kaldığın yerden oku").
- In languages with a formal and an informal "you", use the informal one (Turkish "sen").
- Don't repeat a title that is already on the screen; the headline says what the screen gives the user.
- No campaign, discount or urgency language ("Don't miss out!", "Limited time", "50%"), unless the app really runs a
  campaign and the user asks for it.
- Claims like "the best" or "number 1" only with a source, and with a source note.

## 9. Dark theme
Rendered with `--theme dark`. The template applies the differences below itself; what you choose is K.

The dark theme must be dark-dominant: every large area is dark, and A only shines in headlines, 3D objects, card frames
and sparkles. So the accent regions of the light theme are not painted with A in the dark theme; they get a dark tone
made of K with a little A mixed in. The background shapes and the flow stay the same and continue quietly between two
dark tones.

K (`--K`, `--K-top`, `--K-surface`): the app's own dark background colour. If the app isn't dark, an almost-black
colour in A's hue with 8–12% lightness.

| Element | Light theme | Dark theme |
|---|---|---|
| Screenshots | `raw-light/` (or `raw/`) | `raw-dark/` if given, otherwise the same as the light theme |
| Second background | White | K (a little darker at the top, vertical gradient) |
| Accent regions | A gradient | K + 8–16% A (`--dark-tint-deep` / `--dark-tint-light`, computed by the template). Higher ratios turn warm A and cool K into a muddy brown; lower ones make the flow invisible. |
| Headlines | White on the accent, `--A-ink` on white | `--A` everywhere (the template switches to white if contrast is too low) |
| Device rim | Dark titanium | Light natural titanium + a faint glow in A |
| Card and chip background | The UI's own surface / white | The UI's own surface / `--K-surface` |
| Card shadow | Soft dark shadow | 1px light edge and a glow in A |
| Screen dimming | 50% | 45% |
| 3D objects | Ground shadow | Ground shadow + a glow in A |

- Headlines must be at least 3:1; the template reports anything lower as `WARN:`.
- When both themes are made, design the panorama once for the light theme (accent share 25–75% per image). The same
  file is rendered twice; layout, curves, headlines and crops stay the same, only colour and light change.
- Check the dark theme: is any large flat A area left in the preview? There shouldn't be. The hero's 3D symbol may stay
  in A; it is an object, not background.

**Dark-mode screenshots.** If the app has a dark mode and the user gives both appearances, each theme shows its own:
the dark set shows the app as dark-mode users see it, and no white screen becomes the brightest thing in a dark image.
- Folders: `raw-light/` and `raw-dark/` (or `raw/` and `raw-dark/`), with the same file names and pixel sizes. Each
  theme takes `raw-<theme>/` if it exists, otherwise `raw/`, otherwise the other theme's folder; with only one folder,
  both themes show it. Duo works the same way: `raw-duo-outer-light/`, `raw-duo-outer-dark/`, `raw-duo-inner-…`.
- In the template, set `RAW` to the two folder names and write every path with the light one. For `--theme dark`, the
  script swaps that folder for the dark one in every `img src`, `data-raw` and `data-src`. It reports a missing dark
  screenshot, or one of a different size, as `WARN:`.
- The crops are measured once, on the light screenshots, and shared. That only holds if both appearances show the same
  state: the same content, scroll position and time. Try the boxes on the dark screenshots too. If one shows something
  else, the crop will too; name the screen to retake at delivery.
- A dark UI on K: the cards keep their 1px light edge and the glow in A. Check that the device's screen and the cards
  still separate from the background in the dark images.

## 10. iPhone Duo
Verified from Apple's sources (screenshot specifications and the HIG page "Designing for iPhone Duo", October 2026):
- There are two displays, each with its own front camera, and a hinge in the middle. The outer display is wider and
  shorter than other iPhones.
- On the outer display the system places the Dynamic Island, the status bar, the toolbar and the tab bar vertically
  along one edge. Content sits next to that strip.
- On the inner display the camera is behind the screen and not visible. Split views open into two panes on the inner
  display.
- Slots: outer 1398×2034, inner 2007×2853 (§4). Other sizes are not scaled into these slots.

Not verified: which corner the outer camera is in, what the hinge looks like, the case's corner radius, and the
buttons. The template doesn't draw them; it uses a plain rim and bezel. If the user provides the official Duo frame
from Apple Design Resources, use that.

**Raw screenshots.** Duo sets are made only from screenshots taken on Duo, because the UI is different (side bars, two
panes).
- Take them in the iPhone Duo simulator in Xcode 27.1, separately for each display (Simulator → File → Save Screen).
- Put them in `raw-duo-outer/` and `raw-duo-inner/`, in the same order and with the same names as the iPhone ones
  (per appearance `raw-duo-outer-light/`, `raw-duo-outer-dark/` and so on, §9).
- Check the size. The ratio must match 1398×2034 (outer) or 2007×2853 (inner). The template scales another resolution
  with the same ratio; if the ratio differs, ask the user.
- If there are no Duo screenshots, produce the iPhone sets and say at delivery: Duo sets become required from April 2027
  (iOS 27.1 SDK), and which screens need to be captured on both displays for them.

**Layout.** Each Duo display is its own panorama. Start from a copy of the iPhone panorama:
- The story stays the same: order, headlines, palette, symbols and the colour sequence of the headline zones.
- The design height is short (outer ≈1877, inner ≈1834); the device starts at y≈550. The headline position doesn't
  change.
- Redraw the background shapes at this height. The `viewBox` takes this height automatically.
- Measure the crops again from the Duo raw screenshots; `data-scale` is still ~1.35, relative to the Duo screen.
  There is less vertical room, so keep cards level with their real place on the screen.
- On the outer display, if a crop doesn't include the side strip (tab and status bar), end it without cutting the
  strip. If the feature is the tab itself, include the strip.
- The inner display's signature is the two-pane layout. Pick screens that show a split view; a pop-out card can be one
  of the panes.
- The hero object shrinks to ~0.65× (e.g. 1900 → 1250), centred at y≈1150–1250. The cards stay inside it.
- Objects on the seams stay on the same seams; multiply their y positions by ~0.66.
- Check: are the bottom of the device, the cards and the objects inside the canvas? Nothing may be cut off at the
  bottom.

## 11. Google Play (Android phone)
Google Play shows the app as Android users see it, so this set is made from Android screenshots only. An iPhone
screenshot (Dynamic Island, iOS status bar and controls) in a Play listing, or an Android one in an iPhone frame, shows
the app as something it isn't.

**Raw screenshots.**
- `raw-android/`, or per appearance `raw-android-light/` and `raw-android-dark/` (§9 works the same way). Same names
  and order as `raw/` when both exist.
- If the only screenshots given are Android ones (an Android status bar, a navigation bar or gesture handle, no Dynamic
  Island), even in `raw/`, use that folder as the Android folder and make only the Google Play set. Say at delivery that
  the App Store sets need iPhone screenshots.
- The frame's screen is 20:9 (e.g. 1080×2400, the common ratio of current Android phones). A taller screenshot is cut
  at the bottom and a shorter one leaves black under it. For another ratio, change the `android` entry in `DEVICES`
  so that the screen, (w − 82) × (h − 82), has the screenshot's ratio, keep it centred, and keep ~80px below the
  device.
- The screen is 708 design px (593 output px), so any screenshot at least ~720px wide stays sharp.

**Layout.** Like Duo, start from the iPhone panorama, or from the template if there is no iPhone set:
- The story stays the same as the App Store set: order, headlines, palette, symbols and the colour sequence of the
  headline zones.
- The canvas is shorter (≈2293 instead of ≈2800), so the device is smaller (790 wide) and starts at y≈560. The
  headline position and size don't change; standard headlines stay at 2 lines (they end at y≈450).
- Redraw the background shapes for this height; multiply object y positions by ~0.82. The hero object shrinks to
  ~1600.
- The screen is narrower, so a full-width pop-out card needs `data-scale` ≈1.6 (instead of 1.35) to reach
  ~1000–1100px. For a 1080-wide screenshot this is still about 1:1 in raw pixels at the 1080 output.

**Play's own guidance** (recommended for phones, not required; it affects how Play may show and promote the listing):
- Taglines take up at most 20% of the image. A 2-line headline is ≈15%; keep the hero to 3 short lines (≈20%).
- Avoid device imagery that dates quickly or leaves out some users. The `android` frame is deliberately generic: no
  camera, buttons or brand.

**Not covered:** Wear OS (Play requires screenshots there without device frames, added text or backgrounds), tablets and
Chromebooks (their own 16:9 / 9:16 sets), and the Play feature graphic (1024×500).
