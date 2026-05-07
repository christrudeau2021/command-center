# 🖥️ Personal Command Center Dashboard

A full-screen productivity dashboard built for smart TV / browser display. Inspired by DAKboard but fully customizable and self-hosted on Vercel (free tier).

---

## Features

| Widget           | Data Source                  | Refresh      |
|------------------|------------------------------|--------------|
| 🕐 Clock          | Browser native               | Real-time    |
| 🌤 Weather        | Open-Meteo (no key needed)   | 15 min       |
| 📅 Calendar       | Google Calendar API          | 5 min        |
| 📋 Weekly Summary | Your Python script → JSON    | 1 hr         |
| 📰 News           | RSS feeds (configurable)     | 10 min       |
| 🏈 Sports Scores  | ESPN public API              | 2 min        |
| 📈 Markets        | Yahoo Finance                | 5 min        |

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd personal-dashboard
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your values
```

### 3. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
# Follow prompts — add your .env.local values as environment variables
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

---

## Widget Configuration

### Weather
No API key needed. Set your coordinates in `.env.local`:
```
NEXT_PUBLIC_LAT=34.1015
NEXT_PUBLIC_LON=-84.5194
NEXT_PUBLIC_CITY=Woodstock, GA
```

### Google Calendar (Public Calendar)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **Google Calendar API**
3. Create an **API Key** credential
4. In Google Calendar → Settings → share your calendar publicly (or with the API key)
5. Copy your Calendar ID (under calendar settings)
6. Add to `.env.local`:
```
GOOGLE_CALENDAR_API_KEY=AIza...
GOOGLE_CALENDAR_ID=your@gmail.com
```

### News Feeds
Edit `RSS_FEEDS` in `.env.local` with comma-separated RSS URLs:
```
RSS_FEEDS=https://feeds.bbci.co.uk/news/rss.xml,https://techcrunch.com/feed/
```

### Stocks
```
STOCK_TICKERS=SPY,QQQ,AAPL,MSFT,NVDA,BTC-USD
```

### Sports
```
SPORTS_LEAGUES=nba,nfl,mlb
# Options: nba, nfl, mlb, nhl, ncaaf, ncaab, mls
```

---

## Weekly Summary Integration

Your Python `run_all.py` script can output a `summary.json` file that populates the Summary widget automatically.

### Step 1: Add JSON output to your Python script

In your `ai_summarizer.py`, after generating the summary, add:

```python
import json

def save_summary_json(summary_data: dict, output_path: str):
    """Save structured summary for dashboard consumption."""
    payload = {
        "generated_at":   datetime.now().isoformat(),
        "week_label":     f"Week of {datetime.now().strftime('%B %d')}",
        "headline":       summary_data.get("headline", ""),
        "accomplishments": summary_data.get("accomplishments", []),
        "in_progress":    summary_data.get("in_progress", []),
        "open_questions": summary_data.get("open_questions", []),
        "next_steps":     summary_data.get("next_steps", []),
    }
    with open(output_path, "w") as f:
        json.dump(payload, f, indent=2)
```

### Step 2: Upload to Vercel Blob (recommended)

Install the Vercel Blob SDK in your Python environment:
```bash
pip install requests
```

Add to your Python script:
```python
import requests, os

def upload_summary_to_vercel(summary_json_path: str):
    """Upload summary.json to Vercel Blob storage for dashboard consumption."""
    token = os.environ.get("BLOB_READ_WRITE_TOKEN")
    with open(summary_json_path, "rb") as f:
        res = requests.put(
            "https://blob.vercel-storage.com/summary.json",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "x-vercel-blob-access": "public",
            },
            data=f,
        )
    return res.json()["url"]
```

### Step 3: Alternative — Simple approach (Git commit)

If you'd prefer to keep it simple, just copy `summary.json` to the `public/` folder of this repo and push to GitHub. Vercel will redeploy automatically (takes ~30 seconds).

```bash
# In your Python script's post-run hook:
cp ~/Desktop/summary.json ~/path/to/dashboard/public/summary.json
cd ~/path/to/dashboard && git add public/summary.json && git commit -m "Weekly summary update" && git push
```

---

## Smart TV Setup

1. Deploy to Vercel → get your URL (e.g. `https://your-dashboard.vercel.app`)
2. On your smart TV, open the browser app
3. Navigate to your URL
4. Enable **full screen mode** (usually F11 or TV browser settings)
5. Optional: Set as the browser's home page / startup URL

**Auto-refresh**: The dashboard widgets auto-refresh via SWR. The whole page will stay current without manual refreshing.

---

## Customization

### Change the grid layout
Edit `app/page.tsx` — the grid is defined with CSS Grid. Change `gridTemplateColumns` and `gridTemplateRows` to reshape the layout.

### Add a widget
1. Create `components/MyWidget.tsx`
2. Add an API route at `app/api/my-data/route.ts`
3. Import and place in `app/page.tsx`

### Change Quick Links
In `app/page.tsx`, find the Quick Links section and update the array.

---

## Project Structure

```
personal-dashboard/
├── app/
│   ├── api/
│   │   ├── weather/route.ts      # Open-Meteo weather
│   │   ├── calendar/route.ts     # Google Calendar
│   │   ├── news/route.ts         # RSS feeds
│   │   ├── stocks/route.ts       # Yahoo Finance
│   │   ├── sports/route.ts       # ESPN scores
│   │   └── summary/route.ts      # Weekly Python summary
│   ├── globals.css               # Design system & animations
│   ├── layout.tsx
│   └── page.tsx                  # Main dashboard grid
├── components/
│   ├── ClockWidget.tsx
│   ├── WeatherWidget.tsx
│   ├── CalendarWidget.tsx
│   ├── SummaryWidget.tsx
│   ├── NewsWidget.tsx
│   ├── SportsWidget.tsx
│   └── StocksWidget.tsx
├── .env.local.example
├── vercel.json
└── README.md
```
