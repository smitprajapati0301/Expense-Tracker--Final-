---
name: Trackify Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#424754'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#b61722'
  on-tertiary: '#ffffff'
  tertiary-container: '#da3437'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  screen-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 40px
---

## Brand & Style
The design system is engineered for a premium, mobile-first financial experience that balances professional utility with an approachable, editorial aesthetic. The brand personality is "The Sophisticated Assistant"—precise and reliable, yet warm and encouraging. 

The visual style leverages **Minimalism** with **Glassmorphism** accents. It prioritizes clarity and whitespace to reduce the cognitive load associated with financial data. The interface feels light and airy, using high-quality typography and subtle depth to guide the user's eye effortlessly across their spending narrative. The emotional goal is to transform expense tracking from a chore into a high-end personal management experience.

## Colors
This design system utilizes a semantic color palette designed for high legibility in both light and dark modes. 

- **Primary (Vibrant Blue):** Used for primary actions, active states, and brand-heavy elements.
- **Income (Green) / Expense (Red):** Used strictly for financial directionality.
- **Warning (Orange):** Reserved for budget alerts and pending sync states.
- **Neutral:** A refined gray scale used for secondary text and decorative borders.

In **Dark Mode**, surfaces shift to deep navy/charcoal tones (`#111827`) to maintain the premium feel while reducing eye strain during night-time reviewing.

## Typography
The typography strategy pairs **Libre Caslon Text** (for a high-end editorial feel) with **Plus Jakarta Sans** (for a friendly, modern functional feel).

- **Headlines:** Use the serif font for page titles, large balance displays, and empty state headings to evoke a "financial journal" aesthetic.
- **Body & Interface:** Use the sans-serif for all transactional data, labels, and descriptions. It is optimized for small-screen readability and a warm, optimistic tone.
- **Emphasis:** Numerical data should use medium or semi-bold weights of the sans-serif font to ensure figures are the first thing scanned.

## Layout & Spacing
The layout is built on a strict **8px grid system** to ensure mathematical harmony across all components.

- **Screen Margins:** A generous **24px horizontal padding** is maintained on all mobile screens to give content room to breathe and avoid the "cluttered finance" trope.
- **Vertical Rhythm:** Elements are stacked using 8px increments. Related items use 8px or 16px, while distinct sections use 24px to 40px gaps.
- **Mobile-First Constraints:** Content should prioritize a single-column flow, with horizontal scrolling reserved strictly for card-based dashboards or category chips.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Glassmorphism**.

- **Surfaces:** The base background is the lowest layer. Content sits on elevated white (light mode) or charcoal (dark mode) cards.
- **Shadows:** Use extremely soft, large-radius shadows (e.g., `box-shadow: 0 10px 30px rgba(0,0,0,0.04)`) to make cards appear to float gently.
- **Glassmorphism:** Navigation bars and "Add" button backgrounds should use a backdrop-blur (12px - 16px) with a semi-transparent fill (80% opacity) to maintain a sense of context and vertical depth.
- **Outlines:** Use subtle 1px borders in a slightly darker/lighter shade than the surface to define boundaries without adding visual weight.

## Shapes
The shape language is "Generously Rounded," reinforcing the friendly and premium nature of the brand.

- **Large Cards:** Utilize a 24px corner radius (`rounded-xl` in this system) to create a soft, inviting container for data.
- **Standard UI Elements:** Buttons and input fields use a 16px radius to maintain consistency with the cards while appearing slightly more "contained."
- **Interactive Icons:** Small interactive elements like category icons use 12px or fully rounded (pill) shapes for distinctiveness.

## Components
- **Buttons:** Minimum height of **52px** for primary actions to ensure thumb-friendly targets. Primary buttons use a vibrant blue background with white text; secondary buttons use a light-gray or glass-style background.
- **Cards:** The core of the experience. Cards must feature 24px rounded corners and swipe-to-action functionality (e.g., swipe left to delete, right to categorize).
- **Navigation:** A fixed 5-tab bottom bar with a centered, floating 'Add' button. The 'Add' button should be visually distinct (Primary color with a subtle glow shadow).
- **Bottom Sheets:** All dialogs, filters, and transaction entries must use bottom sheets rather than centered modals to maintain mobile-first ergonomics.
- **Input Fields:** Large, 52px height fields with 16px rounding. The active state is indicated by a 2px primary blue border.
- **Chips:** Small, pill-shaped tags used for filtering categories, utilizing a 12px font size and bold weights.
- **Lists:** Transaction lists should be grouped by date, with each entry separated by a subtle 8px vertical gap rather than a traditional divider line.