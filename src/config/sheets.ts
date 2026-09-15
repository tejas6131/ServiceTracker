/**
 * Google Sheets sync configuration.
 *
 * HOW TO SET UP:
 * 1. Create a Google Sheet with tabs: Vehicles, Servicing, PartsChanged, Insurance, Reminders
 * 2. Open Extensions → Apps Script in the Google Sheet
 * 3. Paste the code from /google-apps-script/Code.gs
 * 4. Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * 5. Copy the deployment URL and paste it below
 *
 * Set SYNC_ENABLED to true once you've completed the setup above.
 */

export const SYNC_ENABLED = false;

export const APPS_SCRIPT_URL = '';

// How often to auto-pull remote changes in milliseconds (default: 1 hour)
export const SYNC_INTERVAL_MS = 60 * 60 * 1000;
