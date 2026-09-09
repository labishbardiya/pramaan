# Handoff: PramaanCV / SIH26228

## Objective

Win the SIH 2026 internal round and develop a credible national-stage entry for **SIH26228**. PramaanCV is an **offline assurance-case compiler for computer vision**: it connects evidence about contributed training data, supplied models, distribution shift and protected inference records, then gives an analyst a reviewable `ACCEPT`, `REVIEW`, `QUARANTINE` or `INCONCLUSIVE` disposition.

Completion for the current internal-round package means:

- a polished 9–10 minute deck with a connected story and no mention of any alternative problem statement;
- a substantial offline web prototype that can be demonstrated without external services;
- accepted public benchmark sources and evidence-backed claims;
- a zero-to-one guide for all six team members, with five planned presenters;
- explicit next gates for the national submission;
- a repository-local handoff that another LLM can resume without chat history.

## Current state

Status on 10 September 2026: **internal-round package implemented and validated**.

Completed:

- SIH26228 selected and positioned as a lifecycle assurance problem.
- Product name, one-line definition, architecture, threat boundaries and innovation hypothesis finalized.
- Fourteen-slide story deck created and visually inspected slide by slide.
- Twenty-page team playbook created and visually inspected page by page.
- Six-member ownership defined; Members 1–5 present, Member 6 is validation/red-team and demo/speaker backup.
- Dependency-free Node.js prototype implemented.
- Automated prototype tests pass.
- Public benchmark registry added.
- Project-local handoff skill and continuity instructions added.

The current prototype is a defensible vertical slice, not the completed national benchmark system. Direct execution of NIST TrojAI Round 13 models is the first national-stage engineering gate.

## Product definition

Use this sentence consistently:

> PramaanCV is an offline release gate that connects integrity evidence from computer-vision data, models and inference records into an analyst disposition.

### Official problem capabilities

The solution must cover five related questions while remaining offline and declaring access limitations:

1. **Data integrity:** which samples, labels, boxes or contributors look suspicious?
2. **Model integrity:** does the supplied model exhibit anomalous or trigger-conditioned behavior?
3. **Inference provenance:** can alteration, substitution or replay of a result be detected?
4. **Distribution shift:** did terrain, sensor, weather, illumination or another operating condition move away from the reference?
5. **Analyst governance:** what evidence supports accept, review, quarantine or an inconclusive result?

Supported input direction: COCO/YOLO data plus ONNX, PyTorch and TorchScript model adapters. The evidence and policy schema stays model-agnostic; framework-specific loading belongs behind adapters and restricted workers.

## Innovation that must be defended

The differentiator is **evidence handoff across layers**.

Example: a repeated trigger-like patch concentrated in one contributor’s images becomes a targeted reference-battery hypothesis for the supplied model. If the same patch changes the same class behavior, the case strengthens. The resulting inference receipt binds the exact input, model, preprocessing, configuration and output so the evidence remains traceable.

Testable hypothesis:

> Cross-layer evidence improves attack detection or reduces analyst review time at the same clean false-positive rate compared with isolated detectors.

Kill signal: if matched-FPR experiments show no improvement in detection or analyst review time, reduce the novelty claim and retain only components supported by results.

Do not position Arduino or any specific board as the innovation. Hardware is only an optional deployment target.

## Non-negotiable claim boundaries

Do not say:

- “100% secure” or “detects every backdoor.”
- “C2PA compliant” unless conformance is actually assessed.
- “Blockchain makes it trusted.” The core uses an offline signed append-only hash chain.
- “The model achieved…” for any target metric that has not been measured.
- “The prototype executes all NIST Round 13 models.” It currently evaluates imported detector-output summaries.
- “A valid receipt proves the prediction is correct.” It proves protected association and tamper state under the declared key and execution trust model.

`INCONCLUSIVE` is a correct outcome when access or evidence cannot support a stronger claim. Universal adversary-unaware backdoor detection is impossible under broad assumptions, so coverage and the threat model must always be declared.

