---
name: Pro Terminal Alpha
colors:
  surface: '#0f131e'
  surface-dim: '#0f131e'
  surface-bright: '#353945'
  surface-container-lowest: '#0a0e19'
  surface-container-low: '#171b26'
  surface-container: '#1b1f2b'
  surface-container-high: '#262a35'
  surface-container-highest: '#313441'
  on-surface: '#dfe2f2'
  on-surface-variant: '#c3c5d8'
  inverse-surface: '#dfe2f2'
  inverse-on-surface: '#2c303c'
  outline: '#8d90a2'
  outline-variant: '#434656'
  surface-tint: '#b6c4ff'
  primary: '#b6c4ff'
  on-primary: '#002780'
  primary-container: '#2962ff'
  on-primary-container: '#f7f5ff'
  inverse-primary: '#004ee8'
  secondary: '#66dabf'
  on-secondary: '#00382e'
  secondary-container: '#20a28a'
  on-secondary-container: '#003027'
  tertiary: '#ffb3b0'
  on-tertiary: '#680010'
  tertiary-container: '#da2237'
  on-tertiary-container: '#fff4f3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab3'
  secondary-fixed: '#84f7db'
  secondary-fixed-dim: '#66dabf'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005143'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410007'
  on-tertiary-fixed-variant: '#92001b'
  background: '#0f131e'
  on-background: '#dfe2f2'
  surface-variant: '#313441'
  bull-green: '#089981'
  bear-red: '#F23645'
  surface-base: '#131722'
  surface-panel: '#1E222D'
  surface-elevated: '#2A2E39'
  border-subtle: '#2A2E39'
  border-interactive: '#363A45'
  text-primary: '#F0F3FA'
  text-secondary: '#787B86'
  text-muted: '#50535E'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
  data-mono-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 0.75rem
  margin-desktop: 1.5rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style

This design system delivers a high-performance, institutional-grade market data interface. Built for active traders, financial analysts, and quantitative investors, the aesthetic blends utilitarian data density with refined digital craftsmanship. The experience feels surgical, responsive, and authoritative—eliminating unnecessary visual noise while highlighting real-time market movement, execution tools, and high-frequency data streams.

The aesthetic follows an elevated Modern Technical / Financial Dark Mode: deep obsidian and charcoal layered canvases, crisp hairline dividers, high-contrast monospace figures, and vivid directional semantic accents. Visual momentum is driven by contrast and density rather than decoration, offering a professional trading desk ambiance that inspires confidence and rapid comprehension during volatile market events.

## Colors

The color architecture is built strictly for high-clarity financial visualization against a pure dark palette:

- **Primary (`#2962FF`):** Used exclusively for system navigation, interactive highlights, primary actions, focused form states, and active chart tool cursors.
- **Directional Semantics:**
  - **Bull Green (`#089981`):** Indicates positive price deltas, bid orders, long positions, upward sparklines, and bullish indicators.
  - **Bear Red (`#F23645`):** Indicates negative price deltas, ask orders, short positions, downward sparklines, and liquidation thresholds.
- **Surface Elevation Layers:**
  - Base canvas (`#131722`) creates deep contrast.
  - Panel surfaces (`#1E222D`) organize modules, sidebars, and order books.
  - Hover states and elevated popovers leverage `#2A2E39`.
- **Text & Borders:**
  - High-tier foreground `#F0F3FA` ensures immediate readouts across data points.
  - `#787B86` and `#50535E` provide subtle, readable secondary metadata and axis labels without visual competition.

## Typography

Typography relies on `Inter` (or native system sans-serif fallbacks), selected for its exceptional legibility at micro scales and extensive OpenType features.

- **Tabular Figures:** All numeric financial readings—including tick prices, volume metrics, percentage variations, and order book depths—must utilize tabular lining figures (`font-feature-settings: "tnum" 1, "cv05" 1`). This eliminates cursor jump and horizontal jitter during live streaming ticks.
- **Hierarchy & Proportions:** Headlines remain compact and utilitarian; large display sizes are reserved solely for marquee market tickers or global PnL metrics.
- **Micro-labels:** Category tags, market status badges (e.g., "PRE-MARKET", "EXT"), and table headers use uppercase `label-sm` or `label-md` with slight letter spacing to facilitate fast scanning across expansive data grids.

## Layout & Spacing

The layout model is anchored by a high-density, multi-panel fluid grid system calibrated for multi-window financial workstations:

- **Grid Mechanics:** Workspaces support modular, split-pane architecture (horizontal and vertical split panes) separating chart canvasses, order books, depth charts, and watchlist tables. Panel gutters are locked at `1rem` on desktop (collapsing to hairlines via border division) and `0.75rem` on mobile.
- **Micro-Density Spacing Scale:** Component padding prioritizes maximum vertical data economy:
  - Table rows maintain a compact vertical footprint (28px to 36px total height), utilizing `space-xs` (2px) and `space-sm` (4px) inner paddings.
  - Controls, tab strips, and filter pill containers use `space-md` (8px) gaps to balance interactive target size with spatial efficiency.
