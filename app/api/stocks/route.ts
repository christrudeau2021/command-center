import { NextResponse } from 'next/server'

// Configure tickers in .env.local as STOCK_TICKERS (comma-separated)
const DEFAULT_TICKERS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'BTC-USD']

export async function GET() {
  try {
    const tickers = process.env.STOCK_TICKERS
      ? process.env.STOCK_TICKERS.split(',').map(t => t.trim())
      : DEFAULT_TICKERS

    const symbols = tickers.join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,shortName`

    const res  = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },
    })
    const data = await res.json()

    const quotes = data?.quoteResponse?.result || []

    const stocks = quotes.map((q: Record<string, unknown>) => ({
      symbol:  q.symbol,
      name:    (q.shortName as string || q.symbol as string).replace('iShares', '').replace('Invesco', '').trim(),
      price:   Number((q.regularMarketPrice as number).toFixed(2)),
      change:  Number((q.regularMarketChange as number).toFixed(2)),
      pct:     Number((q.regularMarketChangePercent as number).toFixed(2)),
    }))

    return NextResponse.json({ stocks })
  } catch (e) {
    return NextResponse.json({ error: 'Stocks unavailable' }, { status: 500 })
  }
}
