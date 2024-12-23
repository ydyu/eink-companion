# eink-companion
A browser extension for e-ink readers.

# Supported features:
- floating up/down scroll buttons
  - scrolls the page down or up by configured amount
  - if the user scrolls any element on the page by a little bit, the buttons will start scrolling that element instead
  - if the scrolling element disappears, picks the largest scrollable element that's visible
  - can be moved to left or right side by a tap
  - can configure position and size (in px or %)
- inject CSS styles suitable for e-ink screen, each style is toggleable
  - white background
  - black text
  - bold text
