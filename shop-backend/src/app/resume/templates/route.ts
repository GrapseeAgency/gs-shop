import { NextResponse } from 'next/server'

export async function GET() {
  const templates = [
    { id: 'modern', name: 'Modern Professional', price: 299, atsFriendly: true, preview: '/templates/modern.png' },
    { id: 'creative', name: 'Creative Designer', price: 399, atsFriendly: false, preview: '/templates/creative.png' },
    { id: 'minimal', name: 'Minimal Clean', price: 299, atsFriendly: true, preview: '/templates/minimal.png' },
    { id: 'executive', name: 'Executive Premium', price: 499, atsFriendly: true, preview: '/templates/executive.png' },
    { id: 'tech', name: 'Tech Developer', price: 349, atsFriendly: true, preview: '/templates/tech.png' },
  ]
  
  return NextResponse.json(templates)
}
