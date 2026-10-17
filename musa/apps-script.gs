/**
 * لوحة أبطال لعبة "جري البطل موسى"
 * الكود ده بيحفظ أسماء اللاعيبة والسكور في شيت جوجل، ويرجّع أحسن 5.
 *
 * الإعداد (مرة واحدة):
 * 1) شيت "أبطال موسى" في جوجل درايف (الـ ID تحت في SPREADSHEET_ID).
 * 2) مشروع Apps Script مستقل فيه الكود ده.
 * 3) لو اتعمل شيت جديد، غيّر SPREADSHEET_ID.
 * 4) Deploy ← New deployment ← النوع Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 *    ثم Deploy، ووافق على الصلاحيات.
 * 5) انسخ الرابط اللي بيخلص بـ /exec وابعته لكلود.
 */

const SHEET_NAME = 'Scores';
const TOP_N = 5;

const SPREADSHEET_ID = '1nTghUdTPwcPOeZVvYUyKuKK-SBJdQ3Q21YlreUgeJ2Y'; // شيت "أبطال موسى"

function sheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['الاسم', 'المسافة (متر)', 'العملات', 'الوقت']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function top_() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const rows = sh.getRange(2, 1, n, 4).getValues();
  return rows
    .filter(r => r[0] !== '' && !isNaN(Number(r[1])))
    .map(r => ({ name: String(r[0]), score: Number(r[1]), coins: Number(r[2]) || 0, t: Number(r[3]) || 0 }))
    .sort((a, b) => b.score - a.score || b.coins - a.coins)
    .slice(0, TOP_N);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'add') {
    const name = String(p.name || '').replace(/[<>]/g, '').trim().slice(0, 18);
    const score = Math.floor(Number(p.score));
    const coins = Math.floor(Number(p.coins)) || 0;
    const t = Math.floor(Number(p.t)) || Date.now();
    if (!name || !(score >= 0 && score <= 200000) || coins < 0 || coins > 100000) {
      return json_({ ok: false, error: 'bad_input', top: top_() });
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow([name, score, coins, t]);
    } finally {
      lock.releaseLock();
    }
  }
  return json_({ ok: true, top: top_() });
}
