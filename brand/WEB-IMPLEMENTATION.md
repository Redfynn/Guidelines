# Web implementation notes

A tested starting point lives in `assets/redfynn-web.css`. It is the stylesheet from the RedFynn Statement Savings Check page, which the user approved as looking on brand. Copy it, then change the content, not the system.

## Pieces

| Piece | Class / token | Notes |
|---|---|---|
| Colors | `--ink` `--bg` `--muted` `--line` `--accent` | Charcoal #1C1B1F, White, Slate #4D4C4E (light theme text-muted), Smoke #D2D1D2 (rules), Red #ED3E25. Dark theme swaps ink and bg and keeps the same accent. |
| Nav bar | `.nav` | Always white with the secondary logo (the logo PNGs have a white background). Thin bottom rule. |
| Overline | `.overline` | Light 300, 13px, uppercase, 0.12em tracking. |
| Header | `h1` | Weight 400, clamp(34px, 5vw, 52px), line-height 1.05. Never bold. |
| Inputs | `.field` | Underline only, large Book-weight numbers, red underline on focus. |
| Gradient panel | `.result` | Layered radial gradients (red, orange, peach) that drift slowly, plus a grain layer. Text is always charcoal. Respect `prefers-reduced-motion`. |
| Pill buttons | `.pill.solid`, `.pill.line` | Filled charcoal and thin outline. Fully rounded. |
| Footer | `footer` | Thin rule, document name left, "©RedFynn Technologies" right. |

## Grain
The noise is an inline SVG with `feTurbulence`, used as a `background-image` on a `::after` layer with `mix-blend-mode: soft-light` at about 0.55 opacity:

```
data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E
```
Replace `GRAIN_SVG` in the CSS with that string. If the page needs the real brand artwork instead, use a crop from `assets/gradients/` as a `background-image` with `background-size: cover`, and keep black text on top.

## Layout patterns
- **Tool or calculator:** two columns. Quiet inputs on the left, gradient result panel on the right. On a phone, the result panel comes first.
- **Landing or hero:** white nav bar, then a full-width gradient block with an overline, a very large Book-weight headline and one short paragraph, then the two pill buttons.
- **Content page:** the guide's own layout works well. A thin rule with a section number and name, a narrow left text column, and a light grey (#F1F1F1) content area.
- Keep a 16px minimum side gutter and let columns stack below about 800px.

## Embedding logos
Inline the logo as a base64 data URI when the destination blocks external images (for example a sandboxed artifact). The secondary logo at about 150px wide is a good nav size. It must not go below 126px wide. The primary logo must not go below 144px.

## Theme notes
- Light theme is the default look. A dark theme uses Charcoal as the page background and white text. Keep the gradient panel identical in both themes.
- Status colors: avoid adding green or amber. Show a negative number with an underline, a red accent or the word itself. If a status color is unavoidable, keep it small and flag it for designer review.

## Checklist before handing off
1. No bold text, no off-palette colors, no logo distortions.
2. Logo is on white (or a correctly supplied reversed version) and meets the minimum size.
3. Gradient has grain and black text on top, with readable contrast.
4. Footer carries "©RedFynn Technologies".
5. In the reply, state which font was used and that Hanken Grotesk is a stand-in for TWK Everett.