## Evidence and datasets

Do not invent the primary benchmark.

### Primary benchmark: NIST TrojAI Round 13

- 128 training models, 192 test models, 192 holdout models.
- Object detectors: SSD, Faster R-CNN and DETR.
- Attack effects include misclassification, evasion, localization and injection.
- Includes conditional triggers and spurious triggers on clean controls.
- Documentation: https://pages.nist.gov/trojai/docs/object-detection-feb2023.html
- NIST data record: https://data.nist.gov/od/id/mds2-2959

### Supporting benchmarks

- **NIST TrojAI Round 10:** smaller COCO-based fallback; 144 models in each split; SSD and Faster R-CNN. https://pages.nist.gov/trojai/docs/object-detection-jul2022.html
- **COCO-O:** natural distribution-shift benchmark; 6,782 real images, six domains, 80 COCO classes. https://github.com/alibaba/easyrobust/tree/main/benchmarks/coco_o
- **COCO 2017 + ObjectLab method:** clean data format and label/box quality evaluation. https://arxiv.org/abs/2309.00832
- **Receipt attack harness:** deterministic alteration, substitution and replay transformations. This is a protocol test harness, not an ML dataset.

Problem-validation facts used in the deck:

- NIST reported more than 14,000 released AI models for public Trojan research by its February 2025 update.
- IARPA’s TrojAI final report states only one Round 13 team produced detectors meeting the threshold; its ten detectors averaged 0.898 ROC-AUC.
- COCO-O reported a 55.7% relative Faster R-CNN performance drop under natural distribution shifts.
- AISTATS 2024 established limits on universal adversary-unaware backdoor detection.

Source URLs are in the deck speaker notes, playbook and `README.md`. The machine-readable registry is `benchmarks/registry.json`.

Benchmark discipline:

- develop on the public training split;
- freeze thresholds before test/holdout evaluation;
- never leak clean/poison labels into features;
- report results by architecture, source domain and attack family;
- preserve spurious-trigger clean controls;
- store large benchmark assets outside Git and record URL, license, checksum and local path.

## Current prototype

### Runtime

- Node.js 20 or newer.
- No npm runtime dependencies.
- Server binds only to `127.0.0.1:8787`.

Run:

```bash
npm test
npm start
```

Open http://127.0.0.1:8787.

### Implemented capabilities

1. **COCO audit**
   - schema and category checks;
   - invalid and out-of-bounds boxes;
   - orphan and duplicate annotations;
   - contributor/source aggregation.

2. **Behavioral output battery**
   - imports declared clean and triggered detector-output summaries;
   - detects evasion, injection/misclassification and localization deltas;
   - does not yet load and execute NIST models directly.

3. **Signed receipts**
   - SHA-256 input, model, preprocessing and output digests;
   - canonical JSON signed with Ed25519;
   - timestamp, nonce, sequence and previous-record hash;
   - append-only JSONL ledger.

4. **Receipt verification**
   - signature mismatch detection after protected-field tampering;
   - defined replay/freshness checks;
   - process-local signing key in the prototype.

5. **Decision compiler**
   - produces `ACCEPT`, `REVIEW`, `QUARANTINE` or `INCONCLUSIVE`;
   - returns reasons, confidence and limitations;
   - quarantines invalid receipts or corroborating high-severity data/model findings.

### API routes

- `GET /api/benchmarks`
- `GET /api/ledger`
- `POST /api/audit/coco`
- `POST /api/audit/battery`
- `POST /api/receipt`
- `POST /api/verify`
- `POST /api/decision`

### Security boundary

Never deserialize an untrusted PyTorch model in the main service. Direct model inspection belongs in a restricted worker or controlled conversion path. Production also needs persistent protected keys, key IDs, rotation/revocation, a signed baseline manifest and complete ledger-chain verification.

## Live demo

Target: 90 seconds.

