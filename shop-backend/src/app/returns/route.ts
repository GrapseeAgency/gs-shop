import { NextResponse } from 'next/server'

const returns = [
  {
    id: 'ret-1',
    orderId: 'ORD-2024-001',
    productName: 'Premium Website Design',
    productId: 'prod-1',
    reason: 'Service did not meet expectations',
    description: 'The delivered design did not match the agreed-upon specifications. Colors and layout differ from the [].',
    status: 'processing',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-12T14:00:00Z',
    refundAmount: 2499,
    timeline: [
      { status: 'submitted', date: '2024-12-10T10:00:00Z', label: 'Return Requested' },
      { status: 'reviewing', date: '2024-12-11T09:00:00Z', label: 'Under Review' },
      { status: 'processing', date: '2024-12-12T14:00:00Z', label: 'Refund Processing' },
    ],
  },
  {
    id: 'ret-2',
    orderId: 'ORD-2024-002',
    productName: 'SEO Starter Package',
    productId: 'prod-2',
    reason: 'Changed my mind',
    description: 'Decided to go with a different approach for our marketing strategy.',
    status: 'completed',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-07T16:00:00Z',
    refundAmount: 899,
    timeline: [
      { status: 'submitted', date: '2024-12-01T08:00:00Z', label: 'Return Requested' },
      { status: 'approved', date: '2024-12-02T10:00:00Z', label: 'Request Approved' },
      { status: 'processing', date: '2024-12-04T09:00:00Z', label: 'Refund Processing' },
      { status: 'completed', date: '2024-12-07T16:00:00Z', label: 'Refund Completed' },
    ],
  },
  {
    id: 'ret-3',
    orderId: 'ORD-2024-003',
    productName: 'Mobile App UI Kit',
    productId: 'prod-3',
    reason: 'Duplicate purchase',
    description: 'Accidentally purchased the same UI kit twice. Requesting refund for the duplicate.',
    status: 'approved',
    createdAt: '2024-12-14T12:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
    refundAmount: 599,
    timeline: [
      { status: 'submitted', date: '2024-12-14T12:00:00Z', label: 'Return Requested' },
      { status: 'approved', date: '2024-12-15T10:00:00Z', label: 'Request Approved' },
    ],
  },
]

export async function GET() {
  return NextResponse.json({ data: returns })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, productId, productName, reason, description } = body

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'Order ID and reason are required' }, { status: 400 })
    }

    const newReturn = {
      id: `ret-${Date.now()}`,
      orderId,
      productName: productName || 'Unknown Product',
      productId: productId || '',
      reason,
      description: description || '',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      refundAmount: 0,
      timeline: [
        { status: 'submitted', date: new Date().toISOString(), label: 'Return Requested' },
      ],
    }

    return NextResponse.json({ success: true, data: newReturn }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 })
  }
}
