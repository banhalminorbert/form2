/**
 * Digitális Entitás Audit – Google Workspace / Apps Script form backend
 *
 * Mit csinál?
 * 1) Fogadja a HTML form POST beküldését.
 * 2) Archiválja a teljes beküldést Google Sheetbe.
 * 3) Email értesítést küld a Google Business / Workspace email címre.
 * 4) Sikeres beküldés után visszairányítja a felhasználót a form ?sent=1 URL-re.
 */

const CONFIG = {
  RECIPIENT_EMAIL: 'office@vipach.at',
  SPREADSHEET_NAME: 'Digitális Entitás Audit – beküldések',
  SHEET_NAME: 'Beküldések',
  DEFAULT_SUCCESS_URL: 'https://form.vipach.at/?sent=1',

  // Élesítés után átállítható true-ra, ha csak a saját domainről engednéd a beküldést.
  STRICT_SOURCE_CHECK: false,
  ALLOWED_SOURCE_PREFIXES: ['https://form.vipach.at'],
};

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px">' +
    '<h2>Digitális Entitás Audit form endpoint aktív.</h2>' +
    '<p>Ez az URL a HTML űrlap beküldési végpontja. A form POST kéréssel küldi ide az adatokat.</p>' +
    '</body></html>'
  );
}

function doPost(e) {
  const now = new Date();
  const payload = parsePayload_(e);

  payload.serverTimestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  payload.serverTimestampIso = now.toISOString();

  try {
    if (payload._honey && String(payload._honey).trim()) {
      // Botnak tűnő beküldés: nem küldünk emailt, nem írunk éles sort, de nem áruljuk el a botnak.
      return redirectHtml_(payload._next || CONFIG.DEFAULT_SUCCESS_URL);
    }

    validateSource_(payload);

    const sheetUrl = appendToSheet_(payload);

    try {
      sendNotificationEmail_(payload, sheetUrl);
    } catch (mailError) {
      payload.emailSendError = String(mailError && mailError.message ? mailError.message : mailError);
      appendToSheet_(payload, 'Email hibák');
    }

    return redirectHtml_(payload._next || CONFIG.DEFAULT_SUCCESS_URL);
  } catch (error) {
    const safeMessage = String(error && error.message ? error.message : error);
    try {
      MailApp.sendEmail({
        to: CONFIG.RECIPIENT_EMAIL,
        subject: 'HIBA – Digitális Entitás Audit form beküldés',
        body: 'Hiba történt a form feldolgozása közben:\n\n' + safeMessage + '\n\nPayload:\n' + JSON.stringify(payload, null, 2),
      });
    } catch (ignored) {}

    return HtmlService.createHtmlOutput(
      '<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px;color:#17283D">' +
      '<h2>A beküldés technikai hibába ütközött.</h2>' +
      '<p>Kérjük, lépjen vissza, mentse le PDF-be a válaszokat, és próbálja újra később.</p>' +
      '<p style="color:#6B7280;font-size:13px">Hiba: ' + escapeHtml_(safeMessage) + '</p>' +
      '</body></html>'
    );
  }
}

function testSetup() {
  const demoPayload = {
    _subject: 'TESZT – Digitális Entitás Audit',
    name: 'Teszt Beküldő',
    email: CONFIG.RECIPIENT_EMAIL,
    companyName: 'Teszt Cég',
    clientPageUrl: 'manual-test',
    'Teljes kérdések és válaszok': 'Ez egy teszt beküldés. Ha ezt megkapod emailben és látod a Google Sheetben, a backend működik.',
    serverTimestamp: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    serverTimestampIso: new Date().toISOString(),
  };
  const sheetUrl = appendToSheet_(demoPayload);
  sendNotificationEmail_(demoPayload, sheetUrl);
  Logger.log('Teszt kész. Sheet: ' + sheetUrl);
}

