# Airlock — Design System

Hard rules (enforced everywhere): no emojis (use Lucide icons), no gradients, no serif or italic type, real footer links, diagrams built in code/SVG only.

## 1. Brand core

- Name: **Airlock**
- Tagline: **Nothing crosses ungoverned.**
- Personality: precise, calm, authoritative, a little severe. A vault door, not a fire alarm.
- Motif: a segmented camera-style **aperture** that opens only on clearance. Lucide `aperture` is the base. No character mascot (it undercuts a governance product).

## 2. Color system

The policy engine's three verdicts ARE the palette. A verdict color only ever means its verdict.

| Token | Hex | Use |
|---|---|---|
| canvas | `#0E1116` | page background |
| panel | `#161A21` | cards, rails |
| border | `#5B6B7E` | hairlines, dividers |
| text | `#E6E9EF` | primary text |
| text-muted | `#8A93A2` | secondary text |
| allow | `#3FB57A` | auto-allow verdict |
| human | `#E0A23B` | require-human verdict |
| deny | `#E0533D` | hard-deny / blocked |

No gradients. Flat fills only. Verdict colors used as solid pills and 2px left-borders on cards.

## 3. Typography

- UI + headings: Geist (or Inter). Weights 400/500/600. No italics.
- Data, verdicts, ledger, policy: Geist Mono (or IBM Plex Mono). Mono signals "machine record."
- Scale: 12 / 14 / 16 / 20 / 28 / 40. Tight tracking on headings (-0.01em).

## 4. Tailwind tokens

```js
// tailwind.config — theme.extend.colors
airlock: {
  canvas: '#0E1116', panel: '#161A21', border: '#5B6B7E',
  text: '#E6E9EF', muted: '#8A93A2',
  allow: '#3FB57A', human: '#E0A23B', deny: '#E0533D',
}
```
Common classes: `bg-airlock-canvas text-airlock-text font-sans`, panels `bg-airlock-panel border border-airlock-border rounded-lg`, mono blocks `font-mono text-sm`.

## 5. Components

- **VerdictPill**: small rounded pill, mono uppercase. allow=green, human=amber, deny=red. `px-2 py-0.5 rounded text-xs font-mono uppercase`.
- **RequestCard**: panel with a 2px left border in the verdict color. Shows requesting agent, action_type, params summary, verdict pill, timestamp (mono).
- **EscalationBanner**: amber, pinned top, "Awaiting your decision" + Approve / Deny buttons (Lucide `check`, `x`).
- **LedgerRow**: mono row, columns: time | agent | action | verdict | human | executed. Blocked rows tinted with `deny` at low opacity.
- **DiffPanel**: two columns, "Raw A2A would have allowed" vs "Airlock gated," blocked items listed under gated.
- **MembraneDivider**: vertical hairline with the aperture glyph centered, separating Outside (untrusted) from Inside (trusted).

Icons (Lucide only): `aperture`, `scan-line`, `shield`, `shield-alert`, `user-check`, `ban`, `banknote`, `database`, `rocket`, `check`, `x`.

## 6. Key screens

### Compliance Ledger (the hero deliverable)
- Header: aperture mark + "Airlock" + room id (mono).
- Main: vertical timeline of LedgerRows, newest at top, grouped by request.
- Right: DiffPanel.
- Empty state: closed aperture glyph + "No requests yet. The airlock is sealed."

### Console (optional, P2)
- Left rail: participants split by MembraneDivider, Outside agents above, Warden + Compliance Officer below.
- Center: live RequestCard stream.
- Right rail: active policy as readable mono rules.
- Escalation state: EscalationBanner pinned.
- Denial success: card collapses to red with "Blocked by policy + human, logged to ledger."

## 7. Landing page structure (if built)

1. Hero: MembraneDivider composition, headline "Nothing crosses ungoverned," one primary button "See the airlock." Graphite canvas.
2. Threat: 3 cards, "An agent can wire money" (`banknote`), "An injected agent can leak data" (`file-warning`), "Raw A2A has no human in the loop" (`user-x`).
3. How it works: code-built 3-lane diagram (Outside / Airlock / Inside).
4. Verdict triad: 3 panels in allow/human/deny.
5. Ledger: mono block of the immutable trail.
6. Footer: real links (docs, GitHub, Band).

## 8. Microcopy

- Auto-allow: "Cleared. Logged."
- Escalation @mention: "Action requires human clearance: {action}. Approve or deny."
- Deny: "Blocked by policy: {rule}. Not executed."
- Rogue caught: "Anomalous request from {agent}. Held at the airlock."
- Ledger footer: "This trail was written by Band. Nothing was added by hand."
