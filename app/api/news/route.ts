import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({ timeout: 8000 })

// Configure your preferred feeds in .env.local as NEXT_PUBLIC_RSS_FEEDS (comma-separated URLs)
// Defaults to a solid mix of top sources
const DEFAULT_FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
]

export async function GET() {
  try {
    const feedUrls = process.env.RSS_FEEDS
      ? process.env.RSS_FEEDS.split(',').map(u => u.trim())
      : DEFAULT_FEEDS

    const results = await Promise.allSettled(
      feedUrls.map(url => parser.parseURL(url))
    )

    const articles: { title: string; source: string; link: string; pubDate: string }[] = []

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const feed = result.value
        const source = feed.title || `Feed ${i + 1}`
        feed.items.slice(0, 5).forEach(item => {
          if (item.title && item.link) {
            articles.push({
              title:   item.title.trim(),
              source,
              link:    item.link,
              pubDate: item.pubDate || item.isoDate || '',
            })
          }
        })
      }
    })

    // Sort by date descending
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

    return NextResponse.json({ articles: articles.slice(0, 20) })
  } catch (e) {
    return NextResponse.json({ error: 'News unavailable' }, { status: 500 })
  }
}
