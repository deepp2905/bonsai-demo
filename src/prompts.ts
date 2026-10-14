/**
 * Copyable build prompts: how each After version works, in interaction and
 * motion, with exact values. Stack-agnostic on purpose, so they can be
 * rebuilt in whatever codebase they land in. Keep them in step with the demos.
 */
export const prompts: Record<'toasts' | 'menus' | 'tooltips' | 'misc', string> = {
  toasts: `Build a stacked toast notification system with the interaction and motion below. Use whatever animation approach the codebase already has, but match these values exactly.

LAYOUT
- Toasts live in a fixed region in the bottom-right corner, 24px from the edges (16px on narrow screens), 352px wide (or the viewport width minus 32px, whichever is smaller). The region itself ignores pointer events; only the toasts take them.
- Every toast has a fixed height of 64px, with an 8px gap between toasts. Place each toast by its slot index: slot 0 is the bottom, and each slot up is 72px higher (toast height + gap). Position with a transform (translateY), not with layout, so every move can animate.
- At most 6 toasts are visible. Each has a title, a one-line body, an Undo button as its primary action, and a close (×) button.

MOTION (one easing for every move: cubic-bezier(0.33, 1, 0.68, 1))
- Enter: a new toast takes slot 0. It starts one toast height (64px) below its slot at opacity 0, then rises into place while fading in, over 260ms. In the same frame every other toast moves up one slot, also over 260ms, so the stack moves as one unit and it is clear which toast is new.
- Use transitions that retarget rather than keyframes that restart: a toast interrupted mid-move continues from where it is to its new target.
- Every exit shows why the toast left:
  - Expired: dips 32px down from its slot while fading out, 160ms.
  - Closed or Undo pressed: drops one toast height (64px) from its slot while fading out, 260ms. The toasts above close the gap over the same 260ms, moving in the same direction.
  - Pushed out by a new toast when 6 are showing: the oldest (top) toast is carried up one more slot with the stack while fading out, 260ms.
- Leaving toasts render behind the others (lower z-order), so a toast that crosses another slides under it, not over it.
- A pushed-out toast is not discarded. It waits off screen (keep up to 6 waiting; drop the oldest past that). When a slot frees up, the most recently pushed-out toast returns to the top slot, dropping in from one slot above while fading in, 260ms.

TIMING AND HOLD
- Each toast lives 4 seconds from when it arrived, each on its own clock.
- While the pointer is anywhere over the stack (from the top of the highest toast to the bottom of the lowest, gaps included) or keyboard focus is inside it, every clock pauses. Closing the toast under the pointer keeps the hold, because the pointer is still over the stack.
- When the pointer and focus leave, every toast gets a fresh, full 4-second lifetime, staggered by 150ms so they expire one at a time, oldest (top) first. Toasts waiting off screen expire first and silently, so none comes back only to expire straight away.

ACCESSIBILITY
- The region is a polite live region labelled "Notifications". Undo and close are real buttons with accessible names; the close button is named "Dismiss" and has a matching tooltip.
- With prefers-reduced-motion: reduce, remove all movement. Toasts only fade, and positions change instantly.`,

  menus: `Build a pop-up menu with submenus that has the interaction and motion below. Use whatever animation approach the codebase already has, but match these values exactly.

OPENING AND CLOSING
- A trigger button opens the menu on press and closes it on a second press. Pressing anywhere outside the trigger and menu closes it, as does choosing an item without a submenu.
- The menu opens 6px below the trigger, aligned to its left edge, 168px wide. If there is no room on the right, align it to the trigger's right edge instead.
- Open: opacity 0 to 1 and scale 0.97 to 1, over 150ms, easing cubic-bezier(0.23, 1, 0.32, 1).
- Close: opacity to 0 and scale back to 0.97, over 100ms, ease-out. Closing is faster than opening so the menu gets out of the way.
- Origin-aware: scale from the corner nearest the trigger (top-left; top-right when aligned to the right), for both opening and closing.

SUBMENUS
- An item with a submenu shows a chevron. Hovering it opens its submenu beside it: 8px to the right, 152px wide, its first item level with the parent item.
- If there is no room on the right, open the submenu to the left. If there is no room either side (a phone), cascade it down and to the right over its parent instead.
- A submenu opens and closes with the same motion as the menu (150ms in, 100ms out), scaling from the side nearest its parent item (top-left, or top-right when it opens to the left).
- Moving from one submenu item to a sibling switches submenus instantly: the old one disappears and the new one appears with no animation at all.
- Hover intent: when the pointer leaves the parent item and crosses a sibling on its way into the open submenu, do not switch. Track the last few pointer positions; if the pointer is inside the triangle formed by where it was a moment ago and the submenu's near-edge top and bottom corners, hold the open submenu for up to 150ms. Reaching the submenu cancels the switch. Leaving the triangle (the pointer stopped heading there) switches immediately, without waiting out the 150ms.

ITEMS
- Items are 32px tall with 6px rounded corners, inside a white panel with 4px padding, 10px corner radius, a 1px subtle border and a soft layered shadow. A destructive item (Delete) is red and sits after a divider.
- The hover highlight is instant: no transition at all. The item whose submenu is open stays highlighted, except while the pointer is on a sibling, when only the item under the pointer is highlighted.

KEYBOARD AND ACCESSIBILITY
- Use menu and menuitem roles, aria-haspopup and aria-expanded on the trigger and on items with submenus.
- Opening from the keyboard moves focus to the first item. Up and Down arrows move between items, wrapping around. Right arrow (or Enter / Space) on an item with a submenu opens it and focuses its first item. Left arrow in a submenu closes it and returns focus to its parent item. Escape closes the current level; at the top level it closes the menu and returns focus to the trigger.
- With prefers-reduced-motion: reduce, drop the scale and keep only the opacity fade.`,

  tooltips: `Build tooltips for a row of icon-only buttons in a toolbar with the interaction and motion below. Use whatever animation approach the codebase already has, but match these values exactly.

THE TOOLBAR
- A fully rounded (pill) toolbar with 4px padding, a 1px subtle border, no shadow, holding 32px circular icon buttons 2px apart. Icons only, no text. Every button has an accessible name (aria-label).
- Hovering a button fills it with a light neutral background instantly, with no transition.

ONE SHARED TOOLTIP
- The toolbar has a single tooltip element, not one per button. It sits centred above the hovered button, 8px above its top edge: a small dark label with white text, 6px corner radius, 4px by 8px padding, and a soft shadow.
- First open: wait 500ms of hover dwell before showing it, to avoid opening by accident. Moving to another button during the dwell restarts it. Then it fades in (opacity 0 to 1), scales from 0.96 to 1 and moves up 2px into place, over 150ms, easing cubic-bezier(0.33, 1, 0.68, 1), growing out of the button (transform origin at its bottom centre).
- Once open, it stays open as the pointer moves across the toolbar. Hovering another button glides the tooltip horizontally to that button's centre over 150ms, ease-out, and swaps the text instantly. Its width simply fits the new label, with no width animation. There is no new dwell and no fade.
- When it first appears it is placed directly over the button, without gliding in from wherever it was last.
- Leaving the toolbar closes it: opacity to 0 and scale back to 0.96 over 100ms, ease-out, with no movement. The label keeps showing the last text while it fades out.
- Coming back within 300ms of it closing reopens it instantly, with no dwell and no animation. After that, the 500ms dwell applies again.

KEYBOARD, TOUCH AND ACCESSIBILITY
- Keyboard focus (focus-visible only, not the focus left by a mouse click) opens it immediately at the focused button. Moving focus between buttons moves it the same way as hover. Focus leaving the toolbar, or Escape, closes it.
- Touch gets no tooltip, so a tap never leaves one stuck open.
- The tooltip is a visual label only: the buttons already carry their accessible names, so hide the tooltip from assistive tech rather than announcing the name twice.
- With prefers-reduced-motion: reduce, drop the scale, the 2px move and the glide; keep only the opacity fade.`,

  misc: `Build two small controls with the interaction and motion below. Use whatever animation approach the codebase already has, but match these values exactly.

1. COPY BUTTON
- A 36px square icon button (8px corner radius, 1px border, light neutral fill) showing a copy icon, with a tooltip reading "Copy".
- On press, write the text to the clipboard. Only if that succeeds, swap the icon to a check mark and change the tooltip and accessible name to "Copied". If the clipboard write fails, change nothing rather than claim a copy that did not happen.
- Icon swap: both icons are stacked in the same cell so the button never shifts. The outgoing icon scales from 1 to 0.25, fades to 0 and blurs to 4px; the incoming icon starts at scale 0.25, opacity 0 and 4px blur, and settles at scale 1, full opacity and no blur. Both run together over about 200ms with no overshoot (a critically damped spring, or a 200ms ease-out).
- After 1.6 seconds the check mark swaps back to the copy icon with the same motion. Pressing again restarts the 1.6 seconds.
- Hover fills the button with a slightly darker neutral over 150ms, ease-out.

2. CHECKBOX WITH A DRAWN TICK
- An 18px square box with 5px corner radius and a 1px border, next to its label. The tick is a 12px SVG path (a short stroke down, then a longer one up), 1.75px stroke, round caps and joins.
- Checking: the box fills with the dark ink colour and its border matches, over 150ms, ease-out. At the same time the tick draws itself in from its first point to its last, over 200ms, ease-out (animate the stroke's dash offset or path length from 0 to full), at full opacity from the start.
- Unchecking: the box returns to its empty state over 150ms, and the tick fades out over 100ms, ease-out, rather than un-drawing. Reset the path to undrawn only once it is invisible, so the next check draws in fresh.
- Use the checkbox role with aria-checked (or a native checkbox) and a visible focus ring around the box.`,
}
