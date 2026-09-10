import { NextResponse } from 'next/server'

const techLibraryResources = [
  {
    id: 'react-patterns',
    title: 'React Design Patterns',
    description: 'Advanced patterns for building scalable React applications',
        type: 'ebook',
    pointsCost: 500,
    downloadUrl: '/downloads/react-patterns.pdf',
    author: 'React Team',
    pages: 120,
    format: 'PDF',
  },
  {
    id: 'css-grid-guide',
    title: 'Complete CSS Grid Guide',
    description: 'Master CSS Grid with practical examples',
        type: 'guide',
    pointsCost: 300,
    downloadUrl: '/downloads/css-grid-guide.pdf',
    author: 'CSS Tricks',
    pages: 80,
    format: 'PDF',
  },
  {
    id: 'typescript-deep-dive',
    title: 'TypeScript Deep Dive',
    description: 'Advanced TypeScript concepts and patterns',
        type: 'ebook',
    pointsCost: 400,
    downloadUrl: '/downloads/typescript-deep-dive.pdf',
    author: 'Basarat Ali',
    pages: 200,
    format: 'PDF',
  },
  {
    id: 'node-best-practices',
    title: 'Node.js Best Practices',
    description: 'Production-ready Node.js patterns and tips',
        type: 'guide',
    pointsCost: 350,
    downloadUrl: '/downloads/node-best-practices.pdf',
    author: 'Node Community',
    pages: 100,
    format: 'PDF',
  },
  {
    id: 'system-design-101',
    title: 'System Design 101',
    description: 'Introduction to distributed system design',
        type: 'ebook',
    pointsCost: 600,
    downloadUrl: '/downloads/system-design-101.pdf',
    author: 'Engineering Team',
    pages: 150,
    format: 'PDF',
  },
  {
    id: 'react-hooks-cheatsheet',
    title: 'React Hooks Cheatsheet',
    description: 'Quick reference for all React hooks',
        type: 'cheatsheet',
    pointsCost: 100,
    downloadUrl: '/downloads/react-hooks-cheatsheet.pdf',
    author: 'React Dev',
    pages: 10,
    format: 'PDF',
  },
]

export async function GET() {
  return NextResponse.json({
    resources: techLibraryResources,
    total: techLibraryResources.length,
    categories: [...new Set(techLibraryResources.map(r => r.type))],
  })
}
