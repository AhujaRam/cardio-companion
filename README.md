# Cardio Companion

A visual cardiology learning site for first-year medical students at uOttawa. It supports the cardiology lectures and never replaces them. Students can use it before lecture to preview the material or during lecture to follow along.

## Sections

- **Visual ECG Learner** (main feature): a 6-second lead II strip (25 mm/s, 10 mm/mV) plays beside an animated four-chamber heart. Each wave and interval lights up the part of the heart that is depolarizing or repolarizing at that moment. Click the strip or use "Jump to" to freeze on a wave. Covers 13 rhythms: normal sinus rhythm, sinus bradycardia and tachycardia, first-degree, Mobitz I, Mobitz II and third-degree AV block, atrial fibrillation, atrial flutter, AVNRT, PVC, ventricular tachycardia and ventricular fibrillation.
- **Lecture Companion**: one page per lecture with a preview, follow-along notes, objectives, readings and links to related rhythms and drugs.
- **Medications**: drug classes with mechanism, indications, side effects and contraindications, with search and side-by-side comparison of up to three classes.

## Running it

The whole site is one self-contained file, `index.html`, with no build step or dependencies. Open it in a browser, or serve the folder with any static host (for example GitHub Pages).

Direct links use the hash, for example `index.html#ecg-mob1`, `#meds-anticoag` or `#lectures-hf`.

## Status

- The lecture list is a draft outline and still needs to be matched to the official block schedule.
- ECG traces are generated from textbook timings, not real recordings. They should be replaced or checked against the ECGs shown in class.
- All clinical content is pending faculty review. For learning only, not for clinical decisions.

Not an official University of Ottawa or University of Ottawa Heart Institute resource. The colour palette follows ottawaheart.ca for visual consistency.