1. Open **Receipt** and choose a local image plus a local model file.
2. Click **Sign receipt** and explain the bound digests, nonce, sequence and previous-record hash.
3. Click **Tamper output digest** and show signature verification fail.
4. Click **Replay record** and show the freshness policy fail.
5. Open **Evidence**, compile the decision, and show `QUARANTINE` with its reason and limitation.
6. Open the accepted benchmark suite and name NIST Round 13 plus COCO-O as the next proof gates.

If the demo fails, spend no more than 20 seconds recovering. Use the already generated ledger record or the prototype slide and state the exact API behavior. Do not imply direct NIST execution.

## Presentation package

- Deck: `presentation/PramaanCV_SIH26228_Final_Story_Deck.pptx`
- Team playbook: `docs/PramaanCV_Team_Briefing_and_Presentation_Playbook.docx`

Deck story:

1. Cover and one-line product definition.
2. “Let’s Talk”: four questions that frame one continuous story.
3. Problem-validation data points and the research limit.
4. One hidden failure told visually from contributor to model to altered record.
5. Five official assurance questions.
6. Why current tools cover separate links.
7. Offline release-gate architecture.
8. Evidence-handoff differentiator.
9. NIST/COCO-O proof plan.
10. What the working prototype proves now versus the next measured gate.
11. Feasibility, scale and cost drivers.
12. National-stage evidence gates and impact.
13–14. Q&A appendix: access coverage and metrics/kill signal.

The deck contains no reference to another problem statement. Slides use a restrained editorial visual system and two generated illustration assets. Speaker notes contain scripts and source links.

## Team and speaking ownership

There are **six team members and five planned presenters**.

- **Member 1 — problem and data; presenter:** Slides 1–3; COCO/YOLO intake, contributor aggregation, problem evidence.
- **Member 2 — model integrity; presenter:** Slides 4–6; NIST Round 13, attacks, access-aware model tests and limitations.
- **Member 3 — provenance; presenter:** Slides 7–8; architecture, SHA-256/Ed25519 receipt, nonce/sequence/hash chain.
- **Member 4 — platform and demo; presenter:** Slides 9–10; benchmark suite and 90-second live demo.
- **Member 5 — impact and delivery; presenter:** Slides 11–12; feasibility, scale, cost drivers, impact metrics and close.
- **Member 6 — validation/red team; Q&A and backup:** source traceability, claim audit, failure injection, demo recovery and replacement speaker readiness.

Planned talk length: 9 minutes 25 seconds. Member 6 should run rapid-fire Q&A preparation and challenge every unsupported claim. All six members must know the one-sentence product definition, differentiator, datasets, current prototype boundary and kill signal.

## Validation completed

- `npm test`: passed 3 of 3 tests.
- Presentation finalizer: passed package integrity, layout geometry, font policy and Artifact Tool import; 14 slides, zero findings/warnings.
- Every slide rendered and visually inspected at full size.
- Team guide rendered to 20 pages and visually inspected at full size after pagination and six-member corrections.
- Frontend design detector was run once after UI refinement and returned no listed design violations.
- Browser desktop view was visually checked at 1280×720.

Re-run before a demo on another laptop:

```bash
npm test
npm start
```

Then open the deck locally and verify fonts, image rendering and presenter view.

## Relevant files

- `README.md` — product boundary, run instructions, demo and sources.
- `server.mjs` — local HTTP server and API routes.
- `src/core.mjs` — auditors, receipt signing/verification and decision compiler.
- `public/index.html` — analyst interface structure.
- `public/styles.css` — visual system and responsive behavior.
- `public/app.js` — interface state and API interactions.
- `test/core.test.mjs` — meaningful core tests.
- `benchmarks/registry.json` — accepted benchmark facts and official links.
- `presentation/PramaanCV_SIH26228_Final_Story_Deck.pptx` — final jury deck.
- `docs/PramaanCV_Team_Briefing_and_Presentation_Playbook.docx` — complete team briefing, script and Q&A.
- `AGENTS.md` — continuity rules.
- `HANDOFF_PROMPT.md` — copy-paste startup prompt for another LLM.
- `.agents/skills/handoff/SKILL.md` — vendored low-risk handoff-writing skill.

