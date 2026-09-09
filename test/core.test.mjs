import test from "node:test";
import assert from "node:assert/strict";
import { createKeyPair, buildReceipt, signReceipt, verifyReceipt, auditCoco, evaluateBattery, decide } from "../src/core.mjs";

test("signed receipt detects a changed output digest",()=>{
  const keys=createKeyPair();
  const receipt=buildReceipt({inputBytes:Buffer.from("image"),modelBytes:Buffer.from("model"),output:{boxes:[]},preprocessing:{resize:640},config:{},sequence:1});
  const signature=signReceipt(receipt,keys.privateKey);
  assert.equal(verifyReceipt(receipt,signature,keys.publicKey),true);
  assert.equal(verifyReceipt({...receipt,outputDigest:"0".repeat(64)},signature,keys.publicKey),false);
});

test("COCO audit catches invalid category, duplicate, and out-of-bounds box",()=>{
  const coco={images:[{id:1,width:100,height:100,contributor_id:"C-07"}],categories:[{id:1,name:"x"}],annotations:[{id:1,image_id:1,category_id:9,bbox:[90,90,20,20]},{id:2,image_id:1,category_id:9,bbox:[90,90,20,20]}]};
  const out=auditCoco(coco);
  assert.equal(out.valid,false);
  assert.ok(out.findings.some(x=>x.code==="UNKNOWN_CATEGORY"));
  assert.ok(out.findings.some(x=>x.code==="DUPLICATE_ANNOTATION"));
  assert.equal(out.contributorRisk[0].disposition,"QUARANTINE");
});

test("behaviour battery and data evidence can trigger quarantine",()=>{
  const model=evaluateBattery({cases:[{id:"official-case",clean:{detectionCount:8,targetClassCount:0},triggered:{detectionCount:3,targetClassCount:0},evasionThreshold:2}]});
  const data={findings:[{severity:"high",reason:"Contributor cluster"}]};
  const decision=decide({dataAudit:data,modelAssessment:model});
  assert.equal(decision.disposition,"QUARANTINE");
});
