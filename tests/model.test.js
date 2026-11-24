// Data and model tests for Cardio Companion. Run: node tests/model.test.js
// Extracts the ECG model and the medication data from index.html and checks them without a browser.
"use strict";
const fs=require("fs"), vm=require("vm"), path=require("path");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const cut=(a,b)=>{const i=html.indexOf(a), j=html.indexOf(b,i); if(i<0||j<0) throw new Error("marker missing: "+a); return html.slice(i,j);};
const code=[
  cut("const D=6, FS=500;","/* =========================================================\n   ECG UI"),
  cut("const MED_GROUPS=","const MED_FIELDS="),
  "this.out={D,FS,RHYTHMS,synth3,project,leadGain,heartState,intervals,describe,LEADS,MEDS,DRUGS,GUIDES,CLASS_DRUGS};"
].join("\n");
const ctx={Math,Float32Array,Object,Array,console}; vm.createContext(ctx); vm.runInContext(code,ctx);
const M=ctx.out;
let fails=0, passes=0;
const ok=(c,msg)=>{ if(c) passes++; else {fails++; console.log("FAIL:",msg);} };
const TOL=1e-5;

// ---- 1. limb-lead identities, every rhythm, every sample ----
const rhythms=Object.keys(M.RHYTHMS);
ok(rhythms.length===14,"14 rhythms (got "+rhythms.length+")");
const built={};
for(const k of rhythms){
  const R=M.RHYTHMS[k].build(); R.key=k; built[k]=R;
  const V=M.synth3(R), L={};
  for(const [n] of M.LEADS){ L[n]=M.project(V,n); ok(L[n].length===Math.round(M.D*M.FS)+1,k+" "+n+" length"); }
  let maxErr=0, bad=0;
  for(let i=0;i<L.I.length;i++){
    for(const n in L) if(!Number.isFinite(L[n][i])) bad++;
    const e=[L.II[i]-(L.I[i]+L.III[i]), L.aVR[i]+(L.I[i]+L.II[i])/2, L.aVL[i]-(L.I[i]-L.II[i]/2), L.aVF[i]-(L.II[i]+L.III[i])/2, L.aVR[i]+L.aVL[i]+L.aVF[i]];
    for(const x of e) maxErr=Math.max(maxErr,Math.abs(x));
  }
  ok(bad===0,k+": no NaN/Infinity"); ok(maxErr<TOL,k+": Einthoven/Goldberger identities (max error "+maxErr.toExponential(2)+")");
}
// arbitrary vectors
{ const V={x:new Float32Array(200),y:new Float32Array(200),z:new Float32Array(200)}; let s=3;
  const rnd=()=>{s=(s*1664525+1013904223)%4294967296; return s/4294967296*2-1;};
  for(let i=0;i<200;i++){V.x[i]=rnd();V.y[i]=rnd();V.z[i]=rnd();}
  const L={}; for(const n of ["I","II","III","aVR","aVL","aVF"]) L[n]=M.project(V,n);
  let m=0; for(let i=0;i<200;i++) m=Math.max(m,Math.abs(L.aVR[i]+(L.I[i]+L.II[i])/2),Math.abs(L.aVL[i]-(L.I[i]-L.II[i]/2)),Math.abs(L.aVF[i]-(L.II[i]+L.III[i])/2));
  ok(m<TOL,"augmented identities on random vectors");
  const X={x:new Float32Array([1]),y:new Float32Array([0]),z:new Float32Array([0])};
  ok(Math.abs(M.project(X,"aVR")[0]+0.75)<TOL && Math.abs(M.project(X,"aVL")[0]-0.75)<TOL,"x-only unit vector: aVR = −0.75, aVL = +0.75");
}

// ---- 2. event ordering and rates ----
const rate=(R)=>{const v=R.V.filter(x=>x.q0>=0&&x.q0<M.D); if(v.length<2) return null; return 60/((v[v.length-1].q0-v[0].q0)/(v.length-1));};
for(const k of rhythms){ const R=built[k];
  for(const v of R.V){ ok(v.w>0 && v.q0+v.w<=v.Tstart+1e-9 && v.Tstart<v.Tpeak && v.Tpeak<v.Tend,k+": QRS → T ordering at "+v.q0.toFixed(3)); }
  for(let i=1;i<R.V.length;i++) ok(R.V[i].q0>R.V[i-1].q0,k+": QRS sorted");
}
const near=(a,b,t)=>Math.abs(a-b)<=t;
ok(near(rate(built.nsr),75,0.5),"NSR 75/min"); ok(near(rate(built.brady),48,0.5),"brady 48"); ok(near(rate(built.tachy),120,0.5),"tachy 120");
ok(near(rate(built.svt),180,0.5),"AVNRT 180"); ok(near(rate(built.afl),150,0.5),"flutter 2:1 150"); ok(near(rate(built.afl4),75,0.5),"flutter 4:1 75");
ok(near(rate(built.vt),150,0.5),"VT 150"); ok(near(rate(built.avb3),45,0.5),"CHB ventricular 45");
ok(built.vf.V.length===0,"VF has no organized ventricular events");
const nsr=built.nsr.V[1]; ok(near(nsr.q0-nsr.p0,0.16,1e-9)&&near(nsr.w,0.09,1e-9)&&near(nsr.qt,0.367,0.002),"NSR PR 160, QRS 90, QT ≈ 367");

// ---- 3. VT dissociation is visible (not phase-locked) ----
{ const R=built.vt, offs=new Set();
  for(const a of R.A){ if(a.p0<0||a.p0>=M.D) continue; const prev=R.V.filter(v=>v.q0<=a.p0).pop(); if(prev) offs.add(Math.round((a.p0-prev.q0)*1000)); }
  ok(offs.size>=5,"VT: P–QRS relationship changes beat to beat ("+[...offs].join(",")+" ms)");
  ok(near(60/R.pp,82,0.5),"VT atrial rate ≈ 82/min matches text");
  ok(M.intervals(R).some(c=>c.k==="VISP"),"VT: a visible P wave chip exists");
}

