/**
 * Google Apps Script — REST API for Service Tracker
 *
 * SETUP:
 * 1. Create a Google Sheet named "Family Vehicle Tracker"
 * 2. Create these tabs (sheets): Vehicles, Servicing, PartsChanged, Insurance, Reminders
 * 3. Open Extensions → Apps Script
 * 4. Paste this entire code into Code.gs
 * 5. Click Deploy → New Deployment
 * 6. Select type "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone" (or "Anyone with link" for more security)
 * 9. Copy the deployment URL
 * 10. Paste the URL into src/config/sheets.ts in the app
 *
 * IMPORTANT: After any code changes, create a NEW deployment
 * (Deploy → New Deployment → Web app) for changes to take effect.
 */

// ===== GET handler (Pull data) =====
function doGet(e) {
  try {
    var action = e.parameter.action;
    var sheetName = e.parameter.sheet;

    if (action === "pull" && sheetName) {
      return pullData(sheetName);
    }

    return jsonResponse({ error: "Invalid action. Use ?action=pull&sheet=SheetName" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ===== POST handler (Push data) =====
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var sheetName = payload.sheet;
    var records = payload.records;

    if (action === "push" && sheetName && records) {
      return pushData(sheetName, records);
    }

    return jsonResponse({ error: "Invalid action. Send { action: 'push', sheet: '...', records: [...] }" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ===== Pull all data from a sheet =====
function pullData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return jsonResponse({ error: "Sheet '" + sheetName + "' not found", records: [] });
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ records: [] }); // Only header row or empty
  }

  var headers = data[0];
  var records = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var record = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) {
        record[headers[j]] = row[j] !== undefined ? String(row[j]) : "";
      }
    }
    // Only include rows with a valid id
    if (record.id) {
      records.push(record);
    }
  }

  return jsonResponse({ records: records });
}

// ===== Push records to a sheet (upsert) =====
function pushData(sheetName, records) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = ss.insertSheet(sheetName);
  }

  // Get or create headers
  var data = sheet.getDataRange().getValues();
  var headers = [];

  if (data.length > 0 && data[0].length > 0 && data[0][0] !== "") {
    headers = data[0];
  } else {
    // Create headers from first record
    if (records.length > 0) {
      headers = Object.keys(records[0]);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      data = [headers];
    }
  }

  // Build a map of existing rows by id
  var idCol = headers.indexOf("id");
  var existingIds = {};
  for (var i = 1; i < data.length; i++) {
    if (idCol >= 0 && data[i][idCol]) {
      existingIds[String(data[i][idCol])] = i + 1; // 1-indexed row number
    }
  }

  var pushed = 0;

  for (var r = 0; r < records.length; r++) {
    var record = records[r];
    var rowData = headers.map(function (h) {
      return record[h] !== undefined && record[h] !== null ? String(record[h]) : "";
    });

    // Check for new columns in the record
    var recordKeys = Object.keys(record);
    for (var k = 0; k < recordKeys.length; k++) {
      if (headers.indexOf(recordKeys[k]) === -1) {
        headers.push(recordKeys[k]);
        rowData.push(record[recordKeys[k]] !== undefined ? String(record[recordKeys[k]]) : "");
      }
    }

    var recordId = String(record.id);

    if (existingIds[recordId]) {
      // Update existing row
      var rowNum = existingIds[recordId];
      sheet.getRange(rowNum, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Append new row
      sheet.appendRow(rowData);
      existingIds[recordId] = sheet.getLastRow();
    }
    pushed++;
  }

  // Update headers if new columns were added
  if (headers.length > data[0].length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  return jsonResponse({ success: true, pushed: pushed });
}

// ===== Helper: return JSON response =====
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
