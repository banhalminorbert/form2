# CHANGELOG — Form design + GDPR/DSGVO/AVV hardening

Dátum: 2026-06-12
Domain: form.vipach.at

## Design
- A form vizuális rendszere a VIPACH for Business oldalhoz lett igazítva: navy blue + óarany, Apple-szerű rendszerfont, prémium kártyaritmus.
- Külső Google Fonts hivatkozás eltávolítva adatvédelmi minimalizálás miatt.
- Reszponzív arculati override bekerült az inline CSS végére.

## GDPR / DSGVO
- Bővített Art. 13 jellegű adatvédelmi tájékoztató készült az űrlapban.
- Külön szerepel: adatkezelő, célok, adatkategóriák, jogalapok, címzettek, Google Workspace feldolgozás, megőrzési idő, érintetti jogok, osztrák Datenschutzbehörde panaszjog.
- Külön figyelmeztetés került az űrlap elejére: ne adjon meg különleges kategóriájú személyes adatot vagy harmadik személy bizalmas adatát.
- A helyi böngészős mentés / localStorage adatvédelmi szerepe meg lett magyarázva.

## AVV / DPA
- A Google Apps Script / Sheets / Gmail / Workspace adatfeldolgozási háttér szerepel.
- A Google DPA / AVV és harmadik országbeli adattovábbítás óvatos, nem túlígérő módon került megfogalmazásra.
- Külön megjegyzés: Workspace-admin oldalon a DPA/AVV elfogadását és jogosultságokat élesítés előtt ellenőrizni kell.

## Adatminimalizálás
- A számlázási mezők az auditindítási szakaszban nem kötelezők.
- A JS egyedi validációból kikerült a kötelező számlázási adatblokk.
- A számlázási adatokat csak későbbi szerződés/számlázás esetén kell pontosítani.

## Google Script
- A form action endpoint beállítva: AKfycbzBg.../exec.
- A Code.gs-ben `STRICT_SOURCE_CHECK` true értékre lett állítva.
- Engedélyezett forrás: form.vipach.at.

## Kereskedelmi óvatosság
- A díjmentesség nem általános ígéretként szerepel: csak előzetes írásos visszaigazolás esetén értelmezhető.
