# VIPACH for Business — stratégiai diagnózis form

Domain: `form.vipach.at`

Ez a jelszóval védett űrlap a business.vipach.at kapcsolatfelvétel utáni stratégiai diagnosztikai kérdőíve.

## Fő javítások

- A design a VIPACH for Business navy blue / óarany arculatához igazítva.
- Külső Google Fonts hivatkozás eltávolítva.
- Noindex / nofollow / AI crawler tiltás megtartva.
- Art. 13 GDPR / DSGVO logika szerint bővített adatvédelmi tájékoztató.
- AVV / DPA / Google Workspace feldolgozási háttér feltüntetve.
- AI-eszközök használata emberi kontroll melletti elemzési segédeszközként megfogalmazva.
- Számlázási mezők adatminimalizálási okból nem kötelezők az auditindítási szakaszban.
- Google Apps Script endpoint beállítva és source check form.vipach.at domainre szigorítva.

## Fontos élesítési ellenőrzés

A Google Apps Script `google-apps-script-Code.gs` fájlban a `STRICT_SOURCE_CHECK: true`, ezért az éles formot `https://form.vipach.at` alatt kell tesztelni.

Ha lokális tesztelés kell, ideiglenesen állítsa `STRICT_SOURCE_CHECK: false` értékre, vagy adja hozzá a lokális URL prefixet az `ALLOWED_SOURCE_PREFIXES` listához.
