# Bonsai interaction demo

A design exploration that rebuilds a handful of interaction details from Bonsai. Each entry pairs the problem with the version that shipped, the reasoning behind it, the relevant code, and a demo. It is not an official Bonsai changelog.

## Pages

- **Interactions** (`/`): the gallery of entries. It is the only page.
  1. **Stacked toasts**: a live Before/After demo. New toasts enter at the bottom and push the stack up as a unit, each toast leaves on its own clock, and hovering or focusing the stack pauses every timer.
  2. **Pop-up menus**: a live Before/After demo of a menu with submenus. Before fades in and fades and shrinks out over 300ms. After opens in 150ms, closes with a 100ms fade, swaps submenus instantly, and gives an open submenu a 150ms grace period so a diagonal move toward it does not lose it.
  3. **Toolbar tooltips**: a live Before/After demo on a rounded icon toolbar. Before scales every tooltip in over 200ms on each hover. After waits 500ms before the first tooltip, then opens the rest instantly with no animation.
  4. **Miscellaneous**: smaller single-property details (button press, toggle, tooltip, checkbox).

## Stack

- React 19 + TypeScript, built with Vite
- [Motion](https://motion.dev) for animation, with `reducedMotion="user"` set app-wide
- [Lucide](https://lucide.dev) icons
- Oxlint for linting
- A small history-based router in `src/router.tsx` (no routing library)

## Project layout

```
src/
  entries.ts          Gallery content: title, context, code snippet and media per entry
  pages/              The Gallery page
  components/
    Entry.tsx         One gallery entry
    MediaSlot.tsx     Demo, video placeholder or before/after comparison
    ToastDemo.tsx     The live stacked-toasts demo
    MenuDemo.tsx      The live pop-up menu demo
    TooltipDemo.tsx   The live toolbar tooltip demo
    Tooltip.tsx       The shared tooltip
    DemoParts.tsx     Shared demo trigger and verdict badge
    CodeBlock.tsx     Snippet frame with CopyButton
  index.css           Design tokens, type scale and component styles
```

To add an entry, append an object to `entries` in `src/entries.ts`. Toast timings are defined in both `index.css` and `ToastDemo.tsx`; keep them in step.

## Running locally

```bash
npm install
```

```bash
npm run dev
```

Other scripts: `npm run build` (type-check and production build), `npm run preview`, `npm run lint`.
