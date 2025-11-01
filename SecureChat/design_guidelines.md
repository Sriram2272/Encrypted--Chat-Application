# Encrypted Chat Application - Design Guidelines

## Design Approach

**Selected Approach:** Design System-Based (Linear + Slack inspired)

**Justification:** This is a utility-focused, security-critical communication application requiring clarity, trust, and efficiency. Drawing inspiration from Linear's clean interface and Slack's messaging patterns ensures professional appearance while maintaining functional excellence.

**Core Principles:**
- Security-first visual language (clear, trustworthy, no-nonsense)
- Dual-interface clarity (distinct but cohesive Admin vs User experiences)
- Information hierarchy for encrypted content visibility
- Minimal cognitive load for secure communications

---

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - UI elements, body text
- Monospace: JetBrains Mono - encryption keys, technical data

**Type Scale:**
- Large headings: `text-3xl font-semibold` (Dashboard titles)
- Section headers: `text-xl font-semibold` (Panel headers)
- Body text: `text-base font-normal` (Messages, descriptions)
- Small text: `text-sm font-medium` (Timestamps, metadata)
- Micro text: `text-xs font-normal` (Helper text, encryption status)
- Technical data: `font-mono text-sm` (Keys, encrypted content preview)

**Line Height:**
- Headings: `leading-tight`
- Body: `leading-relaxed`
- Technical: `leading-normal`

---

## Layout System

**Spacing Primitives:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24

**Application Structure:**

**Authentication Pages (Login/Register):**
- Centered card layout: `max-w-md mx-auto`
- Vertical spacing between form elements: `space-y-6`
- Card padding: `p-8`
- Form input spacing: `space-y-4`

**User Chat Interface:**
- Two-column layout: Sidebar (w-80) + Chat area (flex-1)
- Sidebar: User list, fixed width, full height
- Chat area: Header (h-16) + Messages (flex-1) + Input (h-20)
- Message spacing: `space-y-3`
- Chat padding: `px-6 py-4`

**Admin Dashboard:**
- Single column layout with sections: `max-w-7xl mx-auto px-8`
- Section spacing: `space-y-8`
- Card grid for users: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Message metadata table: Full width with `divide-y`

**Container Strategy:**
- Auth pages: `min-h-screen flex items-center justify-center`
- App interfaces: `h-screen flex` (no scrolling, fixed viewport)
- Content areas: Use natural scroll within sections

---

## Component Library

### Navigation & Headers

**Top Bar (Both Interfaces):**
- Height: `h-16`
- Padding: `px-6`
- Layout: `flex items-center justify-between`
- Elements: Logo/title (left), user info + logout (right)

**User Sidebar:**
- Width: `w-80`
- Padding: `p-4`
- User list items: `p-3 rounded-lg` with `space-y-2` between
- Active user indicator: Bold text + visual marker

### Forms & Inputs

**Text Input:**
- Height: `h-12`
- Padding: `px-4`
- Border radius: `rounded-lg`
- Focus state: Ring with `focus:ring-2 focus:ring-offset-2`

**Password Input:**
- Same as text input with visibility toggle icon (absolute positioned right-4)

**Key Input (Admin):**
- Monospace font
- Height: `h-10`
- Full width with copy button on right

**Button - Primary:**
- Height: `h-12`
- Padding: `px-6`
- Border radius: `rounded-lg`
- Font: `font-semibold`
- Transition: `transition-all duration-200`

**Button - Secondary:**
- Same sizing as primary
- Border: `border-2`

**Button - Small:**
- Height: `h-8`
- Padding: `px-3`
- Text: `text-sm`

### Messages & Chat

**Message Bubble:**
- Max width: `max-w-lg`
- Padding: `px-4 py-3`
- Border radius: `rounded-2xl`
- Sent messages: Align right with `ml-auto`
- Received messages: Align left with `mr-auto`

**Message Metadata:**
- Text: `text-xs`
- Spacing: `mt-1`
- Layout: Timestamp + encryption status icon

**Message Input Area:**
- Height: `h-20`
- Padding: `px-6 py-4`
- Border top: `border-t`
- Layout: `flex items-center space-x-4`
- Input: Flex-1 with button on right

### Admin Components

