# Teacher Portal Design Direction

## Three stylistic approaches

### Theme Name: Editorial Signal
Very Brief Intro: A calm editorial SaaS identity with warm paper, ink, and a precise teal signal color. It makes complex teacher workflows feel considered, legible, and trustworthy.
Probability: 0.07

### Theme Name: Quiet Observatory
Very Brief Intro: A dark, observatory-inspired interface with restrained blue light, glass surfaces, and analytical focus. It emphasizes insight and concentration without becoming futuristic or playful.
Probability: 0.03

### Theme Name: Civic Learning Studio
Very Brief Intro: An institutional-modern system using mineral neutrals, terracotta accents, and generous modular panels. It feels established enough for schools while remaining approachable for daily use.
Probability: 0.09

## Chosen approach: Editorial Signal

### Design Movement
Contemporary editorial modernism blended with Swiss information design: generous margins, strong typographic hierarchy, asymmetrical composition, and functional ornament.

### Core Principles
1. Make the state of the product legible before making it decorative.
2. Use whitespace and typography as the primary navigation system.
3. Treat empty states as intentional editorial moments, never as missing polish.
4. Use one precise accent color to distinguish action from information.

### Color Philosophy
Warm paper (`#F5F2EA`) keeps the interface human and grounded; ink navy (`#152735`) gives institutional authority; moss (`#657365`) adds quiet utility; and signal teal (`#0E8F86`) marks actions and live system feedback. The palette should feel like a well-designed faculty workspace, not a children's app or a generic startup dashboard.

### Layout Paradigm
Landing pages use a split editorial composition with an offset visual field and a narrow reading measure. Dashboard pages use a persistent left rail, a broad content canvas, and deliberately uneven content bands rather than a uniform card grid.

### Signature Elements
1. Hairline rules and small uppercase section labels that behave like editorial annotations.
2. A signal teal vertical marker on active navigation and primary actions.
3. Large outlined numerals / glyph-like shapes used sparingly as visual anchors in empty and loading states.

### Interaction Philosophy
Interactions should feel direct and calm: strong focus rings, visible state changes, no hidden magic, and action labels that state the result. Empty states should offer the next useful action without pretending the system has data it does not have.

### Animation
Use 160–220ms ease-out transitions for buttons, navigation, accordions, and status changes. Stagger page-intro elements by 40ms. Use low-amplitude translateY and opacity only; avoid bouncy motion. Respect `prefers-reduced-motion` and disable non-essential transitions when requested.

### Typography System
Display: `DM Serif Display` for hero and major page titles. Body/UI: `Manrope` for readable labels, controls, tables, and metadata. Use tight display tracking, 600–800 UI weights for hierarchy, and small uppercase labels with 0.14em tracking for navigation context.

### Brand Essence
A teacher-only command center for turning curriculum into clearer quizzes and student insight, built for educators who value evidence over noise. Personality: precise, composed, generous.

### Brand Voice
Headlines are confident and specific. CTAs describe the next action. Microcopy is clear about loading, empty, and error states without being apologetic or vague.

Example lines:
- “Turn the next lesson into a better question.”
- “Your classroom signal, in one clear view.”

### Wordmark & Logo
A compact signal-mark: three offset vertical bars forming an abstract open book / waveform, paired with a custom wordmark treatment. The mark should be a bold symbol without text so it can anchor the sidebar and favicon.

### Signature Brand Color
Signal teal `#0E8F86` — the ownable action color that represents a teacher turning raw curriculum into a readable signal.

## Implementation reminder
This project is frontend-only and backend-driven. No demo records, seeded values, fabricated chart points, fake names, fake credentials, or placeholder application statistics may be introduced. Every data-bearing component must support loading, success, empty, error, and partial-data states. React source files must use `.jsx`; do not add `.ts` or `.tsx` React components.

## Style Decisions
- Use Editorial Signal consistently across the landing page, authentication, and dashboard.
- Prefer real empty states to visual filler when backend data is unavailable.
- Use custom generated brand imagery only for the landing hero; dashboards remain data-first.
- Keep decorative visuals subordinate to teacher workflow clarity.
