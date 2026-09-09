import crypto from "node:crypto";

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === "string" ? value : canonical(value));
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

export function createKeyPair() {
  return crypto.generateKeyPairSync("ed25519");
}

export function exportPublicKey(publicKey) {
  return publicKey.export({ type: "spki", format: "pem" });
}

export function buildReceipt({ inputBytes, modelBytes, output, preprocessing, config, sequence, previousRecordHash, nonce, timestamp }) {
  return {
    schema: "pramaancv.receipt.v1",
    inputDigest: sha256(inputBytes),
    modelDigest: sha256(modelBytes),
    preprocessingDigest: sha256(preprocessing),
    configuration: config,
    outputDigest: sha256(output),
    timestamp: timestamp ?? new Date().toISOString(),
    nonce: nonce ?? crypto.randomBytes(16).toString("hex"),
    sequence,
    previousRecordHash: previousRecordHash ?? null
  };
}

export function signReceipt(receipt, privateKey) {
  const payload = Buffer.from(canonical(receipt));
  return crypto.sign(null, payload, privateKey).toString("base64");
}

export function verifyReceipt(receipt, signature, publicKey) {
  return crypto.verify(null, Buffer.from(canonical(receipt)), publicKey, Buffer.from(signature, "base64"));
}

export function auditCoco(coco) {
  const findings = [];
  if (!coco || !Array.isArray(coco.images) || !Array.isArray(coco.annotations) || !Array.isArray(coco.categories)) {
    return { valid: false, findings: [{ severity: "high", code: "COCO_SCHEMA", reason: "images, annotations and categories arrays are required" }], contributorRisk: [] };
  }
  const images = new Map(coco.images.map(x => [x.id, x]));
  const categories = new Set(coco.categories.map(x => x.id));
  const seen = new Set();
  const perContributor = new Map();
  const add = (finding, image) => {
    findings.push(finding);
    const contributor = image?.contributor_id ?? image?.source ?? "unknown";
    const row = perContributor.get(contributor) ?? { contributor, findings: 0, high: 0 };
    row.findings += 1;
    if (finding.severity === "high") row.high += 1;
    perContributor.set(contributor, row);
  };
  for (const ann of coco.annotations) {
    const img = images.get(ann.image_id);
    if (!img) add({ severity: "high", code: "ORPHAN_ANNOTATION", asset: `annotation:${ann.id}`, reason: `Image ${ann.image_id} does not exist` });
    if (!categories.has(ann.category_id)) add({ severity: "high", code: "UNKNOWN_CATEGORY", asset: `annotation:${ann.id}`, reason: `Category ${ann.category_id} does not exist` }, img);
    const b = ann.bbox;
    if (!Array.isArray(b) || b.length !== 4 || b.some(v => !Number.isFinite(v)) || b[2] <= 0 || b[3] <= 0) {
      add({ severity: "high", code: "INVALID_BOX", asset: `annotation:${ann.id}`, reason: "Bounding box must be [x, y, positive width, positive height]" }, img);
    } else if (img?.width && img?.height && (b[0] < 0 || b[1] < 0 || b[0] + b[2] > img.width || b[1] + b[3] > img.height)) {
      add({ severity: "medium", code: "BOX_OUT_OF_BOUNDS", asset: `annotation:${ann.id}`, reason: "Bounding box extends beyond image dimensions" }, img);
    }
    const key = `${ann.image_id}|${ann.category_id}|${JSON.stringify(ann.bbox)}`;
    if (seen.has(key)) add({ severity: "medium", code: "DUPLICATE_ANNOTATION", asset: `annotation:${ann.id}`, reason: "An identical image/category/box annotation already exists" }, img);
    seen.add(key);
  }
  const contributorRisk = [...perContributor.values()].map(x => ({ ...x, disposition: x.high ? "QUARANTINE" : "REVIEW" })).sort((a,b) => b.high-a.high || b.findings-a.findings);
  return { valid: findings.every(x => x.severity !== "high"), summary: { images: coco.images.length, annotations: coco.annotations.length, categories: coco.categories.length }, findings, contributorRisk };
}

export function evaluateBattery(payload) {
  const cases = payload?.cases;
  if (!Array.isArray(cases) || !cases.length) return { status: "INCONCLUSIVE", reason: "No behavioural cases supplied", findings: [] };
  const findings = [];
  for (const c of cases) {
    const clean = c.clean ?? {};
    const triggered = c.triggered ?? {};
    const countDrop = Number(clean.detectionCount ?? 0) - Number(triggered.detectionCount ?? 0);
    const targetRise = Number(triggered.targetClassCount ?? 0) - Number(clean.targetClassCount ?? 0);
    if (countDrop >= (c.evasionThreshold ?? 1)) findings.push({ severity: "high", family: "evasion", caseId: c.id, reason: `Detection count dropped by ${countDrop}` });
    if (targetRise >= (c.injectionThreshold ?? 1)) findings.push({ severity: "high", family: "injection-or-misclassification", caseId: c.id, reason: `Target-class detections increased by ${targetRise}` });
    if (Number(triggered.meanBoxShift ?? 0) >= (c.localizationThreshold ?? 0.15)) findings.push({ severity: "high", family: "localization", caseId: c.id, reason: `Mean normalized box shift reached ${triggered.meanBoxShift}` });
  }
  return { status: findings.length ? "SUSPICIOUS" : "NO_SUPPORTED_ANOMALY", cases: cases.length, findings, limitation: "This battery only supports declared output-delta rules; it does not prove absence of a backdoor." };
}

export function decide({ dataAudit, modelAssessment, receiptVerification }) {
  const evidence = [];
  if (receiptVerification && !receiptVerification.valid) evidence.push({ layer: "record", severity: "critical", reason: receiptVerification.reason });
  evidence.push(...(dataAudit?.findings ?? []).map(x => ({ layer: "data", ...x })));
  evidence.push(...(modelAssessment?.findings ?? []).map(x => ({ layer: "model", ...x })));
  const hasCritical = evidence.some(x => x.severity === "critical");
  const dataHigh = evidence.some(x => x.layer === "data" && x.severity === "high");
  const modelHigh = evidence.some(x => x.layer === "model" && x.severity === "high");
  let disposition = "ACCEPT";
  let confidence = 0.72;
  if (hasCritical || (dataHigh && modelHigh)) { disposition = "QUARANTINE"; confidence = 0.93; }
  else if (dataHigh || modelHigh || evidence.length) { disposition = "REVIEW"; confidence = 0.78; }
  else if (!dataAudit && !modelAssessment && !receiptVerification) { disposition = "INCONCLUSIVE"; confidence = 1; }
  return { disposition, confidence, evidence, limitation: "Disposition follows declared rules and available evidence; unsupported attack classes remain inconclusive." };
}
