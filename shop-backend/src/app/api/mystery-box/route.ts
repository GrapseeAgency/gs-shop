import { NextResponse } from 'next/server'

const mysteryBoxes = [
  {
    id: 'mb-standard',
    name: 'Standard Digital Box',
    tier: 'Standard',
    price: 499,
    valueRange: [499, 1200],
    color: 'from-slate-500/30 to-slate-600/30',
    icon: '',
    items: ['Bootstrap Landing Page', 'VSCode Theme Pack', 'React UI Kit', 'Gatsby Blog Template', 'Developer Icon Pack'],
    probabilities: [
      { item: 'Bootstrap Landing Page', chance: 30 },
      { item: 'VSCode Theme Pack', chance: 25 },
      { item: 'React UI Kit', chance: 20 },
      { item: 'Gatsby Blog Template', chance: 15 },
      { item: 'Developer Icon Pack', chance: 10 },
    ],
  },
  {
    id: 'mb-premium',
    name: 'Premium Digital Box',
    tier: 'Premium',
    price: 1299,
    valueRange: [1299, 3500],
    color: 'from-blue-500/30 to-indigo-500/30',
    icon: '',
    items: ['Tailwind SaaS Template', 'Node.js API Shell', 'Framer Website Template', 'Next.js Blog Blueprint', 'PostgreSQL Admin Config'],
    probabilities: [
      { item: 'Tailwind SaaS Template', chance: 30 },
      { item: 'Node.js API Shell', chance: 20 },
      { item: 'Framer Website Template', chance: 25 },
      { item: 'Next.js Blog Blueprint', chance: 15 },
      { item: 'PostgreSQL Admin Config', chance: 10 },
    ],
  },
  {
    id: 'mb-luxury',
    name: 'Luxury System Box',
    tier: 'Luxury',
    price: 2999,
    valueRange: [2999, 8000],
    color: 'from-purple-500/30 to-violet-500/30',
    icon: '',
    items: ['Enterprise Next.js Boilerplate', 'AWS DevOps Swarm Cluster', 'React Native Mobile App Shell', 'Custom GraphQL CMS Engine', 'Docker VPS Config'],
    probabilities: [
      { item: 'Enterprise Next.js Boilerplate', chance: 20 },
      { item: 'AWS DevOps Swarm Cluster', chance: 30 },
      { item: 'React Native Mobile App Shell', chance: 15 },
      { item: 'Custom GraphQL CMS Engine', chance: 25 },
      { item: 'Docker VPS Config', chance: 10 },
    ],
  },
  {
    id: 'mb-ultimate',
    name: 'Ultimate Enterprise Box',
    tier: 'Ultimate',
    price: 5999,
    valueRange: [5999, 18000],
    color: 'from-amber-500/30 to-yellow-500/30',
    icon: '',
    items: ['Full SaaS Startup Stack Source Code', 'Custom iOS & Android Application', 'AI Co-pilot Custom Model Integration', 'Multi-tenant B2B Platform Template'],
    probabilities: [
      { item: 'Full SaaS Startup Stack Source Code', chance: 25 },
      { item: 'Custom iOS & Android Application', chance: 25 },
      { item: 'AI Co-pilot Custom Model Integration', chance: 25 },
      { item: 'Multi-tenant B2B Platform Template', chance: 25 },
    ],
  },
]

const communityReveals = [
  { user: 'Arafat K.', box: 'Premium', item: 'Tailwind SaaS Template', avatar: '', time: '2 mins ago' },
  { user: 'Sarah K.', box: 'Luxury', item: 'AWS DevOps Swarm Cluster', avatar: '', time: '5 hours ago' },
  { user: 'Mike R.', box: 'Standard', item: 'VSCode Theme Pack', avatar: '', time: '8 hours ago' },
  { user: 'Emma L.', box: 'Ultimate', item: 'Full SaaS Startup Stack Source Code', avatar: '', time: '12 hours ago' },
]

export async function GET() {
  return NextResponse.json({ boxes: mysteryBoxes, communityReveals })
}
