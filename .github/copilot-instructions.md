## Design Context

### Users

- **Primary Audience**: Potential clients seeking freelance/consulting services
- **Context**: Professionals evaluating portfolio for technical competence and fit
- **Job to be Done**: Quickly assess skills, see past work, and make contact decisions
- **Secondary Audience**: Developer peers and collaborators

### Brand Personality

- **Three Words**: sharp, arcane, mechanical
- **Voice & Tone**: Technical depth over polish, unconventional but competent, hints at hidden complexity (arcane)
- **Emotional Goals**: Evoke sophistication, cutting-edge expertise, and mechanical precision while avoiding corporate stiffness
- **Origin**: Evolved organically from a personal Linktree clone into something more substantial

### Aesthetic Direction

- **Visual Tone**: Technical, precise, slightly mysterious (arcane), mechanical/structured
- **Theme Strategy**: The existing multi-theme system aligns well with the "arcane" personality—hidden depths, different modes, easter eggs
- **Anti-References**: Corporate/stiff, over-designed, generic templates, overly trendy styles
- **Theme Preferences**: Current themes (Matrix, Dracula, Catppuccin) already match the technical/arcane vibe well

### Design Principles

1. **Precision Over Polish**: Favor exact, clean implementations over flashy visuals. Mechanical implies structure and accuracy.

2. **Arcane Depth**: The interface should hint at hidden complexity—console easter eggs, theme switching, subtle interactions that reward exploration without overwhelming primary tasks.

3. **Technical Authenticity**: The design should feel built by a developer for developers. Avoid generic portfolio tropes; embrace the code-forward aesthetic.

4. **Client-Focused Clarity**: Despite the technical personality, information must be immediately scannable for potential clients evaluating work and contact options.

5. **Controlled Chaos**: Multiple themes and visual modes are acceptable as they serve the "arcane" personality, but maintain consistent UX patterns and information hierarchy across all themes.

### Technical Context

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (layout) + CSS Modules (theming)
- **Typography**: Raleway (headings), Roboto (body)
- **Theme System**: 7+ dynamic themes with CSS custom properties
- **CMS**: Contentful with static fallback
- **Constraints**: Pre-commit hooks, PR-first workflow, Vitest testing