Generated runtime state under `.pramaan/` is intentionally ignored and must not be committed.

## Durable decisions

- Final problem statement: SIH26228.
- Product name: PramaanCV.
- Primary benchmark: NIST TrojAI Round 13.
- Natural-shift benchmark: COCO-O.
- Core novelty: cross-layer evidence handoff and assurance-case compilation.
- Offline-first and model-agnostic evidence schema.
- Four dispositions, with `INCONCLUSIVE` preserved.
- Signed append-only receipts instead of mandatory blockchain.
- Six members; five presenters; Member 6 owns validation/red-team and backup duties.
- Arduino is optional deployment hardware and never the innovation claim.

## Risks and open questions

- Direct Round 13 execution is not implemented yet.
- The public Round 13 asset/license workflow and safe loader need to be tested on the actual team environment.
- White-box analysis and trigger reconstruction require framework-specific restricted workers.
- COCO-O shift calibration is planned, not measured.
- The prototype signing key is process-local and unsuitable for production.
- Current replay handling demonstrates defined freshness rules; production requires complete ledger-chain validation and a durable trusted state.
- Cross-layer-evidence benefit has not yet been measured against isolated baselines.
- Analyst-review-time benefit requires a small blinded study.
- Team member names have not been provided; presentation ownership currently uses Member 1–6 labels.

## Next steps in priority order

1. **Internal round:** run two complete timed rehearsals; run the demo once with Wi-Fi disabled and a fresh browser; assign actual names to Member 1–6 in the team copy if desired.
2. **End-to-end NIST slice:** acquire one official clean and one poisoned Round 13 training model under its license; record checksums; execute both through a restricted adapter; replace schema-example behavior with measured outputs.
3. **Benchmark runner:** automate Round 13 training-split evaluation and report TPR at fixed 1%/5% FPR, AUROC/AUPRC and clean quarantine rate by attack family and architecture.
4. **Data evidence:** add perceptual duplicates, ObjectLab-style label/box scoring and trigger-cluster evidence on official COCO-format assets.
5. **Shift:** run COCO versus COCO-O calibration with domain-specific clean false alarms.
6. **Provenance hardening:** persistent protected keys, key IDs, rotation/revocation, signed baseline manifest and full ledger-chain validation.
7. **Evidence graph:** persist typed asset/finding/hypothesis/receipt edges and compare analyst review time with isolated-alert baselines.
8. **Air-gapped release:** pin dependencies, create an SBOM, package benchmark manifests and validate installation on a fresh machine with networking disabled.

## Skill provenance

The project-level handoff-writing skill was selected through the local Find Skills security-review workflow:

- Source: https://github.com/Codagent-AI/agent-skills/tree/d9fbc9e25c6964f6b5ff5edf17d7e9febba22f79/skills/handoff
- Reviewed commit: `d9fbc9e25c6964f6b5ff5edf17d7e9febba22f79`
- Reviewed tree: `5e27c8a74876a6fea6eed4d43a2834e8d81ed3bd`
- `SKILL.md` SHA-256: `955f2ce4104d880fb408a62d1dd5cd3be2056a6c302d825412396220fe2f753e`
- License: MIT; copied beside the vendored skill.
- Review result: low risk for this use. The package contains one Markdown instruction file, no executable code, dependencies, hooks, network behavior, credential access or installation scripts. It writes a scoped handoff file when invoked. Residual risk is limited to future source changes; the vendored copy is fixed to the reviewed content.

## Recovery instruction

A new LLM should begin with `AGENTS.md`, read this file completely, inspect `README.md` and the files relevant to its assigned next step, run `npm test`, and continue from the first unchecked priority above. Do not reconstruct strategy from scratch and do not silently widen the product claims.
