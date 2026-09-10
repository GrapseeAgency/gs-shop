import { NextResponse } from 'next/server'

const mysteryBoxes = [
  {
    id: 'mb-standard',
    name: 'Standard Mystery Box',
    tier: 'Standard',
    price: 499,
    valueRange: [499, 1200],
    color: 'from-slate-500/30 to-slate-600/30',
    icon: '',
    items: ['T-Shirt', 'Phone Case', 'Notebook', 'Sticker Pack', 'Keychain'],
    probabilities: [
      { item: 'T-Shirt', chance: 30 },
      { item: 'Phone Case', chance: 25 },
      { item: 'Notebook', chance: 20 },
      { item: 'Sticker Pack', chance: 15 },
      { item: 'Keychain', chance: 10 },
    ],
  },
  {
    id: 'mb-premium',
    name: 'Premium Mystery Box',
    tier: 'Premium',
    price: 1299,
    valueRange: [1299, 3500],
    color: 'from-blue-500/30 to-indigo-500/30',
    icon: '',
    items: ['Wireless Earbuds', 'Smart Watch', 'Backpack', 'Sneakers', 'Sunglasses'],
    probabilities: [
      { item: 'Wireless Earbuds', chance: 30 },
      { item: 'Smart Watch', chance: 20 },
      { item: 'Backpack', chance: 25 },
      { item: 'Sneakers', chance: 15 },
      { item: 'Sunglasses', chance: 10 },
    ],
  },
  {
    id: 'mb-luxury',
    name: 'Luxury Mystery Box',
    tier: 'Luxury',
    price: 2999,
    valueRange: [2999, 8000],
    color: 'from-purple-500/30 to-violet-500/30',
    icon: '',
    items: ['Designer Bag', 'Noise-Cancel Headphones', 'Tablet', 'Premium Jacket', 'Leather Wallet'],
    probabilities: [
      { item: 'Designer Bag', chance: 20 },
      { item: 'Noise-Cancel Headphones', chance: 30 },
      { item: 'Tablet', chance: 15 },
      { item: 'Premium Jacket', chance: 25 },
      { item: 'Leather Wallet', chance: 10 },
    ],
  },
  {
    id: 'mb-ultimate',
    name: 'Ultimate Mystery Box',
    tier: 'Ultimate',
    price: 5999,
    valueRange: [5999, 18000],
    color: 'from-amber-500/30 to-yellow-500/30',
    icon: '',
    items: ['Laptop', 'iPhone', 'Gaming Console', 'Drone', '4K TV'],
    probabilities: [
      { item: 'Laptop', chance: 25 },
      { item: 'iPhone', chance: 15 },
      { item: 'Gaming Console', chance: 25 },
      { item: 'Drone', chance: 20 },
      { item: '4K TV', chance: 15 },
    ],
  },
]

const communityReveals = [
  { user: 'Alex M.', box: 'Premium', item: 'Wireless Earbuds', avatar: '', time: '2 hours ago' },
  { user: 'Sarah K.', box: 'Luxury', item: 'Designer Bag', avatar: '', time: '5 hours ago' },
  { user: 'Mike R.', box: 'Standard', item: 'Phone Case', avatar: '', time: '8 hours ago' },
  { user: 'Emma L.', box: 'Ultimate', item: 'Laptop', avatar: '', time: '12 hours ago' },
  { user: 'James P.', box: 'Premium', item: 'Sneakers', avatar: '', time: '1 day ago' },
  { user: 'Lily T.', box: 'Luxury', item: 'Tablet', avatar: '', time: '1 day ago' },
]

export async function GET() {
  return NextResponse.json({ boxes: mysteryBoxes, communityReveals })
}