function parsePayload_(e) {
  const payload = {};

  if (e && e.parameters) {
    Object.keys(e.parameters).forEach((key) => {
      const value = e.parameters[key];
      payload[key] = Array.isArray(value) ? value.join('\n') : value;
    });
  } else if (e && e.parameter) {
    Object.keys(e.parameter).forEach((key) => {
      payload[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.type && e.postData.type.indexOf('application/json') !== -1) {
    try {
      Object.assign(payload, JSON.parse(e.postData.contents || '{}'));
    } catch (error) {
      payload.jsonParseError = String(error && error.message ? error.message : error);
    }
  }

  return payload;
}

function validateSource_(payload) {
  if (!CONFIG.STRICT_SOURCE_CHECK) return;
  const source = String(payload.clientPageUrl || payload.formSourceUrl || '');
  const allowed = CONFIG.ALLOWED_SOURCE_PREFIXES.some((prefix) => source.indexOf(prefix) === 0);
  if (!allowed) {
    throw new Error('Nem engedélyezett forrásoldal: ' + source);
  }
}

function appendToSheet_(payload, sheetNameOverride) {
  const ss = getOrCreateSpreadsheet_();
  const sheetName = sheetNameOverride || CONFIG.SHEET_NAME;
  const sheet = getOrCreateSheet_(ss, sheetName);

  const preferredHeaders = [
    'serverTimestamp',
    'serverTimestampIso',
    'name',
    'email',
    'contactPhone',
    'companyName',
    'companyWebsite',
    'auditFocus',
    'billingName',
    'billingEmail',
    'Teljes kérdések és válaszok',
    'clientPageUrl',
    'clientUserAgent',
    'emailSendError',
  ];

  const payloadKeys = Object.keys(payload).filter((key) => key !== '_honey');
  let headers = getHeaders_(sheet);

  if (!headers.length) {
    headers = preferredHeaders.concat(payloadKeys.filter((key) => preferredHeaders.indexOf(key) === -1));
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const missing = payloadKeys.filter((key) => headers.indexOf(key) === -1);
    if (missing.length) {
      headers = headers.concat(missing);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  const row = headers.map((key) => payload[key] || '');
  sheet.appendRow(row);
  autoResize_(sheet, headers.length);

  return ss.getUrl();
}

function getOrCreateSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty('SUBMISSIONS_SPREADSHEET_ID');

  if (existingId) {
    try {
      return SpreadsheetApp.openById(existingId);
    } catch (error) {
      props.deleteProperty('SUBMISSIONS_SPREADSHEET_ID');
    }
  }

  const ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  props.setProperty('SUBMISSIONS_SPREADSHEET_ID', ss.getId());
  return ss;
}

function getOrCreateSheet_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  return sheet;
}

function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (!lastColumn) return [];
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(Boolean);
}

function autoResize_(sheet, columns) {
  try {
    sheet.autoResizeColumns(1, Math.min(columns, 20));
  } catch (ignored) {}
}

function sendNotificationEmail_(payload, sheetUrl) {
  const subject = payload._subject || 'Digitális Entitás Audit – új beküldés';
  const senderName = payload.name || payload.contactName || 'Ismeretlen kitöltő';
  const senderEmail = payload.email || payload._replyto || payload.billingEmail || '';
  const company = payload.companyName || '';
  const fullAnswers = payload['Teljes kérdések és válaszok'] || '';

  const summaryHtml = [
    ['Beküldés ideje', payload.serverTimestamp || ''],
    ['Név', senderName],
    ['Email', senderEmail],
    ['Cég / márka', company],
    ['Weboldal', payload.companyWebsite || ''],
    ['Forrásoldal', payload.clientPageUrl || payload.formSourceUrl || ''],
    ['Google Sheet archívum', sheetUrl],
  ].map((row) => '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;background:#f9fafb;width:180px">' + escapeHtml_(row[0]) + '</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">' + linkOrText_(row[1]) + '</td></tr>').join('');

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;color:#17283D;line-height:1.55">' +
    '<h2 style="margin:0 0 12px">Új Digitális Entitás Audit beküldés</h2>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:900px;border:1px solid #e5e7eb">' + summaryHtml + '</table>' +
    '<h3 style="margin:24px 0 8px">Teljes kérdések és válaszok</h3>' +
    '<pre style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-family:Arial,sans-serif;font-size:13px;line-height:1.55">' + escapeHtml_(fullAnswers || JSON.stringify(payload, null, 2)) + '</pre>' +
    '</div>';

  const plainBody =
    'Új Digitális Entitás Audit beküldés\n\n' +
    'Beküldés ideje: ' + (payload.serverTimestamp || '') + '\n' +
    'Név: ' + senderName + '\n' +
    'Email: ' + senderEmail + '\n' +
    'Cég / márka: ' + company + '\n' +
    'Google Sheet archívum: ' + sheetUrl + '\n\n' +
    'Teljes kérdések és válaszok:\n\n' +
    (fullAnswers || JSON.stringify(payload, null, 2));

  const mailOptions = {
    to: CONFIG.RECIPIENT_EMAIL,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
    name: 'Digitális Entitás Audit Form',
  };

  if (senderEmail && senderEmail.indexOf('@') !== -1) {
    mailOptions.replyTo = senderEmail;
  }

  MailApp.sendEmail(mailOptions);
}

function redirectHtml_(url) {
  const safeUrl = url || CONFIG.DEFAULT_SUCCESS_URL;
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head>' +
    '<meta charset="utf-8">' +
    '<meta http-equiv="refresh" content="0;url=' + escapeAttr_(safeUrl) + '">' +
    '<title>Beküldés sikeres</title>' +
    '</head><body style="font-family:Arial,sans-serif;padding:24px;color:#17283D">' +
    '<h2>Beküldés sikeres.</h2>' +
    '<p>Visszairányítjuk az oldalra...</p>' +
    '<script>window.location.replace(' + JSON.stringify(safeUrl) + ');</script>' +
    '</body></html>'
  );
}

function linkOrText_(value) {
  const text = String(value || '');
  if (/^https?:\/\//i.test(text)) {
    return '<a href="' + escapeAttr_(text) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml_(text) + '</a>';
  }
  return escapeHtml_(text);
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr_(value) {
  return escapeHtml_(value).replace(/\n/g, ' ');
}
