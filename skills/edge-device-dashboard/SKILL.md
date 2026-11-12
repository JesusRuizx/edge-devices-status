# Skill: edge-device-dashboard

**Related base skill:** `agent-customization`

## Purpose
Provide a reusable, workspace-scoped skill that extracts a step-by-step workflow from a conversation about building or improving the Edge Device Dashboard, drafts a `SKILL.md` following the `agent-customization` guidelines, and iterates with the user until the skill is complete.

## Scope
- Workspace-scoped (saved under `skills/edge-device-dashboard/SKILL.md`).
- Intended for repo maintainers and automation in this repository.

## When to run
- User asks to "create a SKILL.md" or "draft a skill" for the Edge Device Dashboard.
- When a multi-step workflow emerges from a conversation and the user wants it formalized.

## Inputs
- Conversation history (chat transcript or selection).
- Target name: `edge-device-dashboard` (defaults to repo name if omitted).
- Optional: example files, existing docs, desired triggers, or scope details.

## Outputs
- A draft `SKILL.md` saved to `skills/edge-device-dashboard/SKILL.md`.
- A short list of clarifying questions when parts are ambiguous.
- Example prompts and suggested next customization files (e.g., `agent.md`, `.instructions.md`).

## Step-by-step workflow
1. Review conversation or provided artifacts and identify the workflow steps being followed.
2. Extract and generalize:
   - The ordered steps/tasks.
   - Decision points and branching logic (if/else conditions).
   - Quality checks and completion criteria.
3. If the workflow is unclear or missing details, generate targeted clarifying questions for the user.
4. Draft `SKILL.md` using the `agent-customization` template and workspace conventions.
5. Save the draft in `skills/edge-device-dashboard/SKILL.md`.
6. Present the draft to the user with example prompts and recommended follow-ups.
7. Iterate: accept user feedback, adjust the workflow, and update the skill until acceptance.

## Decision points
- If the conversation contains an explicit checklist, use it as primary source.
- If no clear workflow emerges, ask the user the minimum clarifying questions (see below).
- If the user requests a personal-scoped skill, advise moving file under their user prompts directory and adjust scope.

## Clarifying questions (use when needed)
- What exact outcome should this skill produce (e.g., scaffold files, lint rules, CI job)?
- Should the skill be workspace-scoped or personal to your environment?
- What triggers should run the skill (chat command, file save, CLI)?
- Any required inputs or secrets the skill must accept (non-sensitive placeholders only)?

## Quality criteria / completion checks
- The skill includes a clear list of steps and decision points.
- Triggers and inputs are documented.
- Example prompts demonstrate typical usage.
- The saved `SKILL.md` path matches repository conventions.

## Example prompts to run this skill
- "Create a SKILL.md for edge-device-dashboard from this conversation." 
- "Extract the workflow and draft a skill to scaffold dashboard components." 
- "Iterate the skill to include CI checks and deployment steps."

## Suggested next customizations
- Add an `agent.md` describing agent persona and constraints.
- Create `.instructions.md` for interactive questions the skill should ask.
- Add sample prompt templates under `prompts/edge-device-dashboard/`.

## Notes for maintainers
- Keep the skill concise and focused on reproducible steps.
- Avoid embedding secrets or sensitive data; skills may be shared.
- When in doubt, prefer minimal clarifying questions to unblock drafting.

---

_Drafted by an automation to bootstrap `edge-device-dashboard` skill. Update the file with repo-specific triggers or examples as needed._
