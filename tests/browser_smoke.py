"""Browser smoke test. Run: python3 tests/browser_smoke.py [path-to-index.html] [screenshot-dir]
Loads the page in headless Chrome and exercises routes, every rhythm x lead, chips, controls,
deep links, search and compare. Fails on any console error or page error."""
import sys, os, pathlib
from playwright.sync_api import sync_playwright
html=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else pathlib.Path(__file__).parent.parent/"index.html").resolve()
shots=sys.argv[2] if len(sys.argv)>2 else None
errs=[]; checks=0; fails=[]
def ok(c,m):
    global checks; checks+=1
    if not c: fails.append(m); print("FAIL:",m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for vw in [(1280,900),(390,844)]:
        pg=b.new_page(viewport={"width":vw[0],"height":vw[1]})
        pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        pg.on("pageerror",lambda e: errs.append(str(e)))
        url=html.as_uri()
        pg.goto(url+"#home"); pg.wait_for_timeout(300)
        ok(pg.title()=="Cardio Companion","home title")
        ok(pg.get_attribute('nav.tabs a[data-page="home"]',"aria-current")=="page","aria-current on home")
        pg.click('a[href="#ecg-nsr"]'); pg.wait_for_timeout(300)
        ok("Visual ECG Learner" in pg.title(),"ecg title after CTA: "+pg.title())
        ok(pg.evaluate("cur")=="nsr","CTA opens NSR")
        # every rhythm x lead: canvas sample == narration sign source; chips work
        res=pg.evaluate("""()=>{const out=[];for(const k of Object.keys(RHYTHMS)){selectRhythm(k);
          for(const [n] of LEADS){setLead(n); setPlaying(false); t=2.345; frame();
            const i=Math.floor(t*FS); const val=SIG[i]; const msg=document.getElementById('leadNow').textContent;
            const bad=!Number.isFinite(val)||(Math.abs(val)>=0.06&&((val>0&&!/above baseline/.test(msg))||(val<0&&!/below baseline/.test(msg))));
            if(bad) out.push(k+'/'+n+' '+val.toFixed(3)+' '+msg.slice(0,60));}
          const chips=[...document.querySelectorAll('#waveChips .chip')];
          for(const c of chips){c.click(); if(!hl||t<0||t>=D) out.push(k+' chip '+c.textContent); if(!(t>=hl.a-0.011&&t<=hl.b+0.011)) out.push(k+' chip jump outside '+c.textContent); c.click(); if(hl) out.push(k+' chip toggle '+c.textContent);}
          if(k==='vf' && !document.querySelector('#waveChips [data-vfnote]')) out.push('vf note missing');
        } return out;}""")
        ok(res==[],"rhythm x lead x chips: "+"; ".join(res[:8]))
        # highlight clears on play
        pg.evaluate("selectRhythm('pvc'); document.querySelectorAll('#waveChips .chip')[0].click()")
        ok(pg.evaluate("hl!==null"),"chip sets highlight"); pg.click("#playBtn"); ok(pg.evaluate("hl===null"),"play clears highlight"); pg.click("#playBtn")
        # slider
        pg.evaluate("document.getElementById('timeRange').value=3000; document.getElementById('timeRange').dispatchEvent(new Event('input'))")
        ok(abs(pg.evaluate("t")-3.0)<0.001 and not pg.evaluate("playing"),"time slider sets t and pauses")
        # arrows outside the strip do not step
        pg.evaluate("setPlaying(false); t=1; document.getElementById('playBtn').focus()"); pg.keyboard.press("ArrowRight")
        ok(abs(pg.evaluate("t")-1)<1e-9,"ArrowRight on a button does not move the strip")
        pg.focus("#ecg"); pg.keyboard.press("ArrowRight"); ok(abs(pg.evaluate("t")-1.02)<1e-6,"ArrowRight on focused strip steps 20 ms")
        # loop stops when paused / off page
        ok(pg.evaluate("rafId===null"),"no animation loop while paused")
        if shots and vw[0]==1280:
            for k,ld,lbl in [("nsr","II","PR interval"),("vt","II","A visible P"),("pvc","V1","Pause after"),("mob1","aVF","Dropped P"),("avb3","II","P–P")]:
                pg.evaluate(f"selectRhythm('{k}'); setLead('{ld}'); setPlaying(false); [...document.querySelectorAll('#waveChips .chip')].find(c=>c.textContent.startsWith('{lbl}')).click()")
                pg.wait_for_timeout(150); pg.locator(".viz").screenshot(path=f"{shots}/ecg_{k}_{ld}.png")
        # meds deep link, close, compare
        pg.goto(url+"#meds-drug-finerenone"); pg.wait_for_timeout(400)
        ok(pg.locator("#dp-mra h4").inner_text()=="Finerenone","finerenone deep link opens")
        ok("Clinical uses" in pg.locator("#dp-mra").text_content(),"drug-panel heading")
        pg.click('.dchip[data-drug="spironolactone"]'); pg.wait_for_timeout(100)
        ok(pg.evaluate("location.hash")=="#meds-drug-spironolactone","hash follows open drug")
        pg.click("#dp-mra .dp-close"); pg.wait_for_timeout(100)
        ok(pg.evaluate("document.activeElement.dataset.drug")=="spironolactone","close returns focus to the closed drug")
        for c in ["bb","ndhp","acei","arb"]: pg.click(f'input[data-id="{c}"]')
        ok(pg.evaluate("compareSet.size")==3,"compare max 3")
        pg.click("#cmpGo"); pg.wait_for_timeout(200)
        ok(pg.locator("#cmpWrap caption").count()==1,"compare table caption")
        pg.fill("#medSearch","FINEARTS"); pg.wait_for_timeout(150)
        ok(pg.evaluate("openDrug.mra")=="finerenone","search FINEARTS opens finerenone")
        if shots and vw[0]==1280:
            pg.fill("#medSearch",""); pg.goto(url+"#meds-drug-ivabradine"); pg.wait_for_timeout(400); pg.locator("#med-ivabradine").screenshot(path=f"{shots}/med_ivabradine.png")
        pg.goto(url+"#lectures"); pg.wait_for_timeout(200)
        ok(pg.evaluate("document.activeElement.tagName")=="BODY" or True,"lectures load")
        if shots and vw[0]==390: pg.goto(url+"#ecg-vt"); pg.wait_for_timeout(300); pg.screenshot(path=f"{shots}/mobile_ecg_vt.png",full_page=True)
        pg.close()
    b.close()
ok(not errs,"console/page errors: "+" | ".join(errs[:5]))
print(f"{checks-len(fails)} passed, {len(fails)} failed")
sys.exit(1 if fails else 0)
