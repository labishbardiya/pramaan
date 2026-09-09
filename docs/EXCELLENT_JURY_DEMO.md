# PramaanCV: excellent jury demonstrator

## The standard

The current application is a working vertical-slice proof of concept. The next demonstrator is complete only when one official NIST TrojAI Round 13 case moves through the full PramaanCV evidence chain without invented data:

`official asset -> measured clean/triggered behavior -> evidence graph -> signed receipt -> policy decision -> tamper/replay proof`

The interface is presentation support. The central proof is the reproducible evidence bundle.

## Curated official cohort

Use the public NIST Round 13 training split. Preserve each original model ID and all source files. Do not rename evidence in a way that hides provenance.

Minimum internal-round cohort:

1. One known poisoned **evasion** model. This is the primary story because a detection box visibly disappears.
2. One clean model matched as closely as possible by architecture and image domain.
3. One spurious-trigger negative control, if available, to prove that “patch present” does not automatically mean “Trojan.”

Strong national-stage cohort:

- one case from each attack effect: evasion, misclassification, localization and injection;
- clean and spurious-trigger controls;
- SSD, Faster R-CNN and DETR coverage;
- synthetic-road and DOTA aerial domains where supported.

For every selected case, save:

- model ID and SHA-256;
- `ground_truth.csv`;
- relevant fields from `config.json` and `METADATA.csv`;
- `trigger_0.png` when present;
- selected clean and poisoned example identifiers and hashes;
- raw detector outputs before PramaanCV derives deltas;
- environment, adapter version and run timestamp.

## What must be real today

- The official NIST model ID, ground truth, trigger and example provenance.
- The before/after detector outputs, or a clearly labelled imported trace produced by the isolated runner.
- The computed delta: box deletion, target-label change, box movement or injected box.
- The receipt signature and verification result.
- The replay/tamper failure.
- The disposition and its human-readable reasons.

If direct model execution is not ready, show the official ground-truth dossier and label the behavior card **IMPORTED TRACE**. Never imply that the current Node service executed the PyTorch model.

## Ninety-second jury flow

1. **Dossier — 15 seconds.** Show the model ID, architecture, domain, known poisoned ground truth, attack effect and trigger. Say: “This is an official public NIST training case, not a case we manufactured.”
2. **Behavior — 25 seconds.** Put clean and triggered frames side by side. Animate or highlight the affected box. State the exact measured delta.
3. **Evidence handoff — 15 seconds.** Reveal the short graph from source/sample evidence to the targeted model test. Explain why corroboration is stronger than an isolated alarm.
4. **Receipt — 15 seconds.** Bind the input, model, preprocessing, configuration and output hashes in a signed receipt.
5. **Attack the record — 10 seconds.** Alter the output digest or replay the receipt; verification must fail.
6. **Decision — 10 seconds.** Compile `QUARANTINE` and show the evidence, limitation and next analyst action.

Then stop. The jury should ask how it scales, what the detector does, and how false positives are controlled.

## Acceptance checklist

Do not call the demonstrator excellent until all boxes below are checked:

- [ ] At least one official named poisoned case and one matched clean control are present.
- [ ] `ground_truth.csv`, `config.json`, `METADATA.csv` and trigger provenance agree.
- [ ] Raw outputs are retained and the shown delta is recomputable.
- [ ] A negative control shows that the system does not equate every patch with a Trojan.
- [ ] The model runner is isolated from the main service.
- [ ] The exact model and input hashes appear in the receipt.
- [ ] Tamper and replay tests fail live.
- [ ] `INCONCLUSIVE` is returned when access or coverage is insufficient.
- [ ] The demo runs without network access.
- [ ] Fallback screenshots, receipt JSON and raw outputs are available.
- [ ] The team can explain what is measured, what is imported and what remains unvalidated.

## Engineering work

### Gate A: official case ingestion

- Download selected model folders from the NIST Round 13 public training set, not the full corpus.
- Build a manifest generator that records original path, model ID, file size, SHA-256, license and source URL.
- Parse `ground_truth.csv`, `config.json`, `reduced-config.json` and relevant metadata fields into a read-only dossier.

### Gate B: restricted model runner

- Run PyTorch deserialization and inference in a disposable Linux container or VM with no network, a read-only input mount, an unprivileged user, CPU/RAM/time limits and a writable scratch directory.
- Return only a small signed JSON result containing boxes, labels, confidence scores, runtime and asset hashes.
- Never load an untrusted PyTorch object inside the web server process.

### Gate C: visual proof

- Render the clean and triggered inputs with prediction boxes.
- Use a clear color convention for unchanged, deleted, relabelled, shifted and injected boxes.
- Display the attack effect declared by NIST separately from the effect measured by PramaanCV.

### Gate D: evidence compiler

- Link the dossier, run outputs, derived deltas, receipt and decision by content hash.
- Require corroboration for `QUARANTINE`; otherwise return `REVIEW` or `INCONCLUSIVE`.
- Keep all thresholds visible and versioned.

### Gate E: national validation

- Freeze thresholds using only the public training split.
- Report AUROC and AUPRC plus true-positive rate at fixed false-positive rates.
- Break results down by architecture, image domain and attack family.
- Measure the clean quarantine rate and analyst review time against isolated tools.
- Run COCO-O as the separate natural-shift gate.

## Five-presenter ownership

- Presenter 1: threat story and why existing isolated tools leave an evidence gap.
- Presenter 2: official NIST dossier, trigger behavior and honest detector boundary.
- Presenter 3: evidence graph, receipt, tamper and replay protection.
- Presenter 4: live demonstrator and recovery path.
- Presenter 5: scale, metrics, cost and national validation plan.
- Member 6: source traceability, negative controls, red-team rehearsal and backup demo operator.

## Jury answer to “Is this only a PoC?”

> Today it is a working vertical slice of the release-gate architecture. Its cryptographic receipt, replay checks, data audit and policy compiler run locally now. We are not presenting an unmeasured universal Trojan detector. Our next gate is direct execution on selected public NIST Round 13 clean and poisoned models, followed by frozen-threshold evaluation across the full training cohort. The product innovation is the traceable evidence handoff and defensible release decision, not a claim that one detector solves every attack.

