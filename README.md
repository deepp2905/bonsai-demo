# Bonsai interaction demo

A design exploration that rebuilds a handful of interaction details from Bonsai. Each entry pairs the problem with the version that shipped, the reasoning behind it, and a demo. It is not an official Bonsai changelog.

## Pages

- **Interactions** (`/`): the gallery of entries. It is the only page.
  1. **Stacked toasts**: a live Before/After demo. New toasts enter at the bottom and push the stack up as a unit, each toast leaves on its own clock, and hovering or focusing the stack pauses every timer.
  2. **Pop-up menus**: a live Before/After demo of a menu with submenus, opened by pressing the trigger. Before fades in and fades and shrinks out over 300ms. After opens in 150ms, closes with a 100ms fade, switches submenus instantly as you hover from one to the next, holding the open one for up to 150ms only while the pointer is heading into it.
  3. **Toolbar tooltips**: a live Before/After demo on a rounded icon toolbar. Before waits 300ms and scales every tooltip in over 160ms on each hover. After wraps the same tooltips in a `TooltipGroup`, so they share one tooltip: it waits 500ms the first time (or opens at once inside the page-wide 300ms warm-up window), then stays open, gliding to each icon you hover over 150ms and swapping its text.
  4. **Miscellaneous**: smaller details, live: the copy button's icon swap and a checkbox whose tick draws itself in (SVG `pathLength`), with a third slot marked Coming soon.
  5. **Final thoughts**: the thinking behind the work: motion only where it does a job.

## Stack

- React 19 + TypeScript, built with Vite
- [Motion](https://motion.dev) for animation, with `reducedMotion="user"` set app-wide
- [Lucide](https://lucide.dev) icons
- Oxlint for linting
- A small history-based router in `src/router.tsx` (no routing library)

## Project layout

```
src/
  entries.ts          Gallery content: title, context and demo per entry, plus Miscellaneous
  prompts.ts          The Copy prompt text for each section: how its After version works
  pages/              The Gallery page
  components/
    Entry.tsx         One gallery entry
    MediaSlot.tsx     Placeholder frame for a demo still to come
    ToastDemo.tsx     The live stacked-toasts demo
    MenuDemo.tsx      The live pop-up menu demo
    TooltipDemo.tsx   The live toolbar tooltip demo
    CheckboxDemo.tsx  The checkbox with a self-drawing tick
    Tooltip.tsx       The tooltip, plus TooltipGroup for rows of adjacent triggers
    DemoParts.tsx     Shared demo trigger and verdict badge
    CopyButton.tsx    Copy button with the icon swap
    CopyPromptButton.tsx  The Copy prompt pill on each section title
  index.css           Design tokens, type scale and component styles
```

Each entry and Miscellaneous has a Copy prompt button on its title row. It copies a stack-agnostic description of how the After version works, with exact timings, from `src/prompts.ts`; update it when a demo changes. To add an entry, append an object to `entries` in `src/entries.ts`. Toast timings are defined in both `index.css` and `ToastDemo.tsx`; keep them in step.

## Running locally

```bash
npm install
```

```bash
npm run dev
```

Other scripts: `npm run build` (type-check and production build), `npm run preview`, `npm run lint`.
