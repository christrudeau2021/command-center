import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// The weekly summary JSON is dropped into /public/summary.json by your Python script
// Your Python script should output a summary.json alongside the PDF.
// See README for the expected JSON shape.

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'summary.json')

    if (!existsSync(filePath)) {
      return NextResponse.json({ summary: getDemoSummary(), demo: true })
    }

    const raw     = readFileSync(filePath, 'utf-8')
    const summary = JSON.parse(raw)
    return NextResponse.json({ summary })
  } catch (e) {
    return NextResponse.json({ summary: getDemoSummary(), demo: true })
  }
}

function getDemoSummary() {
  return {
    generated_at:    new Date().toISOString(),
    week_label:      `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    headline:        'Strong execution week — EDR enforcement closed, 3 risks resolved, sprint ahead of pace.',
    accomplishments: [
      'IBM CSO leadership signed off on EDR enforcement project',
      'GCP EDR enforcement delivered on target date',
      'PagerDuty → OCM migration complete (68% of Datadog monitors transitioned)',
      'SORR upline briefing slides finalized',
      'Risk 317 and 318 closed with product team',
    ],
    in_progress: [
      'Azure EDR automation fix (manual workaround active)',
      'Sumo Logic → Magna migration planning',
      'Performance improvement document revision',
      'RISK-135 / RFC alignment (Ayomi meeting pending)',
    ],
    open_questions: [
      'GuardDuty cost decision — awaiting direction',
      'Spencer backfill and Aman replacement planning',
    ],
    next_steps: [
      'Finalize Azure EDR automation',
      'Schedule RISK-135 alignment session',
      'Scope Aman knowledge transfer plan',
    ],
  }
}
