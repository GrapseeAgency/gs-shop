import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - USSD menu for feature phones
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, input, sessionId } = await req.json()

    // USSD Session state machine
    const menu: Record<string, any> = {
      '': {
        text: 'Welcome to Grapsee\n1. Browse Products\n2. My Orders\n3. Search\n4. Support',
        next: { '1': 'browse', '2': 'orders', '3': 'search', '4': 'support' }
      },
      'browse': {
        text: 'Categories:\n1. Groceries\n2. Electronics\n3. Fashion\n4. Home\n0. Back',
        next: { '1': 'groceries', '2': 'electronics', '3': 'fashion', '4': 'home', '0': '' }
      },
      'groceries': {
        text: '1. Rice - 50/kg\n2. Dal - 80/kg\n3. Oil - 120/l\n9. Cart\n0. Back',
        next: { '1': 'add_rice', '2': 'add_dal', '3': 'add_oil', '9': 'cart', '0': 'browse' }
      },
      'add_rice': {
        text: 'Rice added!\n1. Add more\n2. Checkout\n0. Back',
        action: 'add_to_cart',
        next: { '1': 'groceries', '2': 'checkout', '0': 'groceries' }
      },
      'cart': {
        text: 'Cart: 3 items\nTotal: 450\n1. Checkout\n2. Clear\n0. Back',
        next: { '1': 'checkout', '2': 'clear_cart', '0': '' }
      },
      'checkout': {
        text: 'Pay via:\n1. COD\n2. Wallet\n3. UPI\n0. Cancel',
        next: { '1': 'order_placed', '2': 'order_placed', '3': 'order_placed', '0': 'cart' }
      },
      'order_placed': {
        text: 'Order placed!\nOrder #12345\nDelivery: Tomorrow\nThank you!',
        end: true
      }
    }

    const currentState = input === '' ? '' : (menu[input] ? input : '')
    const currentMenu = menu[currentState] || menu['']

    return NextResponse.json({
      sessionId,
      phoneNumber,
      ussdText: currentMenu.text,
      nextInputs: currentMenu.next,
      isEnd: currentMenu.end || false,
      action: currentMenu.action || null
    })
  } catch (error) {
    console.error('USSD error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
