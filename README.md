# Staff Check-In/Out System

A modern web application for staff to check in and out of work, with data automatically saved to Google Sheets via Google Apps Script.

## Features

- ✅ Simple and intuitive check-in/out interface
- ⏰ Real-time clock display
- 📍 Location selection (Main Office, Branch Office, Remote Work, etc.)
- 📝 Optional notes for each check-in/out
- 📊 Automatic data logging to Google Sheets
- 📱 Responsive design works on all devices
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Icons**: Lucide React

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheets document
2. Copy the Spreadsheet ID from the URL (e.g., `1ABC123...xyz` from `https://docs.google.com/spreadsheets/d/1ABC123...xyz/edit`)

### 2. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with the content from `google-apps-script.js` in this repository
4. Update the `SPREADSHEET_ID` variable with your actual Spreadsheet ID
5. Save the project
6. Deploy as a web app:
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
7. Copy the Web App URL

### 3. Frontend Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `GOOGLE_APPS_SCRIPT_URL` in `src/components/CheckInOutForm.tsx` with your actual Web App URL
4. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Production Deployment

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy to any static hosting service.

## Data Structure

The application saves the following data to Google Sheets:

| Column        | Description                            |
| ------------- | -------------------------------------- |
| Timestamp     | Date and time of check-in/out          |
| Employee ID   | Unique identifier for the staff member |
| Employee Name | Full name of the staff member          |
| Action        | "check-in" or "check-out"              |
| Location      | Selected work location                 |
| Notes         | Optional notes from the staff member   |
| IP Address    | IP address for security tracking       |

## Usage

1. Enter your Employee ID and Full Name
2. Select whether you're checking in or out
3. Choose your work location
4. Add any optional notes
5. Click the Check In/Out button
6. Your data will be automatically saved to Google Sheets

## Security Features

- IP address logging for security tracking
- Data validation on both client and server side
- Secure HTTPS communication with Google Apps Script

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/
│   ├── CheckInOutForm.tsx  # Main check-in/out form
│   └── ui/                 # Reusable UI components
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Main app component
└── main.tsx              # Entry point
```

{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
