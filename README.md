# 〇 Six Eyes — Password Strength Analyzer

> *The eyes that see through all weak passwords.*

---

## How it works

Python (`app.py`) runs all the security logic locally on your machine.
The Chrome extension sends the password to Python and renders the result in real time. Nothing leaves your device.

---

## Setup

### 1 — Install dependencies

Open a terminal in this folder and run:

```bash
pip install flask flask-cors
```

### 2 — Start the analysis engine

```bash
python app.py
```

You should see:

```
Six Eyes — analysis engine running on http://localhost:5000
```

Keep this terminal open while using the extension.

### 3 — Load the extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder inside this project
5. The Six Eyes icon will appear in your Chrome toolbar

### 4 — Use it

- Click the toolbar icon to test any password manually
- Visit any site with a password field — the analyzer appears automatically

---

## Security checks

| Check | Description |
|---|---|
| Min 8 chars | Password must be at least 8 characters |
| Uppercase | Must contain at least one A–Z letter |
| Number | Must contain at least one digit 0–9 |
| Symbol | Must contain `!@#$%^&*` or similar |
| Not common | Checked against 20 most-leaked passwords |
| No repeats | No sequences like `aaa` or `111` |
| 12+ chars *(bonus)* | Extra entropy for longer passwords |

---

## Strength ratings

| Rating | Meaning |
|---|---|
| **Weak** | Compromised — must fix before use |
| **Medium** | Passable — could be stronger |
| **Strong** | Unbreakable — all checks passed |

---

## Project structure

```
6eyes/
├── app.py                     
└── extension/
    ├── manifest.json  
    ├── popup.html     
    ├── popup.js    
    ├── content.js      
    └── icons/
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png
```
