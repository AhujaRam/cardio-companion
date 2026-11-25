# Response to the independent pre-publication audit (2026-11-24)

- **Audited source:** `main` at `55d948cc64239d27b63a2749b4acb0a24ef3d831`; rebased onto `1d55f72` (heart illustration update) before pushing
- **Candidate:** branch `audit-fixes-2026-11-24` (commit SHA in the git log; not yet pushed or deployed)
- **Deployed build:** not checked against the candidate; GitHub Pages still serves `main`
- **Tests run:** `node tests/model.test.js` (1,293 checks, 0 failures) and `python3 tests/browser_smoke.py` (headless Chrome at 1280 px and 390 px; 39 checks, 0 failures, no console errors)
- **Not done:** cardiology or pharmacist review, comparison of traces with licensed reference ECGs, screen-reader testing (VoiceOver/NVDA), real iOS/Android devices, automated axe scan, link check of every external URL

Status key: **Fixed** · **Partly fixed** · **Deferred** (needs a decision or more work) · **Pending lecturer** · **Not changed** (with reason)

## P0 and P1 decisions

| Ticket | Decision | Reason / source | Identifiers changed | Test evidence | Reviewer needed | Status |
|---|---|---|---|---|---|---|
| ECG-01 | Augmented leads now scaled by √3/2 through one `leadGain()` used by both the strip and the narration; narration now reads the plotted sample itself | Mathematical defect confirmed (x-only unit vector gave aVR −0.866, should be −0.75) | `AUG_GAIN`, `leadGain`, `project`, `updateLeadView`, lead-bar note | All 5 limb identities hold sample-by-sample for 14 rhythms and random vectors (max error < 1e-5); browser: displayed sign matches canvas sample for 168 rhythm×lead cases | No | Fixed |
| ECG-02 | VT sinus clock changed to P–P 0.73 s (≈ 82/min) against VT R–R 0.40 s, so each P lands at a different point of the cycle; P–P chip and a "visible P wave" chip; caveat that retrograde conduction can hide dissociation | Phase lock confirmed (P always 0.2 s after a QRS) | `RHYTHMS.vt` build/meas/keys/pearl, `intervals` | 8 distinct P–QRS offsets in 6 s; visible-P chip exists | Cardiology: compare with a real VT tracing | Fixed (pending visual review) |
| ECG-03 | Event-specific chips: Mobitz I PR series + dropped P; Mobitz II pre-drop PR + dropped P + P–P; CHB P–P vs R–R; flutter F–F and conduction ratio; AF shortest/longest R–R; PVC QRS, coupling, pause, sinus-to-sinus; VT P–P and visible P. R–R now QRS onset to onset. Highlight clears on play or when the cursor leaves it; VF shows an explanation instead of a disabled chip | Confirmed | `intervals`, chip handler, `clearHL`, `checkHL`, `setPlaying` | Values asserted: 160/260/320 ms; 480/1120/1600 ms; F–F 200 ms; 2:1 and 4:1 | No | Fixed |
| ECG-04 | Intervals labelled as model-defined timings; QT rule (0.41√RR, Bazett-style) disclosed; repolarization shading now ends at T end; heart state computed once per frame; cursor dot and narration use the same sample; loop and calibration wording | Confirmed | Chip note, NSR QT row, `heartState`, `updateHeart(Inner)`, `stripMeta` | Event ordering (QRS → T) checked for every beat; blue = 0 at T end | Cardiology: 168-case visual review against reference ECGs | Partly fixed (visual validation not done) |
| ECG-05 | Rhythm wording updated: brady (reversible causes, atropine often fails below the node), tachy (onset not shown), avb1 (site of delay), mob1 (not always benign), mob2 (2:1 caveat), avb3 (dissociation ≠ proof; reversible causes), AF (refractoriness, not "random"), flutter (adenosine only in stable monitored patients; 75/min ≠ sinus), AVNRT (retrograde P omitted; SVT can be wide), PVC (coupling/pause numbers), VF (no coordinated effective contraction), aVR and territory wording | Source-confirmed wording issues | `RHYTHMS.*`, `TXT.VF`, `LEAD_INFO.aVR`, lead captions | Data test passes | Cardiology | Fixed |
| ECG-06 | Session 3 link relabelled as related practice; sessions 2–3 marked incomplete; manual vs clinical QRS cut-offs shown side by side. Manual values not changed | Lecture/manual values need the manual | `ECG_SESSIONS`, ECG card text | n/a | Course director (manual edition/page) | Partly fixed; rest pending lecturer |
| MED-01 | Removed the blanket "no survival" claim; nitrates alone vs H-ISDN separated; "every patient" qualified; diagnostic inference from nitro relief removed; PDE-5/riociguat wording points to the monograph; A-HeFT described as the combination in self-identified Black patients | Internal contradiction confirmed | `MEDS.nitrates`, `MEDS.hydralazine`, `DRUGS.ntg/isdn/hydralazine` | Regression test | Pharmacist/cardiology | Fixed |
| MED-02 | Warfarin "only" removed; CHADS-65 stated with the under-65 no-risk-factor case; device-detected AF noted; DOAC exclusions and per-agent monitoring/reversal; ASA no longer "lifelong for all"; AF+PCI short triple therapy option; AUGUSTUS limits stated | Confirmed | `MEDS.anticoag/antiplatelet`, `DRUGS.warfarin/asa/clopidogrel` | Regression test | Pharmacist/cardiology | Fixed |
| MED-03 | Stability and pulse check first in SVT/VT/flutter/brady pearls; adenosine limited to stable monitored regular rhythms; adenosine dose removed; no verapamil/diltiazem for undifferentiated WCT; procainamide AF cardioversion qualified (onset, stroke risk, anticoagulation); PROCAMIO denominator corrected (62 analyzed); RAFF2 "not equivalence" | Confirmed | `RHYTHMS.svt/afl/vt/brady`, `MEDS.adenosine/ndhp/antiarr`, `DRUGS.adenosine/procainamide` | Regression test | Cardiology/ED faculty against the Heart & Stroke 2025 algorithms | Fixed (pending guideline line-check) |
| MED-04 | Ivabradine shows guideline, SHIFT and Health Canada label criteria separately (label HR ≥ 77 verified on Health Canada's Summary Basis of Decision for Lancora); hospitalization no longer stated as a guideline requirement | Verified | `MEDS.ivabradine`, `DRUGS.ivabradine`, `GUIDES.hcLancora` | Regression test | Pharmacist | Fixed |
| MED-05 | FINEARTS-HF moved to a new finerenone page (rate ratio 0.84, 95% CI 0.74–0.95, no significant CV-death effect); Health Canada HF indication (LVEF ≥ 40%) cited from its Regulatory Decision Summary; LVEF > 40% vs ≥ 40% boundary stated; MRA lab thresholds limited to spironolactone/eplerenone | Verified Kerendia indication; exact approval month not confirmed | `MEDS.mra`, `DRUGS.eplerenone`, new `DRUGS.finerenone`, `CLASS_DRUGS.mra`, `GUIDES.hcKerendia` | Regression test; deep link `#meds-drug-finerenone` and search "FINEARTS" open it | Pharmacist; check the two 2026 corrections to the 2025 HFnrEF guideline | Fixed (2026 corrections not yet read) |
| MED-06 | Post-MI beta-blocker wording harmonized with the class card (clearest benefit with reduced LVEF); Canadian metoprolol formulation note | Confirmed inconsistency | `DRUGS.metoprolol/bisoprolol` | n/a | Pharmacist: current DPD marketed status of metoprolol CR products | Fixed; formulation status pending |
| MED-07 | ARB as alternative when neither ACEi nor ARNI can be used; ARNI never with ACEi or second ARB, 36 h either direction; BNP/NT-proBNP wording | Confirmed | `MEDS.arb/arni` | n/a | Pharmacist | Fixed |
| MED-08 | Irbesartan/HCTZ described as one example start, not the preferred or only start | Confirmed | `MEDS.arb`, `DRUGS.irbesartan` | n/a | Pharmacist | Fixed |
| Class checklist | Loop (no established mortality benefit; sulfa cross-reactivity low), thiazide (metolazone specialist add-on), DHP (immediate-release nifedipine), non-DHP (LVEF threshold, additive with beta blockers), digoxin (no survival benefit, rest rate control), antiarrhythmics (pill-in-pocket selection). Statins, SGLT2 and anticoagulant monograph details not changed | Partly source-confirmed | `MEDS.*`, `DRUGS.ethacrynic` | n/a | Pharmacist | Partly fixed |
| PHY-01 to PHY-10 | Not changed | Lecture values must be checked against the slides first | none | n/a | Dr. Liang | Pending lecturer (see `lecture_discrepancies.md`) |
| REF-01 | Field labels changed to "Clinical uses (Canadian guideline context)"; trial note now says summaries are pending a paper-by-paper check and explains non-significance; new Health Canada sources linked. The evidence registry with DOI/PMID per trial is **not built** | Large task; needs every trial checked | `MED_FIELDS`, `drugPanel`, `buildGuideList`, meds lede | Test: each trial name has one year across cards | Reviewer to verify each number | Deferred (release blocker for official distribution) |
| PUB-01 | Footer adds draft version/date, "not yet faculty reviewed", and a GitHub Issues link for corrections. No reviewer names added | Names need consent and real sign-off | Footer | n/a | Owner | Partly fixed |
| PUB-02 | Not changed | Permission questions for the owner and course | none | n/a | Owner / course | Deferred |
| PUB-03 | Availability text now says what exists and what is pending; "one section per lecture" | Confirmed | Lectures notice/lede, home card | n/a | No | Fixed |
| UX-01 | `aria-current="page"`, route-aware document title (includes rhythm name), focus moves to the new page heading on page-level navigation | Confirmed | `route`, `PAGE_TITLES` | Browser checks | Screen-reader test | Fixed |
| UX-02 | Skip link focuses the current page heading without replacing the hash (plain `#content` still works without JS) | Confirmed | `#skipLink` handler | n/a | No | Fixed |
| UX-03 | Home NSR link now `#ecg-nsr`. Main ECG tab still resumes the last rhythm (intentional) | Confirmed | Home card | Browser check | No | Fixed |
| UX-04 | Focus kept on the chosen filter chip; closing a drug returns focus to that drug; Clear compare moves focus to search | Confirmed | `setMedGroup`, `toggleDrug`, `cmpClear` | Browser check (close focus) | No | Fixed |
| UX-05 | Dense grid not changed | It was a deliberate design choice on 2026-11-24; switching to normal row order changes the look | none | n/a | Owner decision | Deferred |
| UX-06 | Class-specific checkbox names, live status with selected names and "of 3", table caption and header scopes, focus to caption on open | Confirmed | `renderMeds`, `updateCmpBar`, `buildCompare`, `showCompare` | Browser checks | Screen-reader test | Fixed |
| UX-07 | Not changed | Search behaviour works for the tested queries; result count/ambiguity display deferred | none | Search "FINEARTS" checked | No | Deferred |
| UX-08 | Closing a drug only rewrites the URL if the URL points at that drug | Confirmed | `toggleDrug` | Browser check | No | Fixed |
| UX-09 | `aria-controls` added to lecture accordions; subtabs keep the consistent `aria-pressed` pattern | Confirmed | `buildLectures` | n/a | No | Partly fixed (no lecture-panel deep links) |
| UX-10 | Space/arrow shortcuts now only act when the strip has focus (strip is focusable) | Confirmed | canvas `keydown` | Browser checks (arrow on a button does nothing; on strip steps 20 ms) | No | Fixed |
| UX-11 | Time slider (0–6000 ms) with value text | Confirmed | `#timeRange` | Browser check | Touch device test | Fixed |
| UX-12 | Not changed | Needs VoiceOver/NVDA testing first | none | n/a | AT testing | Deferred |
| UX-13 | Hero line draws once (3.2 s) instead of three times | Confirmed | `.hero-line` | n/a | No | Fixed |
| UX-14 to UX-17, UX-19 | Not changed | Need runtime measurement (touch panning, target sizes, contrast, sticky overlap, zoom) | none | Screenshots at 1280 and 390 px only | AT/device testing | Deferred |
| UX-18 | Hero caption now exposed to assistive tech (only the decorative SVG is hidden) | Confirmed | Hero markup | n/a | No | Fixed |
| TECH-01 | Heart-animation error message shown in both views | Confirmed | `updateHeart` | n/a | No | Partly fixed (no retry button) |
| TECH-02 | Data-integrity tests added (class/drug/guide references, trial record shape, year consistency) | Confirmed | `tests/model.test.js` | Passing | No | Fixed |
| TECH-03 | Animation loop runs only while playing on a visible ECG page; stops when paused, off-page or hidden | Confirmed | `loop`, `startLoop`, `setPlaying`, `route` | Browser check (`rafId` null when paused) | Phone profiling | Fixed |
| TECH-05 | Tests added; no CI or axe scan yet | | `tests/` | | | Partly fixed |

## Lecture discrepancies left unchanged

PHY-01 to PHY-10 and the ECG Manual values (QRS < 100 ms, QTc 300–440/450 ms) are unchanged. See `lecture_discrepancies.md`.

## New claims added that still need independent verification

1. Health Canada's heart-failure indication for finerenone was added "in 2026" (indication wording verified on Health Canada's Regulatory Decision Summary; month not confirmed).
2. FIDELIO-DKD summary (about 5,700 patients; about 18% fewer kidney composite events).
3. FINEARTS-HF: CV death alone not significantly reduced; median follow-up about 32 months.
4. PROCAMIO denominators (74 randomized, 62 analyzed, 33 vs 29) and the "well-tolerated" population wording.
5. AUGUSTUS: stent thrombosis numerically higher without ASA; randomization after the initial ACS/PCI.
6. Metoprolol: not every long-acting metoprolol marketed in Canada is succinate CR/XL (check DPD at release).
7. Commonly quoted PDE-5 inhibitor intervals (24 h / 48 h) and riociguat as a nitrate contraindication.
8. The VT strip's new atrial rate (≈ 82/min) is a model choice, not a clinical value.

## Remaining release blockers

- REF-01 evidence registry (primary-paper link and checked numbers for every trial).
- Faculty sign-off: cardiology (traces, pearls, physiology), pharmacist or pharmacology educator (medications), lecturer (discrepancy list).
- Visual comparison of all 14 rhythms × 12 leads with licensed reference ECGs.
- PUB-02 permissions, and screen-reader/device testing.
