# Daimidia - Digital Media Catalog Platform Design Guidelines

## Design Approach
**Reference-Based**: Inspired by Canva, Behance, and Dribbble - modern media platforms that prioritize visual content discovery and creative workflows. This approach emphasizes clean card-based layouts, generous whitespace, and intuitive media browsing experiences.

## Core Design Principles
- **Content-First**: Let media assets take center stage with minimal UI interference
- **Clarity & Organization**: Clear visual hierarchy separating admin tools from public browsing
- **Responsive Fluidity**: Seamless experience from mobile to desktop viewing
- **Professional Polish**: Design that inspires trust for marketing professionals

## Color Palette

**Light Mode:**
- Primary: 263 70% 50% (Deep Purple - brand identity, CTAs, active states)
- Background: 0 0% 100% (Pure White - clean canvas for media)
- Surface: 240 5% 96% (Light Gray - cards, input backgrounds)
- Border: 240 6% 90% (Subtle borders and dividers)
- Text Primary: 240 10% 10% (Near Black - headings, labels)
- Text Secondary: 240 5% 45% (Medium Gray - descriptions, metadata)

**Dark Mode:**
- Primary: 263 70% 55% (Brighter Purple for contrast)
- Background: 240 10% 8% (Deep Charcoal - sophisticated dark base)
- Surface: 240 8% 12% (Elevated Dark Gray - cards, panels)
- Border: 240 6% 18% (Subtle dark borders)
- Text Primary: 0 0% 95% (Off White - high contrast readability)
- Text Secondary: 240 5% 65% (Light Gray - secondary information)

**Accent Colors:**
- Success: 142 76% 36% (Green - upload success, confirmations)
- Warning: 38 92% 50% (Amber - alerts, pending states)
- Error: 0 84% 60% (Red - delete actions, validation errors)

## Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI elements, body text, labels
- Display: 'Space Grotesk' (Google Fonts) - headings, brand name, hero text

**Type Scale:**
- Hero: text-5xl md:text-6xl font-bold (Space Grotesk)
- H1: text-4xl font-bold (Space Grotesk)
- H2: text-3xl font-semibold (Space Grotesk)
- H3: text-2xl font-semibold (Inter)
- Body: text-base (Inter)
- Small: text-sm (Inter)
- Tiny: text-xs (Inter)

## Layout System

**Spacing Primitives:** Consistently use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for spacing.
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Grid gaps: gap-4 to gap-8
- Card padding: p-6

**Container Widths:**
- Max content width: max-w-7xl
- Admin content: max-w-6xl
- Cards: Responsive grid with min-w-[280px]

**Grid System:**
- Public Catalog: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- Admin Dashboard: Sidebar (w-64) + Main content (flex-1)

## Component Library

### Navigation
**Public Navbar:**
- Fixed top, backdrop-blur with bg-white/90 dark:bg-gray-900/90
- Height: h-16
- Logo (Daimidia) in Space Grotesk font-bold text-2xl
- Right-aligned login/register or user profile dropdown
- Mobile: Hamburger menu with slide-in drawer

**Admin Sidebar:**
- Fixed left, full height, w-64
- Background: Surface color
- Sections: Dashboard, Media Library, Add New, Categories, Settings
- Active state: Primary color with left border-l-4
- Icons: Heroicons (outline style)

### Cards
**Media Card:**
- Rounded corners: rounded-xl
- Border: border border-gray-200 dark:border-gray-700
- Hover effect: hover:shadow-xl transition-shadow duration-300
- Padding: p-0 (image full-bleed at top)
- Content padding: p-4
- Aspect ratio for media preview: aspect-video for videos, aspect-square for images/logos
- Overlay on hover: gradient overlay with action buttons (view, download, share)

### Forms & Inputs
**Text Inputs:**
- Background: Surface color
- Border: rounded-lg border-2 border-gray-300 dark:border-gray-600
- Focus: border-primary ring-2 ring-primary/20
- Padding: px-4 py-3
- Dark mode: Consistent background matching surface color

**File Upload Zone:**
- Dashed border: border-2 border-dashed rounded-xl
- Hover: border-primary bg-primary/5
- Drag-over state: bg-primary/10 scale-[1.02]
- Preview thumbnails: Masonry-style grid below upload zone

**Buttons:**
- Primary: bg-primary text-white rounded-lg px-6 py-3 font-semibold
- Secondary: bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
- Outline: border-2 border-current bg-transparent backdrop-blur-sm (when over images)
- Hover: Transform and shadow on non-outline buttons

### Data Display
**Filter Bar:**
- Horizontal pill-style buttons
- Selected: bg-primary text-white
- Unselected: bg-surface hover:bg-gray-300 dark:hover:bg-gray-600

**Search Input:**
- Full-width with search icon (Heroicons)
- Same styling as text inputs
- Debounced search with subtle loading indicator

**Tag Pills:**
- Small rounded-full px-3 py-1 text-xs
- Background: Muted primary color (primary/10)
- Border: border border-primary/20

### Overlays
**Modal:**
- Backdrop: bg-black/50 backdrop-blur-sm
- Content: rounded-2xl max-w-2xl bg-surface p-8
- Close button: Top-right with Heroicons X icon

**Toast Notifications:**
- Fixed bottom-right
- Slide-in animation from right
- Auto-dismiss after 4s
- Color-coded by type (success/warning/error)

## Animations

**Subtle, Purposeful Motion:**
- Card hover: transform hover:scale-[1.02] transition-transform duration-200
- Page transitions: Fade in with opacity-0 to opacity-100 over 300ms
- Filter changes: Stagger animation for grid items using Framer Motion
- Upload progress: Smooth progress bar with easing
- Modal entrance: Scale from 0.95 to 1 with fade-in

**Avoid:** Excessive bounce effects, spinning loaders, parallax scrolling

## Page-Specific Layouts

### Public Homepage/Catalog
- No traditional hero section
- Immediate filter bar at top (sticky)
- Search input prominently placed
- Media grid starts immediately below filters
- Infinite scroll or pagination at bottom

### Admin Dashboard
- Sidebar navigation (persistent)
- Top bar with page title and quick actions
- Main content area with stats cards at top (4-column grid showing total media, by type)
- Data table or grid view toggle for media management
- Floating "Add New" button (bottom-right, primary color, rounded-full)

### Authentication Pages
- Centered card on gradient background (primary to lighter shade)
- Logo at top
- Clean form with social login options (Replit Auth)
- Toggle between login/register without page reload

### Media Upload/Edit
- Two-column layout on desktop (form left, preview right)
- Real-time preview updates as user fills form
- Tag input with autocomplete
- Prominent save button (always visible, sticky)

## Images
- **No hero image needed** - This is a utility-focused media catalog, content starts immediately
- **Media thumbnails**: Auto-generated for uploaded files, aspect-ratio preserved
- **Placeholder images**: Use subtle gradient patterns for empty states
- **Admin profile**: Small circular avatar in sidebar and navbar

## Accessibility
- All inputs have visible labels
- Focus states clearly visible with ring
- Color contrast ratios meet WCAG AA standards
- Dark mode maintains consistent readability
- Keyboard navigation fully supported for admin dashboard