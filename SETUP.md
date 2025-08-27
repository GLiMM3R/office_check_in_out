# Google Apps Script Setup Instructions

## Step-by-Step Setup Guide

### 1. Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Give it a name like "Staff Check-In/Out Log"
4. Copy the Spreadsheet ID from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit`
   - Spreadsheet ID is: `1ABC123DEF456GHI789JKL`

### 2. Setup Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js`
4. In the script, find this line:
   ```javascript
   # Google Apps Script Setup Instructions
   ```

## Step-by-Step Setup Guide

### 1. Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Give it a name like "Staff Check-In/Out Log"
4. Copy the Spreadsheet ID from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit`
   - Spreadsheet ID is: `1ABC123DEF456GHI789JKL`

### 2. Setup Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js`
4. In the script, find this line:
   ```javascript
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
   ```
5. Replace `YOUR_SPREADSHEET_ID` with your actual Spreadsheet ID from step 1
6. Save the project (Ctrl+S or Cmd+S)
7. Give your project a name like "Staff Check-In/Out API"

### 3. Deploy as Web App

1. In Google Apps Script, click the **Deploy** button (top right)
2. Click **New deployment**
3. Settings:
   - **Type**: Web app
   - **Description**: Staff Check-In/Out API v1
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. You'll see a "Web app URL" - copy this URL
6. It will look like: `https://script.google.com/macros/s/ABC123.../exec`

### 4. Update Frontend Environment

1. In your project, open the `.env` file
2. Replace the URL:
   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Save the file

### 5. Test the Application

1. Run `npm run dev` to start the development server
2. Open the application in your browser
3. Try checking in with test data:
   - Employee ID: TEST001
   - Employee Name: Test User
   - Action: Check In
   - Location: Main Office
4. Check your Google Sheets to see if the data appears

## CORS Solution Implemented

✅ **CORS Issues Fixed!**

The application now uses **JSONP (JSON with Padding)** instead of regular fetch requests, which completely bypasses CORS restrictions. This is a reliable solution that works with:

- Local development (localhost)
- Ngrok tunnels
- Any hosting environment
- All modern browsers

### How JSONP Works

1. Instead of making a POST request with JSON data, the app creates a `<script>` tag
2. The script tag loads data from Google Apps Script as a GET request with query parameters
3. Google Apps Script returns JavaScript code that calls a callback function
4. The callback function processes the response
5. No CORS restrictions apply to script tags

### Benefits of This Approach

- ✅ No CORS issues
- ✅ Works with any domain/subdomain
- ✅ Compatible with all browsers
- ✅ No server-side proxy needed
- ✅ Reliable for production use

## Troubleshooting

### Option 1: Test the API Directly

1. Open your Google Apps Script Web App URL in a browser
2. You should see a test page explaining the JSONP format
3. If it doesn't load, there's an issue with the deployment

### Option 2: Check Deployment Settings

Make sure your deployment has:

- **Execute as**: Me (your email)
- **Who has access**: Anyone

### Option 3: Redeploy with New Version

If you updated the script code:

1. Go back to Google Apps Script
2. Click **Deploy** → **Manage deployments**
3. Click the edit icon (pencil) next to your deployment
4. Change the version to "New version"
5. Click **Deploy**

### Option 4: Test JSONP Directly

You can test the JSONP endpoint directly in your browser:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?callback=testCallback&employeeId=TEST001&employeeName=Test%20User&action=check-in&location=Main%20Office&notes=Testing&ipAddress=127.0.0.1
```

This should return JavaScript code like:

```javascript
testCallback({"success":true,"message":"Check-in/out recorded successfully",...});
```

## Common Issues

### 1. "Script function not found"

- Make sure you saved the Google Apps Script
- Ensure all functions are properly defined
- Redeploy with a new version

### 2. "Spreadsheet not found"

- Verify the Spreadsheet ID is correct
- Make sure the Google Sheet exists and is accessible

### 3. "Request timed out"

- Check your internet connection
- Verify the Google Apps Script URL is correct
- Make sure Google Apps Script is not down

### 4. Data not appearing in sheets

- Check if the sheet name matches (default is "Staff Check-In/Out")
- Verify the spreadsheet ID is correct
- Look for error messages in the app

## Security Notes

- The web app is set to "Anyone" access for simplicity
- In production, consider restricting access to your organization
- IP addresses are logged for security tracking
- All timestamps are in UTC
- JSONP is secure when used with trusted endpoints (Google Apps Script)

## Data Format in Google Sheets

| Column A            | Column B    | Column C      | Column D | Column E    | Column F      | Column G      |
| ------------------- | ----------- | ------------- | -------- | ----------- | ------------- | ------------- |
| Timestamp           | Employee ID | Employee Name | Action   | Location    | Notes         | IP Address    |
| 2025-08-27 10:30:00 | EMP001      | John Doe      | check-in | Main Office | Starting work | 192.168.1.100 |

```
5. Replace `YOUR_SPREADSHEET_ID` with your actual Spreadsheet ID from step 1
6. Save the project (Ctrl+S or Cmd+S)
7. Give your project a name like "Staff Check-In/Out API"