**User Card:**
- Padding: `p-6`
- Border radius: `rounded-xl`
- Border: `border`
- Layout: Vertical stack with `space-y-4`
- Elements: Username header, public key preview (truncated), status badges, action buttons

**Message Metadata Table:**
- Row height: `h-14`
- Cell padding: `px-4 py-3`
- Headers: `text-sm font-semibold uppercase tracking-wide`
- Hover state on rows for interaction

**Decryption Panel:**
- Padding: `p-6`
- Border radius: `rounded-xl`
- Layout: Key input + decrypt button + decrypted message display
- Message display: `p-4 rounded-lg font-mono text-sm`

### Status & Feedback

**Encryption Status Badge:**
- Size: `inline-flex items-center px-2.5 py-0.5`
- Text: `text-xs font-medium`
- Border radius: `rounded-full`
- Icon + text combination

**User Status Indicator:**
- Size: `w-2.5 h-2.5 rounded-full`
- Position: Absolute on user avatar/name

**Toast Notifications:**
- Position: Fixed top-right with `top-4 right-4`
- Width: `w-80`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Animation: Slide in from right

### Data Display

**Empty State:**
- Centered: `flex flex-col items-center justify-center`
- Icon: Large (w-16 h-16)
- Spacing: `space-y-4`
- Text: `text-center max-w-md`

**Loading State:**
- Spinner: `w-8 h-8 border-4 rounded-full animate-spin`
- Container: `flex items-center justify-center`

**Encrypted Content Preview:**
- Font: `font-mono text-xs`
- Display: Truncated with ellipsis `truncate`
- Max width based on container

---

## Page-Specific Layouts

### Login/Register Pages
- Background: Full viewport
- Card: Centered with `max-w-md`
- Logo/title at top: `text-3xl font-bold mb-8`
- Form fields: `space-y-4`
- Submit button: Full width `w-full`
- Footer link: `text-sm text-center mt-6`

### User Chat Interface
- Full height layout: `h-screen flex`
- Sidebar: Fixed width, scrollable user list
- Main area: `flex-1 flex flex-col`
- Header: Fixed with active conversation name
- Messages: Scrollable area with `flex-1 overflow-y-auto`
- Input: Fixed at bottom

### Admin Dashboard
- Main container: `max-w-7xl mx-auto px-8 py-8`
- Header section: `mb-8` with title and stats
- Users section: Grid layout with cards
- Messages section: Table with search/filter above
- Decryption panel: Modal or side panel

---

## Interaction Patterns

**Message Sending:**
- Input focus on conversation select
- Enter to send, Shift+Enter for new line
- Clear input on send
- Optimistic UI update

**User Selection:**
- Highlight active conversation
- Unread message indicator
- Click to switch conversations

**Admin Actions:**
- Confirmation modal for disable/enable
- Inline decrypt with collapse/expand
- Hover states on all interactive elements

**Key Management:**
- Copy-to-clipboard buttons with feedback
- Password visibility toggles
- Key export as download button

---

## Accessibility

- All interactive elements: `focus:outline-none focus:ring-2`
- Form labels: Always visible, `text-sm font-medium mb-2`
- Icon buttons: Include aria-label
- Color contrast: Ensure WCAG AA compliance
- Keyboard navigation: Tab order follows visual flow
- Screen reader text where needed: `sr-only` class

---

## Visual Hierarchy

**User Interface Priority:**
1. Active conversation messages (largest, most prominent)
2. Message input (accessible, clear affordance)
3. Conversation list (scannable, clear selection state)
4. Header/metadata (present but understated)

**Admin Interface Priority:**
1. Critical actions (disable user, decrypt message)
2. User information and status
3. Message metadata table
4. System information/stats

---

## Trust & Security Visual Language

- Use lock icons consistently for encryption status
- Show encryption indicators prominently but not intrusively
- Monospace font for all cryptographic data
- Clear visual distinction between encrypted/decrypted states
- Warning states for security-critical actions (distinct styling)
- Success confirmations for encrypted sends

---

## Responsive Considerations

**Desktop (lg+):** Full two-column chat layout, three-column admin grid
**Tablet (md):** Collapsible sidebar, two-column admin grid
**Mobile (base):** Single column, overlay sidebar, stacked admin cards

**Breakpoint Strategy:**
- Mobile first: Base styles for small screens
- Tablet: md: prefix for 768px+
- Desktop: lg: prefix for 1024px+