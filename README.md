# Expensify - Expense Tracker

A simple, offline-friendly expense tracker. Track income and expenses by category,
see a spending breakdown chart, and back up your data as CSV or JSON.

## Features
- Add income/expense transactions with a category
- Balance, income, and expense totals
- Pie chart of spending by category
- Export to CSV or JSON
- Import a previous JSON backup (merge or replace)
- Installable as an app on phone or PC (PWA), works offline after first load
- Syncs automatically across devices via Firebase Firestore (no login - see setup below)

## Running it locally
No build step needed - it's plain HTML/CSS/JS.

Just open `index.html` in a browser, or serve it locally (recommended, since
service workers behave better over http/https than `file://`):

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

## Installing it on your phone or PC
1. Deploy it somewhere with HTTPS (GitHub Pages works great - see below).
2. Open the site in Chrome/Edge/Safari.
3. Use "Add to Home Screen" (phone) or the install icon in the address bar (desktop).
4. It'll behave like a native app and keep working offline.

## Deploying to GitHub Pages
```bash
# from inside this project folder
git init
git add .
git commit -m "Initial commit: Expensify expense tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then on GitHub:
1. Go to your repo -> **Settings** -> **Pages**
2. Under "Build and deployment", set **Source** to `Deploy from a branch`
3. Set branch to `main` and folder to `/ (root)`
4. Save - your app will be live at `https://<your-username>.github.io/<your-repo>/`

## Setting up Firebase (for cross-device sync)
This app syncs to a shared Firestore database with **no login** - any device that
opens the page reads and writes the same data. That's the simplest setup, but it
does mean the data isn't private: anyone who has your deployed URL and inspects
the page source can see and edit it. Fine for your own phone + PC; don't share
the link publicly.

1. Go to https://console.firebase.google.com and create a new project (Google
   Analytics is optional, you can skip it).
2. In the left sidebar, go to **Build -> Firestore Database -> Create database**.
   Choose **Start in test mode** for now.
3. Go to the **Rules** tab of Firestore and paste this, then **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   (This is intentionally open since there's no login. Test-mode rules expire
   after 30 days, so this step keeps it working afterward.)
4. Go to **Project settings** (gear icon) -> scroll to **Your apps** -> click
   the **</>** (web) icon to register a web app -> give it any nickname.
5. Firebase will show you a `firebaseConfig` object. Copy it into
   `firebase-config.js`, replacing the placeholder values.
6. Reload the page - the status line under the header should switch from
   "Connecting…" to "Online - synced". Add a transaction on one device and it
   should appear on the other within a second or two.

If you ever want to lock this down later (so only you can read/write), that
means adding real Firebase Authentication and rules like
`allow read, write: if request.auth != null;` - happy to help with that
whenever you're ready.

## Backing up your data
Since transactions now live in Firestore, your phone and PC already share the
same data automatically - no manual import/export needed for that anymore. The
**Export JSON/CSV** buttons are still there for an independent backup you can
keep outside Firebase (e.g. before wiping the database, or to open in Excel).
