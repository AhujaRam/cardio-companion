# Cardio Companion

A visual cardiology learning site for first-year medical students at uOttawa. It supports the cardiology lectures and never replaces them. Students can use it before lecture to preview the material or during lecture to follow along.

## Sections

- **Visual ECG Learner** (main feature): a 6-second strip in any of the 12 leads (25 mm/s, 10 mm/mV) plays beside an animated four-chamber heart. Each wave and interval lights up the part of the heart that is depolarizing or repolarizing at that moment. The heart is a hand-drawn frontal four-chamber cutaway (thin atrial walls, thick LV wall and septum, valves, chordae, papillary muscles, moderator band, great vessels); activation colours are masked to the myocardium so they never fill chambers or background. Pick any of the 12 leads: the strip is regenerated for that lead from a simplified 3-D dipole model, limb leads show the frontal heart with the lead axis, an eye at its positive pole and the wall it faces, and chest leads switch to a horizontal slice with electrodes V1–V6. A live electrical-vector arrow and its projection show why the trace goes up or down. Click the strip or use "Jump to" to freeze on a wave. Covers 14 rhythms: normal sinus rhythm, sinus bradycardia and tachycardia, first-degree, Mobitz I, Mobitz II and third-degree AV block, atrial fibrillation, atrial flutter (2:1 and 4:1), AVNRT, PVC, ventricular tachycardia and ventricular fibrillation. Normal values, the count-off rate method and the Rate → Rhythm → Axis → Alphabet approach follow the uOttawa ECG Manual (2016), and rhythms are linked to the matching manual cases.
- **Lecture Companion**: Myocardial Contraction and Ventricular Function (Dr. Wenbin Liang, January 7, 2026), plus the objectives of ECG sessions 1–4 from the ECG Manual. Each lecture has a preview, follow-along notes, objectives, readings and links to related drugs. Remaining lectures are pending.
- **Medications**: 19 drug classes with mechanism, indications per current Canadian guidelines (CCS/CHRS, CCS/CHFS, Hypertension Canada, CCS/CAIC, Thrombosis Canada, Heart & Stroke ACLS, SOGC), where each class is used, side effects and contraindications, with search and side-by-side comparison of up to three classes. Every example drug (63 in total) can be tapped to expand a drug page with its Canadian indications (each tagged with its guideline), where it is used, and the landmark trials behind it (who was studied, what was found, why it matters). Direct links use `#meds-drug-<id>`, for example `#meds-drug-apixaban`.

## Live site

https://ahujaram.github.io/cardio-companion/ (served by GitHub Pages from the `main` branch).

## Running it

The whole site is one self-contained file, `index.html`, with no build step or dependencies. Open it in a browser, or serve the folder with any static host (for example GitHub Pages).

Direct links use the hash, for example `index.html#ecg-mob1`, `#meds-anticoag` or `#lectures-ventricular`.

## Status

- Lecture summaries are written in our own words; slides are not reproduced (the lecture slides may not be posted online without the author's permission).
- 12-lead modules (axis, atrial enlargement, LVH/RVH, ST changes, Q waves) from ECG Manual sessions 2–3 are pending.
- ECG traces are generated from textbook timings, not real recordings. They should be replaced or checked against the ECGs shown in class.
- All clinical content is pending faculty review. For learning only, not for clinical decisions.

Not an official University of Ottawa or University of Ottawa Heart Institute resource. The colour palette follows ottawaheart.ca for visual consistency.

## Review log

| Date | Review | Status |
|---|---|---|
| 2026-11-23 | Two independent automated reviews (content, simulation, accessibility) | Findings verified and applied |
| 2026-11-23 | Medical-content review handover (priorities 1–3) | Applied, with ECG Manual values kept and qualified where they differ from general clinical references |
| 2026-11-24 | Drug pages: Canadian guideline indications and landmark trials added; guideline versions checked against CCS, Hypertension Canada and Heart & Stroke sources | Pending faculty review (trial figures are simplified) |
| Pending | Comparison of simulated waveforms with reference 12-lead ECGs | Not yet done. Einthoven relationships (II = I + III; aVR + aVL + aVF = 0) verified numerically |
| Pending | Cardiology faculty review of final text and illustrations, with reviewer name, version and sign-off | Not yet done |
