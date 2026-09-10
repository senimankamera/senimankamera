---
name: Monochrome Editorial
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: '600'
    lineHeight: 84px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  stack-lg: 120px
  stack-md: 64px
---

## Brand & Style

This design system is crafted for a premium photography portfolio, emphasizing the "artist behind the lens" narrative. The aesthetic is rooted in **Minimalism** and **Editorial Design**, where the UI serves as a sophisticated frame for the photography. By stripping away color distractions, the focus is entirely on light, composition, and emotion.

The brand personality is quiet, confident, and timeless. It caters to high-end clients in the wedding and luxury event space who value intentionality and artistic precision. The visual language uses generous negative space to create a "gallery-on-the-web" experience, ensuring every image feels like a curated piece of art.

## Colors

The palette is strictly monochromatic to maintain a high-fashion, professional atmosphere.

*   **Deep Black (#000000):** Used for primary typography, borders, and high-impact structural elements. It provides the "ink-on-paper" feel.
*   **Pure White (#FFFFFF):** The primary canvas color. Large expanses of white are used to create breathing room between photographic works.
*   **Sophisticated Grays:** 
    *   `#F5F5F5` for subtle background sectioning.
    *   `#717171` for secondary text and disabled states, ensuring legibility without competing with primary content.

## Typography

The typographic strategy relies on a classic high-contrast pairing. 

**Playfair Display** is used for all headings. Its delicate serifs and variable stroke widths evoke luxury and editorial authority. For large display moments, use semi-bold weights with tight letter spacing to create a cinematic impact.

**Manrope** serves as the functional workhorse for body copy and navigation. It is a modern, geometric sans-serif that remains highly legible at small sizes without detracting from the artistic serif.

**Styling Note:** Use `label-caps` for category tags (e.g., "WEDDING", "PREWEDDING") and small navigation items to provide a structured, architectural feel to the layout.

## Layout & Spacing

The layout follows a **Fluid Grid** model with extreme "Macro-spacing" to emphasize luxury.

*   **Grid:** A 12-column grid is used for desktop. However, content should rarely span the full width. Use asymmetrical offsets (e.g., an image spanning columns 2 through 10) to create an organic, artistic rhythm.
*   **Vertical Rhythm:** Use `stack-lg` (120px) between major sections to ensure no two photoshoot galleries feel crowded.
*   **Mobile Adaptation:** On mobile, margins reduce to 24px and the grid collapses to a single column. Horizontal scrolling "carousels" are preferred over long vertical stacks for gallery previews to maintain a compact, clean feel.

## Elevation & Depth

This design system avoids heavy shadows in favor of **Tonal Layers** and subtle depth cues.

*   **Soft Shadows:** When depth is required (e.g., on hover over a gallery card), use a very large blur radius (30px+) with extremely low opacity (4-6% black). The effect should be felt rather than seen, mimicking a print photograph resting on a white surface.
*   **Dividers:** Use hairline borders (1px) in `#F5F5F5` or `#E0E0E0` instead of shadows to separate content sections.
*   **Image Treatments:** Images are the primary "elevation" elements. Use a slight scale-up transform (e.g., scale 1.02) on hover to create a sense of physical interaction.

## Shapes

The shape language is primarily **Rectilinear with Softened Edges**.

While the layout is structured and grid-based, a "Soft" roundedness (`0.25rem`) is applied to image containers and buttons. This prevents the design from feeling too "sharp" or aggressive, aligning with the romantic and emotional nature of wedding and event photography. 

Buttons should maintain this subtle radius to feel modern but grounded. Interactive elements like "View Gallery" or "Book Session" should feel like high-quality physical stationery.

## Components

### Buttons
*   **Primary:** Solid Black background with White text. No border. Subtle hover state: 85% opacity.
*   **Secondary:** Ghost style. Transparent background with a 1px Black border. 

### Input Fields
*   Minimalist design: Only a bottom border (1px Black). Labels use `label-caps` positioned above the line. Focus state thickens the bottom border to 2px.

### Image Cards (Portfolio)
*   Large, high-resolution containers.
*   Captions appear in `Playfair Display` (Headline-md) beneath the image, left-aligned.
*   Category tags appear above the headline in `label-caps`.

### Navigation
*   Top-fixed but transparent. The logo (based on the provided brand mark) is centered.
*   Links are right-aligned, using `Manrope` at 14px with high letter-spacing.
*   Minimalist "Hamburger" menu for mobile, opening to a full-screen white overlay.

### Chips/Tags
*   Simple text with a `label-caps` style. No background fill. Separated by a middle dot (•) or a thin vertical pipe.