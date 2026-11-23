# Cardio Companion

A visual cardiology learning site for first-year medical students at uOttawa. It supports the cardiology lectures and never replaces them. Students can use it before lecture to preview the material or during lecture to follow along.

## Sections

- **Visual ECG Learner** (main feature): a 6-second lead II strip (25 mm/s, 10 mm/mV) plays beside an animated four-chamber heart. Each wave and interval lights up the part of the heart that is depolarizing or repolarizing at that moment. Click the strip or use "Jump to" to freeze on a wave. Covers 14 rhythms: normal sinus rhythm, sinus bradycardia and tachycardia, first-degree, Mobitz I, Mobitz II and third-degree AV block, atrial fibrillation, atrial flutter (2:1 and 4:1), AVNRT, PVC, ventricular tachycardia and ventricular fibrillation. Normal values, the count-off rate method and the Rate → Rhythm → Axis → Alphabet approach follow the uOttawa ECG Manual (2016), and rhythms are linked to the matching manual cases.
- **Lecture Companion**: Myocardial Contraction and Ventricular Function (Dr. Wenbin Liang, January 7, 2026), plus the objectives of ECG sessions 1–4 from the ECG Manual. Each lecture has a preview, follow-along notes, objectives, readings and links to related drugs. Remaining lectures are pending.
- **Medications**: drug classes with mechanism, indications, side effects and contraindications, with search and side-by-side comparison of up to three classes.

## Running it

The whole site is one self-contained file, `index.html`, with no build step or dependencies. Open it in a browser, or serve the folder with any static host (for example GitHub Pages).

Direct links use the hash, for example `index.html#ecg-mob1`, `#meds-anticoag` or `#lectures-hf`.

## Status

- Lecture summaries are written in our own words; slides are not reproduced (the lecture slides may not be posted online without the author's permission).
- 12-lead modules (axis, atrial enlargement, LVH/RVH, ST changes, Q waves) from ECG Manual sessions 2–3 are pending.
- ECG traces are generated from textbook timings, not real recordings. They should be replaced or checked against the ECGs shown in class.
- All clinical content is pending faculty review. For learning only, not for clinical decisions.

Not an official University of Ottawa or University of Ottawa Heart Institute resource. The colour palette follows ottawaheart.ca for visual consistency.
