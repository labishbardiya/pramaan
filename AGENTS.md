# Repository instructions

## Continuity protocol

When starting work or receiving a request to continue:

1. Read `AGENT_HANDOFF.md` in full.
2. Read `HANDOFF_PROMPT.md` if the user is transferring the project to another LLM or session.
3. Inspect only the source files needed for the immediate task, then verify handoff claims against the repository.
4. Preserve the product's declared claim boundaries. Do not report roadmap targets or illustrative values as measured results.
5. Before ending non-trivial work, update `AGENT_HANDOFF.md` with the new status, validation, active files, risks and next actions.

The repository contains a project-level handoff-writing skill at `.agents/skills/handoff/SKILL.md`. It is guidance for producing future focused handoffs; `AGENT_HANDOFF.md` remains the canonical current project handoff.
