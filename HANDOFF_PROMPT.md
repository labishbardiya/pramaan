# Copy-paste prompt for the next LLM

Continue the PramaanCV project from the latest `main` branch of https://github.com/labishbardiya/pramaan.

Before planning or editing, read these files in order:

1. `AGENTS.md`
2. `AGENT_HANDOFF.md`
3. `README.md`
4. `benchmarks/registry.json`
5. the task-relevant source and test files

Treat `AGENT_HANDOFF.md` as project state, then verify critical claims against the code. Preserve the explicit product boundaries: PramaanCV is an offline, model-agnostic assurance-case compiler; its innovation is cross-layer evidence handoff; the current vertical slice imports declared detector-output batteries rather than directly executing NIST TrojAI models; a signed receipt supplies tamper evidence under a declared trust model and does not prove model correctness; unsupported cases return `INCONCLUSIVE`.

The team has six members and five planned presenters. Member 6 owns validation/red-team work and serves as the demo and speaking backup. Continue with the first unchecked action in `AGENT_HANDOFF.md`, run the relevant checks, and update the handoff before stopping.
