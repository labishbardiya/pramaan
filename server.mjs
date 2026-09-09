import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createKeyPair, exportPublicKey, buildReceipt, signReceipt, verifyReceipt, sha256, auditCoco, evaluateBattery, decide } from "./src/core.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const stateDir = path.join(root, ".pramaan");
await fs.mkdir(stateDir, { recursive: true });
const ledgerPath = path.join(stateDir, "ledger.jsonl");
const keys = createKeyPair();
const usedNonces = new Set();

const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };
const json = (res, status, value) => { const body=JSON.stringify(value,null,2); res.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":Buffer.byteLength(body)}); res.end(body); };
const body = req => new Promise((resolve,reject)=>{let chunks=[];let n=0;req.on("data",c=>{n+=c.length;if(n>25_000_000){reject(new Error("Request exceeds 25 MB"));req.destroy();}else chunks.push(c)});req.on("end",()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}"))}catch(e){reject(e)}});req.on("error",reject)});
const decode = value => Buffer.from(value ?? "", "base64");

async function ledger() {
  try { return (await fs.readFile(ledgerPath,"utf8")).trim().split("\n").filter(Boolean).map(JSON.parse); } catch { return []; }
}
async function appendRecord(record) { await fs.appendFile(ledgerPath, JSON.stringify(record)+"\n", { encoding:"utf8", mode:0o600 }); }

const server = http.createServer(async (req,res)=>{
  try {
    const url=new URL(req.url,"http://127.0.0.1");
    if(req.method==="GET" && url.pathname==="/api/benchmarks") return json(res,200,JSON.parse(await fs.readFile(path.join(root,"benchmarks/registry.json"),"utf8")));
    if(req.method==="GET" && url.pathname==="/api/ledger") return json(res,200,{records:await ledger(),publicKey:exportPublicKey(keys.publicKey)});
    if(req.method==="POST" && url.pathname==="/api/audit/coco") { const p=await body(req); return json(res,200,auditCoco(p)); }
    if(req.method==="POST" && url.pathname==="/api/audit/battery") { const p=await body(req); return json(res,200,evaluateBattery(p)); }
    if(req.method==="POST" && url.pathname==="/api/receipt") {
      const p=await body(req); const records=await ledger(); const previous=records.at(-1); const sequence=(previous?.receipt?.sequence ?? 0)+1;
      const receipt=buildReceipt({inputBytes:decode(p.inputBase64),modelBytes:decode(p.modelBase64),output:p.output??{},preprocessing:p.preprocessing??{},config:p.config??{},sequence,previousRecordHash:previous?sha256(previous.receipt):null});
      const signature=signReceipt(receipt,keys.privateKey); const record={receipt,signature,publicKey:exportPublicKey(keys.publicKey)}; await appendRecord(record); usedNonces.add(receipt.nonce); return json(res,201,record);
    }
    if(req.method==="POST" && url.pathname==="/api/verify") {
      const p=await body(req); const validSignature=verifyReceipt(p.receipt,p.signature,keys.publicKey); const records=await ledger(); const seen=records.filter(x=>x.receipt.nonce===p.receipt.nonce).length; const replay=seen>1 || p.replayed===true;
      return json(res,200,{valid:validSignature&&!replay,validSignature,replay,reason:!validSignature?"Signature mismatch: protected fields changed":replay?"Nonce already observed or record marked as replay":"Signature and replay controls passed"});
    }
    if(req.method==="POST" && url.pathname==="/api/decision") { const p=await body(req); return json(res,200,decide(p)); }

    const rel=url.pathname==="/"?"index.html":url.pathname.replace(/^\//,"");
    const file=path.normalize(path.join(root,"public",rel));
    if(!file.startsWith(path.join(root,"public"))) return json(res,403,{error:"Forbidden"});
    const data=await fs.readFile(file); res.writeHead(200,{"content-type":mime[path.extname(file)]??"application/octet-stream"}); res.end(data);
  } catch(e) { if(e?.code==="ENOENT") return json(res,404,{error:"Not found"}); json(res,400,{error:e.message}); }
});

const port=Number(process.env.PORT??8787);
server.listen(port,"127.0.0.1",()=>console.log(`PramaanCV running at http://127.0.0.1:${port}`));
