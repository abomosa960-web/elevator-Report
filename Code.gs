// وسيط تنزيل تقارير Loopers لصفحة "تقارير الفلك"
// يُستخدم فقط لو الصفحة لم تستطع تنزيل التقارير مباشرة.
// النشر: Deploy > New deployment > Web app
//   Execute as: Me    |    Who has access: Anyone
// ثم انسخ رابط الـ Web app (ينتهي بـ /exec) وضعه في «الإعدادات» داخل الصفحة.

function doGet(e) {
  var url = (e && e.parameter && e.parameter.url) || '';
  // يقبل روابط Loopers فقط
  if (!/^https?:\/\/([a-z0-9-]+\.)*loopers\.tech\//i.test(url)) {
    return json_({ error: 'رابط غير مسموح' });
  }
  try {
    var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    return json_({ status: r.getResponseCode(), b64: Utilities.base64Encode(r.getBlob().getBytes()) });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
