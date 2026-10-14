/**
 * Copyable build prompts: how each After version works, in interaction and
 * motion, with exact values. Stack-agnostic and free of visual styling on
 * purpose: the codebase they land in already has its own components and look.
 * Keep them in step with the demos.
 */
export const prompts: Record<'toasts' | 'menus' | 'tooltips' | 'misc', string> = {
  toasts: `Update our toast notifications to follow the interaction and motion below. Keep the existing toast component and its styling; change how toasts are laid out, move, and time out. Use whatever animation approach the codebase already uses, but match these values.

LAYOUT
- Toasts stack in a fixed corner region (bottom right). The region ignores pointer events; only the toasts take them.
- Every toast has the same fixed height, with a fixed gap between toasts. Place each toast by its slot index: slot 0 is the bottom, and each slot up is one toast height plus the gap higher. Position with a transform (translateY), not with layout, so every move can animate.
- At most 6 toasts are visible at once.

MOTION (one easing for every move: cubic-bezier(0.33, 1, 0.68, 1))
- Enter: a new toast takes slot 0. It starts one toast height below its slot at opacity 0, then rises into place while fading in, over 260ms. In the same frame every other toast moves up one slot, also over 260ms, so the stack moves as one unit and it is clear which toast is new.
- Use transitions that retarget rather than keyframes that restart: a toast interrupted mid-move continues from where it is to its new target.
- Every exit shows why the toast left:
  - Expired: dips 32px down from its slot while fading out, 160ms.
  - Closed, or its action (e.g. Undo) pressed: drops one toast height from its slot while fading out, 260ms. The toasts above close the gap over the same 260ms, moving in the same direction.
  - Pushed out by a new toast when 6 are showing: the oldest (top) toast is carried up one more slot with the stack while fading out, 260ms.
- Leaving toasts render behind the others (lower z-order), so a toast that crosses another slides under it, not over it.
- A pushed-out toast is not discarded. It waits off screen (keep up to 6 waiting; drop the oldest past that). When a slot frees up, the most recently pushed-out toast returns to the top slot, dropping in from one slot above while fading in, 260ms.

TIMING AND HOLD
- Each toast lives 4 seconds from when it arrived, each on its own clock.
- While the pointer is anywhere over the stack (from the top of the highest toast to the bottom of the lowest, gaps included) or keyboard focus is inside it, every clock pauses. Closing the toast under the pointer keeps the hold, because the pointer is still over the stack.
- When the pointer and focus leave, every toast gets a fresh, full 4-second lifetime, staggered by 150ms so they expire one at a time, oldest (top) first. Toasts waiting off screen expire first and silently, so none comes back only to expire straight away.

ACCESSIBILITY
- The region is a polite live region labelled "Notifications". A toast's action and close are real buttons with accessible names.
- With prefers-reduced-motion: reduce, remove all movement. Toasts only fade, and positions change instantly.`,

  menus: `Update our pop-up menu (and its submenus) to follow the interaction and motion below. Keep the existing menu component and its styling; change how it opens, closes, switches submenus and responds to hover and keyboard. Use whatever animation approach the codebase already uses, but match these values.

OPENING AND CLOSING
- The trigger opens the menu on press and closes it on a second press. Pressing anywhere outside the trigger and menu closes it, as does choosing an item that has no submenu.
- Open: opacity 0 to 1 and scale 0.97 to 1, over 150ms, easing cubic-bezier(0.23, 1, 0.32, 1).
- Close: opacity to 0 and scale back to 0.97, over 100ms, ease-out. Closing is faster than opening so the menu gets out of the way.
- Origin-aware: the menu scales from the corner nearest its trigger, both opening and closing. If the menu flips to fit the viewport, the origin flips with it.

SUBMENUS
- Hovering an item that has a submenu opens the submenu beside it, with no delay.
- A submenu opens and closes with the same motion as the menu (150ms in, 100ms out), scaling from the side nearest the item that opened it. If it flips to the other side to fit, the origin flips too. Where neither side fits (small screens), cascade it over its parent instead.
- Moving from one submenu item to a sibling switches submenus instantly: the old one disappears and the new one appears with no animation at all.
- Hover intent: when the pointer leaves the parent item and crosses a sibling on its way into the open submenu, do not switch. Track the last few pointer positions; if the pointer is inside the triangle formed by where it was a moment ago and the submenu's near-edge top and bottom corners, hold the open submenu for up to 150ms. Reaching the submenu cancels the switch. Leaving the triangle (the pointer has stopped heading there) switches immediately, without waiting out the 150ms.

HOVER HIGHLIGHT
- Item highlight follows the pointer instantly, with no transition.
- The item whose submenu is open stays highlighted, except while the pointer is on a sibling during the hover-intent hold, when only the item under the pointer is highlighted.

KEYBOARD AND ACCESSIBILITY
- Use menu and menuitem roles, with aria-haspopup and aria-expanded on the trigger and on items that have submenus.
- Opening from the keyboard moves focus to the first item. Up and Down arrows move between items, wrapping around. Right arrow (or Enter / Space) on an item with a submenu opens it and focuses its first item. Left arrow in a submenu closes it and returns focus to its parent item. Escape closes the current level; at the top level it closes the menu and returns focus to the trigger.
- With prefers-reduced-motion: reduce, drop the scale and keep only the opacity fade.`,

  tooltips: `Update our tooltip component to follow the interaction and motion below. It is used all over the codebase, so it needs a sensible default for a single trigger plus an opt-in group mode for rows of adjacent triggers. Keep the existing tooltip styling and positioning; change when it opens, how it moves and how tooltips hand off to each other. Use whatever animation approach the codebase already uses, but match these values.

1. DEFAULT: A SINGLE TOOLTIP (every tooltip, unless it is in a group)
- Open on hover after a 500ms dwell, so passing over a trigger does not open it by accident. Leaving the trigger before then cancels it.
- Enter: opacity 0 to 1 and scale 0.96 to 1, with a 2px move toward its resting place, over 150ms, easing cubic-bezier(0.33, 1, 0.68, 1). It grows out of its trigger: the transform origin is the edge facing the trigger, and follows the tooltip if it flips sides to fit.
- Exit: opacity to 0 and scale back to 0.96 over 100ms, ease-out, with no movement. Exiting is faster than entering so it gets out of the way.
- If the tooltip's text changes while it is open (e.g. "Copy" to "Copied"), update it in place. Do not close and reopen it.

2. WARM-UP WINDOW (global, on by default)
- After any tooltip closes, a tooltip opened within 300ms (on any trigger, anywhere) appears instantly: no dwell and no enter animation. Once 300ms pass with no tooltip open, the dwell applies again.
- This keeps moving between nearby but unrelated triggers fast, without every tooltip replaying its entrance.

3. GROUP MODE (opt-in, for rows of adjacent triggers)
- Use it only where triggers sit side by side along one axis and their tooltips appear on the same side: toolbars, icon button rows, tab bars, side rails. Everywhere else, use the default.
- A group renders one shared tooltip for all its triggers, not one each.
- The first open in a group uses the default dwell and enter motion (or the warm-up window, if it applies).
- Once open, it stays open while the pointer moves between triggers in the group. Hovering another trigger glides the tooltip along the row's axis to that trigger over 150ms, ease-out, and swaps its text instantly. Its size simply fits the new text, with no size animation, and there is no new dwell and no fade.
- When it first opens it is placed directly at its trigger, never gliding in from where it was last shown.
- Moving over gaps between triggers inside the group keeps it open. Leaving the group closes it with the default exit, still showing the last text as it fades.

KEYBOARD, TOUCH AND ACCESSIBILITY (both modes)
- Keyboard focus (focus-visible only, not the focus left by a mouse click) opens the tooltip immediately, with no dwell. In a group, moving focus between triggers moves the shared tooltip the same way as hover. Blur closes it, and Escape closes it without moving focus.
- Touch gets no hover tooltip, so a tap never leaves one stuck open.
- For icon-only triggers the tooltip names the control: the trigger carries the name itself (aria-label), and the tooltip is hidden from assistive tech so the name is not read twice. For a tooltip that adds a description, link it with aria-describedby instead.
- With prefers-reduced-motion: reduce, drop the scale, the 2px move and the glide; keep only the opacity fade.`,

  misc: `Update two small controls to follow the interaction and motion below. Keep their existing styling; change only how they respond. Use whatever animation approach the codebase already uses, but match these values.

1. COPY BUTTON (icon-only)
- On press, write the text to the clipboard. Only if that succeeds, swap the copy icon for a check mark and change its tooltip and accessible name to "Copied". If the write fails, change nothing rather than claim a copy that did not happen.
- Icon swap: both icons occupy the same spot, so the button never shifts. The outgoing icon scales from 1 to 0.25, fades to 0 and blurs to 4px; the incoming icon starts at scale 0.25, opacity 0 and 4px blur, and settles at scale 1, full opacity and no blur. Both run together over about 200ms with no overshoot (a critically damped spring, or a 200ms ease-out).
- After 1.6 seconds the check mark swaps back to the copy icon with the same motion. Pressing again restarts the 1.6 seconds.
- If the button has a text label too, keep its width fixed through the swap (reserve room for the longer label) so it never resizes.

2. CHECKBOX WITH A DRAWN TICK
- Checking: the box fills to its checked state over 150ms, ease-out. At the same time the tick draws itself in along its path, from its first point to its last, over 200ms, ease-out (animate the stroke's dash offset or path length from 0 to full), at full opacity from the start.
- Unchecking: the box returns to its empty state over 150ms, and the tick fades out over 100ms, ease-out, rather than un-drawing. Reset the path to undrawn only once it is invisible, so the next check draws in fresh.
- Use a native checkbox or the checkbox role with aria-checked, and keep the focus ring visible.`,
}
