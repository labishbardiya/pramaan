# PramaanCV

PramaanCV is an offline assurance-case compiler for computer-vision data, models and inference records. It targets **SIH26228** and turns evidence from separate checks into one analyst disposition: `ACCEPT`, `REVIEW`, `QUARANTINE`, or `INCONCLUSIVE`.

The current vertical slice already provides:

- a COCO annotation auditor with contributor-level aggregation;
- a declared behavioural reference-battery evaluator for evasion, injection/misclassification and localisation signals;
- SHA-256 asset identity and Ed25519-signed inference receipts;
- nonce, sequence and previous-record hashes for replay and tamper evidence;
- an evidence compiler that preserves reasons and limitations;
- a dependency-free local web interface that binds only to `127.0.0.1`.

## Run the prototype

Requires Node.js 20 or newer.

```bash
npm test
npm start
```

Open <http://127.0.0.1:8787>.

## Internal-round package

- [`presentation/PramaanCV_SIH26228_Final_Story_Deck.pptx`](presentation/PramaanCV_SIH26228_Final_Story_Deck.pptx) is the 14-slide jury deck with speaker notes and sources.
- [`docs/PramaanCV_Team_Briefing_and_Presentation_Playbook.docx`](docs/PramaanCV_Team_Briefing_and_Presentation_Playbook.docx) takes all six members from the problem definition through the script, live demo, Q&A and national build plan. Five members present; Member 6 owns validation/red-team work and serves as the demo and speaking backup.
- [`AGENT_HANDOFF.md`](AGENT_HANDOFF.md) and [`HANDOFF_PROMPT.md`](HANDOFF_PROMPT.md) let another LLM or session resume the project from repository state.
- [`docs/EXCELLENT_JURY_DEMO.md`](docs/EXCELLENT_JURY_DEMO.md) defines the official-case acceptance bar, 90-second jury flow and national validation gates.

## Ninety-second internal demo

1. Open **Receipt**. Select any local image and any model file. The server hashes both files and signs the canonical receipt with a process-local Ed25519 key.
2. Click **Tamper output digest**. Verification fails because the protected field no longer matches the signature.
3. Click **Compile decision**. The analyst gate returns `QUARANTINE` and shows the record-layer reason.
4. If an official NIST Round 13 asset is available, import its clean/triggered output summary in **Model**. Keep the model id and access mode in the case JSON.
5. If a COCO manifest is available, run **Data** to show invalid labels, boxes, duplicate annotations and contributor aggregation.

The prefilled behavioural case is a neutral schema example. It is not a claimed NIST result. Replace it with outputs measured from an official model before presenting a model-integrity finding.

## Accepted benchmark plan

The repository does not manufacture a benchmark dataset. [`benchmarks/registry.json`](benchmarks/registry.json) records the public suite:

- **NIST TrojAI Round 13** is the primary model-integrity benchmark: 128 train, 192 test and 192 holdout object-detection models using SSD, Faster R-CNN and DETR. It includes misclassification, evasion, localisation and injection triggers plus spurious clean controls.
- **NIST TrojAI Round 10** is a smaller COCO-based fallback with 144 models in each split and SSD/Faster R-CNN architectures.
- **COCO-O** evaluates natural distribution shift with 6,782 real images across six domains.

Keep downloaded datasets outside Git. Follow the original licences and preserve train/test/holdout separation.

## Import contract for a behavioural battery

```json
{
  "cases": [
    {
      "id": "nist-model-id-and-example-id",
      "clean": { "detectionCount": 8, "targetClassCount": 0 },
      "triggered": { "detectionCount": 3, "targetClassCount": 0, "meanBoxShift": 0.02 },
      "evasionThreshold": 2,
      "injectionThreshold": 2,
      "localizationThreshold": 0.15
    }
  ]
}
```

The current evaluator tests declared output deltas. It does not claim universal backdoor detection. White-box model loading, activation analysis, trigger reconstruction and COCO-O embedding calibration are the next benchmark gates.

## Security boundary

- The prototype never deserializes uploaded PyTorch files. Untrusted model loading must later run in a locked-down worker because model formats can execute code.
- A valid receipt proves tamper evidence under the declared key and execution trust model. It does not prove that the model is benign or that every assertion is true.
- Keys are process-local in this prototype. A deployment must use protected key storage, rotation and a signed baseline manifest.

## Sources

- [SIH26228 problem statement mirror](https://sih2026.vuce.in/ps/SIH26228)
- [NIST TrojAI Round 13 documentation](https://pages.nist.gov/trojai/docs/object-detection-feb2023.html)
- [NIST TrojAI Round 13 data record](https://data.nist.gov/od/id/mds2-2959)
- [NIST TrojAI Round 10 documentation](https://pages.nist.gov/trojai/docs/object-detection-jul2022.html)
- [COCO-O paper](https://openaccess.thecvf.com/content/ICCV2023/papers/Mao_COCO-O_A_Benchmark_for_Object_Detectors_under_Natural_Distribution_Shifts_ICCV_2023_paper.pdf)
- [ObjectLab paper](https://arxiv.org/abs/2309.00832)
- [PyTorch security policy](https://github.com/pytorch/pytorch/security/policy)
- [Limits of universal backdoor detection](https://proceedings.mlr.press/v238/pichler24a.html)
