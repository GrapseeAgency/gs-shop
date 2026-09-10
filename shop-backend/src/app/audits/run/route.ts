import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url, type } = await req.json()
  
  const audits: Record<string, any> = {
    seo: {
      score: Math.floor(Math.random() * 30) + 70,
      issues: [
        { severity: 'high', message: 'Missing meta description' },
        { severity: 'medium', message: 'Images missing alt text' },
        { severity: 'low', message: 'H1 tag too long' },
      ],
      passed: 12,
      warnings: 3,
      failed: 1
    },
    performance: {
      score: Math.floor(Math.random() * 40) + 60,
      metrics: {
        lcp: Math.floor(Math.random() * 2) + 1.5,
        fid: Math.floor(Math.random() * 50) + 20,
        cls: (Math.random() * 0.1).toFixed(3),
      },
      recommendations: [
        'Optimize images',
        'Enable compression',
        'Minify JavaScript'
      ]
    },
    accessibility: {
      score: Math.floor(Math.random() * 20) + 80,
      violations: [
        { impact: 'critical', description: 'Missing form labels' },
        { impact: 'serious', description: 'Low contrast text' },
      ]
    },
    security: {
      score: Math.floor(Math.random() * 25) + 75,
      vulnerabilities: [
        { severity: 'medium', name: 'XSS Protection' },
        { severity: 'low', name: 'Content Security Policy' },
      ]
    }
  }
  
  return NextResponse.json(audits[type] || audits.seo)
}