// ---- 4. chips: bounds and the diagnosis-defining values ----
for(const k of rhythms){ const ch=M.intervals(built[k]); const keys=new Set();
  for(const c of ch){ ok(c.a>=0 && c.b>c.a && c.b<=M.D+0.01,k+": chip "+c.k+" in bounds"); ok(!keys.has(c.k),k+": unique chip key "+c.k); keys.add(c.k);
    const j=c.jump??(c.a+c.b)/2; ok(j>=0&&j<M.D,k+": chip "+c.k+" jump inside strip"); }
}
const chip=(k,id)=>M.intervals(built[k]).find(c=>c.k===id);
ok(["PR0","PR1","PR2"].map(i=>chip("mob1",i).val).join("/")==="160 ms/260 ms/320 ms","Mobitz I PR series 160/260/320");
ok(chip("mob1","DROP")&&chip("mob2","DROP")&&chip("mob2","PRpre").val.startsWith("180 ms"),"Mobitz dropped-P chips; Mobitz II PR constant 180");
ok(chip("pvc","COUP").val==="480 ms"&&chip("pvc","PAUSE").val==="1120 ms"&&chip("pvc","COMP").val.startsWith("1600 ms")&&chip("pvc","PVCQRS").val==="160 ms","PVC coupling 480, pause 1120, compensatory 1600, QRS 160");
ok(chip("afl","FF").val.startsWith("200 ms")&&chip("afl","RATIO").val==="2:1"&&chip("afl4","RATIO").val==="4:1","flutter F–F 200 ms and 2:1 / 4:1");
ok(chip("avb3","PP").val.includes("80/min"),"CHB P–P 80/min");
ok(chip("af","RRs")&&chip("af","RRl")&&parseInt(chip("af","RRs").val)<parseInt(chip("af","RRl").val),"AF shortest < longest R–R");
ok(M.intervals(built.vf).length===0,"VF: no intervals");

// ---- 5. heart state: repolarization shading ends with the T wave ----
for(const k of ["nsr","pvc","vt"]){ const R=built[k]; const v=R.V.find(x=>x.q0>0.5);
  const after=M.heartState(v.Tend+0.005,R), during=M.heartState((v.Tstart+v.Tend)/2,R);
  ok(during.vBlue>0.3,k+": blue during T"); ok(after.vBlue===0||!(after.vBlue>0)||R.V.some(x=>x!==v&&x.Tstart<=v.Tend+0.005&&x.Tend>v.Tend+0.005),k+": blue gone at T end"); }

// ---- 6. medication data integrity ----
const medIds=new Set(M.MEDS.map(m=>m.id));
let drugCount=0;
for(const [c,ids] of Object.entries(M.CLASS_DRUGS)){ ok(medIds.has(c),"CLASS_DRUGS class "+c+" exists in MEDS");
  for(const id of ids){ drugCount++; ok(!!M.DRUGS[id],"drug "+id+" exists"); } }
for(const [id,d] of Object.entries(M.DRUGS)){
  ok(medIds.has(d.cls),id+": cls "+d.cls+" exists");
  ok(Object.values(M.CLASS_DRUGS).some(a=>a.includes(id)),id+": listed under a class");
  for(const [g] of d.cdn) ok(!!M.GUIDES[g],id+": guide key "+g+" exists");
  for(const t of d.trials) ok(Array.isArray(t)&&t.length>=5,id+": trial record has 5+ fields ("+t[0]+")");
}
for(const m of M.MEDS) ok(M.CLASS_DRUGS[m.id]&&M.CLASS_DRUGS[m.id].length>0,m.id+": has example drugs");
// trial names that appear in more than one drug card must not contradict (same year)
const seen={}; for(const d of Object.values(M.DRUGS)) for(const t of d.trials){ if(t[1]==null) continue; if(seen[t[0]]!=null) ok(seen[t[0]]===t[1],"trial "+t[0]+" has one year across cards"); seen[t[0]]=t[1]; }
// regression guards for adjudicated findings
const DT=id=>JSON.stringify(M.DRUGS[id]); const MT=id=>JSON.stringify(M.MEDS.find(m=>m.id===id));
ok(!/eplerenone/.test("")&&!M.DRUGS.eplerenone.trials.some(t=>/FINEARTS/.test(t[0])),"FINEARTS-HF not filed under eplerenone");
ok(M.DRUGS.finerenone&&M.DRUGS.finerenone.trials.some(t=>/FINEARTS/.test(t[0])),"FINEARTS-HF filed under finerenone");
ok(!/They relieve symptoms but do not improve survival\./.test(MT("nitrates")),"nitrates: no blanket no-survival claim");
ok(!/warfarin only for/.test(MT("anticoag")),"anticoag: no 'warfarin only' claim");
ok(!/lifelong ASA for established/i.test(MT("antiplatelet")),"antiplatelet: no blanket lifelong ASA");
ok(/PROCAMIO/.test(DT("procainamide"))&&/62 analyzed/.test(DT("procainamide")),"PROCAMIO analyzed denominator shown");
ok(!/diagnosis \(relief supports/.test(DT("ntg")),"nitroglycerin: no diagnostic inference from relief");
ok(!/a recent HF hospitalization/.test(MT("ivabradine")),"ivabradine: hospitalization not stated as a guideline requirement");

console.log(`\n${passes} passed, ${fails} failed · ${rhythms.length} rhythms × 12 leads · ${drugCount} drug entries · ${M.MEDS.length} classes`);
process.exit(fails?1:0);