### 3. Deploy as Web App

1. In Google Apps Script, click the **Deploy** button (top right)
2. Click **New deployment**
3. Settings:
- **Type**: Web app
- **Description**: Staff Check-In/Out API v1
- **Execute as**: Me (your email)
- **Who has access**: Anyone
4. Click **Deploy**
5. You'll see a "Web app URL" - copy this URL
6. It will look like: `https://script.google.com/macros/s/ABC123.../exec`

### 4. Update Frontend Environment

1. In your project, open the `.env` file
2. Replace the URL:
```

VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

````
3. Save the file

### 5. Test the Application

1. Run `npm run dev` to start the development server
2. Open the application in your browser
3. Try checking in with test data:
- Employee ID: TEST001
- Employee Name: Test User
- Action: Check In
- Location: Main Office
4. Check your Google Sheets to see if the data appears

## Troubleshooting CORS Issues

If you still encounter CORS errors:

### Option 1: Redeploy the Web App

1. Go back to Google Apps Script
2. Click **Deploy** → **Manage deployments**
3. Click the edit icon (pencil) next to your deployment
4. Change the version to "New version"
5. Click **Deploy**
6. Update your `.env` file with the new URL

### Option 2: Check Deployment Settings

Make sure your deployment has:

- **Execute as**: Me (your email)
- **Who has access**: Anyone

### Option 3: Test the API Directly

1. Open your Google Apps Script Web App URL in a browser
2. You should see a test page
3. If it doesn't load, there's an issue with the deployment

### Option 4: Alternative Testing Method

If CORS issues persist, you can test by creating a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
 <title>Test Check-In</title>
</head>
<body>
 <form method="POST" action="YOUR_WEB_APP_URL">
   <input type="hidden" name="employeeId" value="TEST001" />
   <input type="hidden" name="employeeName" value="Test User" />
   <input type="hidden" name="action" value="check-in" />
   <input type="hidden" name="location" value="Main Office" />
   <input type="hidden" name="notes" value="Testing" />
   <input type="hidden" name="ipAddress" value="127.0.0.1" />
   <button type="submit">Test Check-In</button>
 </form>
</body>
</html>
````

## Common Issues

### 1. "Script function not found"

- Make sure you saved the Google Apps Script
- Ensure all functions are properly defined

### 2. "Spreadsheet not found"

- Verify the Spreadsheet ID is correct
- Make sure the Google Sheet exists and is accessible

### 3. "Permission denied"

- Ensure the deployment is set to "Anyone" access
- Try redeploying with "New version"

### 4. Data not appearing in sheets

- Check if the sheet name matches (default is "Staff Check-In/Out")
- Verify the spreadsheet ID is correct

## Security Notes

- The web app is set to "Anyone" access for simplicity
- In production, consider restricting access to your organization
- IP addresses are logged for security tracking
- All timestamps are in UTC

## Data Format in Google Sheets

| Column A            | Column B    | Column C      | Column D | Column E    | Column F      | Column G      |
| ------------------- | ----------- | ------------- | -------- | ----------- | ------------- | ------------- |
| Timestamp           | Employee ID | Employee Name | Action   | Location    | Notes         | IP Address    |
| 2025-08-27 10:30:00 | EMP001      | John Doe      | check-in | Main Office | Starting work | 192.168.1.100 |