- **Responsive Adaptations:**
  - **Desktop (>1280px):** Full multi-pane workflow with persistent watchlists, bottom drawer depth/order terminals, and multi-column comparison tables.
  - **Tablet (768px–1279px):** Collapsible side rails; data tables prioritize primary symbol, last price, and 24h delta while tucking volume and market cap into swipeable columns or modals.
  - **Mobile (<768px):** Single-column stacked interface featuring segmented pill controls, edge-to-edge sparkline rows, and bottom navigation sheets.

## Elevation & Depth

Visual hierarchy does not use diffuse blurs or heavy drop shadows. Depth is conveyed strictly through structural layering and crisp tonal containment:

- **Surface Tiers:**
  - **Layer 0 (Canvas):** `#131722` (primary viewport foundation).
  - **Layer 1 (Panels & Tables):** `#1E222D` (encapsulated cards, watchlists, chart boundaries).
  - **Layer 2 (Overlays & Menus):** `#2A2E39` (contextual dropdowns, order tickets, tooltips, flyout selectors).
- **Hairline Dividers:** Interfaces rely on 1px solid borders (`#2A2E39`) to delineate toolbars, column headers, and docked panels. Active panel states escalate border illumination to `#363A45` or brand blue (`#2962FF`).
- **Data Overlays & Popovers:** Flyout modals and order execution floating windows receive subtle directional depth via a tight, dark shadow (`0 4px 16px rgba(0, 0, 0, 0.45)`) combined with a crisp 1px border (`#363A45`), ensuring separation over live tick charts.

## Shapes

The design system enforces a precision, low-radius shape profile (`roundedness: 1`) to preserve precious visual real estate and communicate technical accuracy:

- **Standard Elements (4px / 0.25rem):** Form inputs, action buttons, table row selections, ticker badges, and alert banners.
- **Grouping Containers (8px / 0.5rem):** Modals, flyout menus, toolbars, and detached chart panels (`rounded-lg`).
- **Segmented Controls & Filter Badges (Full pill or 4px):** Category tabs and ticker tags either use a 4px soft corner for compact inline grids, or complete roundness (`rounded-full`) specifically for micro status indicators, exchange flags, and sparkline hover points.

## Components

### Buttons & Quick Actions
- **Primary Action:** Solid `#2962FF` background, `#FFFFFF` text, 32px height, 4px border-radius, font size 13px weight 600. Hover: `#1E53E5`.
- **Directional Buy/Sell Buttons:** 
  - Buy/Long: Solid `#089981` background, `#FFFFFF` text.
  - Sell/Short: Solid `#F23645` background, `#FFFFFF` text.
- **Ghost/Tertiary:** Transparent background, `#787B86` text, active border 1px `#2A2E39`. Hover: background `#2A2E39`, text `#F0F3FA`.

### High-Density Data Tables
- **Table Headers:** 28px height, `#131722` background, uppercase `label-sm` font in `#787B86`, right-aligned for numeric metrics, left-aligned for asset identifiers.
- **Table Rows:** 36px height, alternating transparent to `#1E222D` base, bottom border 1px solid `#2A2E39`. Hover creates an instant surface shift to `#2A2E39`.
- **Live Cell Flashes:** On price tick up, cell flash background `rgba(8, 153, 129, 0.25)` fading to transparent within 400ms. On price tick down, flash background `rgba(242, 54, 69, 0.25)`.

### Ticker Badges & Directional Chips
- **Delta Pill:** Inline badge displaying price variance (e.g., `+4.82%`). Positive values use `rgba(8, 153, 129, 0.12)` background with `#089981` text. Negative values use `rgba(242, 54, 69, 0.12)` background with `#F23645` text.
- **Asset Ticker:** Display primary symbol (e.g., `BTCUSD`, `NVDA`) in `Inter` weight 600 with white foreground, paired with exchange tag (`NASDAQ`, `BINANCE`) in `#787B86` `data-mono-sm`.

### Sparkline Visual Styling
- Embedded vector charts (50px to 80px width, 24px height).
- Line stroke: 1.5px continuous path. Color matches directional performance: `#089981` if period performance is $\ge 0$, and `#F23645` if $< 0$.
- Gradient fill: Vertical linear gradient from stroke color at 15% opacity to 0% opacity at canvas floor. No axes, grid lines, or ticks within table cells.

### Tabs & Segmented Pills
- **Filter Tabs:** Segmented row on `#131722` track. Active pill features `#2A2E39` background, `#F0F3FA` text, subtle 1px border. Inactive items use transparent backgrounds with `#787B86` text.

### Form Inputs & Order Inputs
- **Numeric Step Inputs:** Dark background `#131722`, 1px border `#2A2E39`, font `data-tabular`. Focus state shifts border to `#2962FF`. Integral step increments (+ / -) sit docked inside the input container.