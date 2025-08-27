/**
 * Google Apps Script for Staff Check-In/Out System
 *
 * Instructions:
 * 1. Create a new Google Sheets document
 * 2. Open Google Apps Script (script.google.com)
 * 3. Create a new project and paste this code
 * 4. Replace 'YOUR_SPREADSHEET_ID' with your actual spreadsheet ID
 * 5. Deploy as a web app with exe  } catch (error) {
    console.error("Error in doGet:", error);
    const callback = e.parameter.callback;
    if (callback) {
      const response = {
        success: false,
        message: "ຂໍ້ຜິດພາດໃນການປະມວນຜົນຄຳຂໍ: " + error.message,
      };
      return ContentService.createTextOutput(
        callback + "(" + JSON.stringify(response) + ");"
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return HtmlService.createHtmlOutput('<h1>ຂໍ້ຜິດພາດ: ' + error.message + '</h1>');ns set to "Anyone"
 * 6. Copy the web app URL and use it in your React app
 */

// Replace this with your Google Sheets ID
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "Staff Check-In/Out";

/**
 * Initialize the spreadsheet with headers if it doesn't exist
 */
function initializeSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // Check if headers exist
    const headerRange = sheet.getRange(1, 1, 1, 8);
    const headers = headerRange.getValues()[0];

    if (!headers[0]) {
      // Add headers
      const headerValues = [
        "Timestamp",
        "Employee Name",
        "Action",
        "Latitude",
        "Longitude",
        "Location Name",
        "Notes",
        "IP Address",
      ];
      headerRange.setValues([headerValues]);

      // Format headers
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4285f4");
      headerRange.setFontColor("white");

      // Auto-resize columns
      sheet.autoResizeColumns(1, 8);
    }

    return { success: true, message: "Spreadsheet initialized successfully" };
  } catch (error) {
    console.error("Error initializing spreadsheet:", error);
    return {
      success: false,
      message: "Error initializing spreadsheet: " + error.message,
    };
  }
}

/**
 * Handle POST requests for check-in/out data
 */
function doPost(e) {
  // Set CORS headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "3600",
  };

  try {
    let data;

    // Handle both JSON and form data
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // If JSON parsing fails, try to parse as form data
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    // Validate required fields
    if (!data.employeeName || !data.action) {
      const response = ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          message: "ຂາດຂໍ້ມູນທີ່ຈຳເປັນ: ຊື່ພະນັກງານ ຫຼື ການກະທຳ",
        })
      ).setMimeType(ContentService.MimeType.JSON);

      // Add CORS headers
      Object.entries(headers).forEach(([key, value]) => {
        response.setHeader(key, value);
      });

      return response;
    }

    // Initialize spreadsheet if needed
    const initResult = initializeSpreadsheet();
    if (!initResult.success) {
      const response = ContentService.createTextOutput(
        JSON.stringify(initResult)
      ).setMimeType(ContentService.MimeType.JSON);

      // Add CORS headers
      Object.entries(headers).forEach(([key, value]) => {
        response.setHeader(key, value);
      });

      return response;
    }

    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Prepare the data row
    const timestamp = new Date();
    const rowData = [
      timestamp,
      data.employeeName,
      data.action,
      data.latitude || "",
      data.longitude || "",
      data.locationName || "ບໍ່ຮູ້ສະຖານທີ່",
      data.notes || "",
      data.ipAddress || "ບໍ່ຮູ້",
    ];

    // Add the data to the sheet
    sheet.appendRow(rowData);

    // Format the timestamp column
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

    const response = ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "ບັນທຶກການເຂົ້າ-ອອກວຽກສຳເລັດແລ້ວ",
        timestamp: timestamp.toISOString(),
        action: data.action,
      })
    ).setMimeType(ContentService.MimeType.JSON);

    // Add CORS headers
    Object.entries(headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    return response;
  } catch (error) {
    console.error("Error processing request:", error);
    const response = ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "ຂໍ້ຜິດພາດໃນການປະມວນຜົນຄຳຂໍ: " + error.message,
      })
    ).setMimeType(ContentService.MimeType.JSON);

    // Add CORS headers
    Object.entries(headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    return response;
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  const response = ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT
  );

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "3600",
  };

  Object.entries(headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  return response;
}

/**
 * Handle GET requests for JSONP callback
 */
