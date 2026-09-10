import { NextResponse } from 'next/server'

export async function GET() {
  const documents = [
    { id: 'nda', name: 'Non-Disclosure Agreement', price: 499, category: 'Business', popular: true },
    { id: 'rental', name: 'Rental Agreement', price: 499, category: 'Real Estate', popular: true },
    { id: 'freelance', name: 'Freelance Contract', price: 599, category: 'Business', popular: true },
    { id: 'employment', name: 'Employment Contract', price: 699, category: 'HR', popular: false },
    { id: 'partnership', name: 'Partnership Agreement', price: 799, category: 'Business', popular: false },
    { id: 'privacy', name: 'Privacy Policy', price: 399, category: 'Website', popular: true },
    { id: 'terms', name: 'Terms of Service', price: 399, category: 'Website', popular: true },
    { id: 'invoice', name: 'Invoice Terms', price: 299, category: 'Business', popular: false },
  ]
  
  return NextResponse.json(documents)
}
