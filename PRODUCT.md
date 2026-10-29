# Product

## Register

product

## Users

People who run the back office of property management companies, letting agents and landlords with large portfolios, inside the software for most of their working day:

- **Property and leasing officers** letting units, drafting and renewing leases, handling notices, move-ins and move-outs. Many open records at once, constant interruptions from tenants.
- **Accounts clerks** running monthly billing, matching M-Pesa and bank payments to tenants, chasing arrears. High-volume, keyboard-driven, repetitive work where seconds per payment add up to hours at month start.
- **Managers and owners' representatives** approving work orders, write-offs and owner remittances, watching occupancy and arrears. Short, frequent visits that need answers at a glance.
- **Finance and accounting** reconciling bank and mobile-money statements, closing periods, producing owner statements and tax returns. Precision and audit trail matter more than speed.
- **Maintenance coordinators** logging faults, assigning contractors, tracking quotes and costs.

Many of these users already work in spreadsheets, an accounting package with add-ons, or an older property system, and they keep several records open at once.

## Product Purpose

xBO is the system of record for a property management business: properties and units, owners, tenants and leases, rent and service-charge billing, metered utilities, collections and arrears, deposits, maintenance and inspections, owner statements and remittances, and the accounting under all of it. It runs in the browser and as a desktop app, and connects to payment services, tenant portals, banks and messaging providers through an open integration API.

Success: a property manager sees it once and believes it is the most carefully made business software they have used; clerks match the month's payments faster than they did in spreadsheets; owners and finance trust every number.

## Brand Personality

**Precise, calm, trustworthy.**

- Voice: plain, exact, unhurried. Labels say what things are; messages say what happened and what to do next. No hype, no jokes in workflows.
- Feel: native OS-grade, as if Apple or Microsoft had built a property back office. Restrained, quietly confident, nothing decorative.
- Emotional goal: control. The user always knows where they are, what changed, and that nothing was lost.

References and what to take from each:
- **macOS apps (Finder, Mail):** the menu bar, toolbars and sidebars, keyboard-first operation, pixel-level precision.
- **Windows 11 (Settings, Explorer):** Fluent materials used with restraint, snap layouts, the centred taskbar, clear typographic hierarchy.
- **Linear:** speed, the command palette, keyboard shortcuts everywhere, restraint in colour.
- **Bloomberg / Excel:** information density and grid editing that experts trust.

## Anti-references

- **SAP GUI / classic SAP:** grey forms, cryptic transaction codes, dated chrome, modal walls.
- **Generic SaaS admin:** the sidebar + stat cards + charts template every startup ships.
- **Odoo and typical web ERPs:** busy pages, inconsistent screens, form-after-form navigation that loses context.
- **Over-styled glass UI:** heavy blur, gradients and effects that hurt readability. Translucency is allowed only where the OS itself uses it (menu bar, taskbar, popovers), and never behind data.

## Design Principles

1. **The desktop is the workspace.** Several documents live side by side in windows; nothing important hides behind navigation that throws away context.
2. **Density with clarity.** Show more data per screen than a web app would, but every column, label and number stays legible and aligned. Hierarchy comes from typography and spacing, not boxes and colour.
3. **Keyboard first, mouse welcome.** Every action has a shortcut and a palette entry; tab order, Enter and Esc behave exactly as users expect from desktop software.
4. **Calm by default, loud only when it matters.** Colour signals state (blocked, overdue, failed sync), never decoration. When something needs attention, it is unmistakable.
5. **Nothing surprises finance.** Posted means final, changes are traceable, numbers are exact and consistently formatted.

## Accessibility & Inclusion

- **WCAG 2.2 AA** across web and desktop: full keyboard operation, visible focus, 4.5:1 text contrast (3:1 for large text and UI components), target sizes, screen-reader names for every control.
- Respect `prefers-reduced-motion`, `prefers-contrast` and a reduce-transparency setting (menu bar, taskbar and popovers fall back to opaque surfaces).
- Status is never colour-only: pair colour with icon and text, safe for colour-blind users.
- Text scales to 200% without loss of content; a compact and a comfortable density mode.