function doGet(e) {
  try {
    const callback = e.parameter.callback;

    // If it's a JSONP request with data
    if (callback && e.parameter.employeeName) {
      const data = e.parameter;

      // Validate required fields
      if (!data.employeeName || !data.action) {
        const response = {
          success: false,
          message: "ຂາດຂໍ້ມູນທີ່ຈຳເປັນ: ຊື່ພະນັກງານ ຫຼື ການກະທຳ",
        };
        return ContentService.createTextOutput(
          callback + "(" + JSON.stringify(response) + ");"
        ).setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      // Initialize spreadsheet if needed
      const initResult = initializeSpreadsheet();
      if (!initResult.success) {
        return ContentService.createTextOutput(
          callback + "(" + JSON.stringify(initResult) + ");"
        ).setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      // Open the spreadsheet
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(SHEET_NAME);

      // Prepare the data row
      const timestamp = new Date();
      const rowData = [
        timestamp,
        data.employeeName,
        data.action,
        data.latitude || "",
        data.longitude || "",
        data.locationName || "ບໍ່ຮູ້ສະຖານທີ່",
        data.notes || "",
        data.ipAddress || "ບໍ່ຮູ້",
      ];

      // Add the data to the sheet
      sheet.appendRow(rowData);

      // Format the timestamp column
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

      const response = {
        success: true,
        message: "ບັນທຶກການເຂົ້າ-ອອກວຽກສຳເລັດແລ້ວ",
        timestamp: timestamp.toISOString(),
        action: data.action,
      };

      return ContentService.createTextOutput(
        callback + "(" + JSON.stringify(response) + ");"
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Regular GET request - show the test page
    const html = `
      <html>
        <head>
          <title>Staff Check-In/Out API</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .status { padding: 20px; border-radius: 5px; margin: 20px 0; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .info { background-color: #e2e3e5; border: 1px solid #d6d8db; color: #383d41; }
            pre { background-color: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>ລະບົບເຂົ້າ-ອອກວຽກ API</h1>
            <div class="status success">
              <strong>ສະຖານະ API:</strong> ເຮັດວຽກປົກກະຕິ ແລະ ພ້ອມຮັບຄຳຂໍ
            </div>
            
            <h2>ຄຳແນະນຳການໃຊ້:</h2>
            <div class="status info">
              <p><strong>JSONP Endpoint:</strong> URL ນີ້ ກັບ callback parameter</p>
              <p><strong>POST Endpoint:</strong> URL ນີ້ (POST requests)</p>
            </div>
            
            <h3>ຮູບແບບຄຳຂໍ JSONP (GET):</h3>
            <pre>?callback=myCallback&employeeName=John%20Doe&action=check-in&latitude=17.123456&longitude=102.123456&locationName=Vientiane&notes=Starting%20work&ipAddress=192.168.1.100</pre>

            <h3>ຮູບແບບ POST JSON:</h3>
            <pre>{
  "employeeName": "John Doe",
  "action": "check-in",
  "latitude": 17.123456,
  "longitude": 102.123456,
  "locationName": "Vientiane",
  "notes": "Starting work",
  "ipAddress": "192.168.1.100"
}</pre>

            <p><strong>ໝາຍເຫດ:</strong> ຄຳຂໍ JSONP ຈະຂ້າມຂໍ້ຈຳກັດ CORS.</p>
          </div>
        </body>
      </html>
    `;

    return HtmlService.createHtmlOutput(html);
  } catch (error) {
    console.error("Error in doGet:", error);
    const callback = e.parameter.callback;
    if (callback) {
      const response = {
        success: false,
        message: "Error processing request: " + error.message,
      };
      return ContentService.createTextOutput(
        callback + "(" + JSON.stringify(response) + ");"
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return HtmlService.createHtmlOutput(
      "<h1>Error: " + error.message + "</h1>"
    );
  }
}

/**
 * Get the last action for a specific employee (for status checking)
 */
function getEmployeeStatus(employeeName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return { success: false, message: "ບໍ່ພົບແຜ່ນງານ" };
    }

    const data = sheet.getDataRange().getValues();

    // Find the last entry for this employee
    for (let i = data.length - 1; i >= 1; i--) {
      // Start from last row, skip header
      if (data[i][1] === employeeName) {
        // Column B is Employee Name
        return {
          success: true,
          lastAction: data[i][2], // Column C is Action
          timestamp: data[i][0], // Column A is Timestamp
          employeeName: data[i][1], // Column B is Employee Name
        };
      }
    }

    return {
      success: true,
      lastAction: null,
      message: "ບໍ່ພົບບັນທຶກກ່ອນໜ້ານີ້",
    };
  } catch (error) {
    console.error("Error getting employee status:", error);
    return { success: false, message: "ຂໍ້ຜິດພາດ: " + error.message };
  }
}
