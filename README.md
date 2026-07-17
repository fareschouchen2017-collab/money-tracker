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
- Data is stored locally in your browser (`localStorage`) - it stays on the device you use it on

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

## Backing up your data
Since transactions live in the browser's local storage, they don't automatically
sync between your phone and PC. Use the **Export JSON** button on one device, and
**Import** the same file on another device to bring your history with you.
