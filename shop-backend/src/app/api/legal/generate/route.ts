// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, documentType, jurisdiction, parties, terms } = body
  
  const document = await prisma.legalDocument.create({
    data: {
      userId,
      type: documentType,
      jurisdiction,
      parties: JSON.stringify(parties),
      terms: JSON.stringify(terms),
      content: generateLegalContent(documentType, parties, terms),
      pdfUrl: `/legal/${Date.now()}.pdf`,
      status: 'generated'
    }
  })
  
  return NextResponse.json({
    documentId: document.id,
    downloadUrl: document.pdfUrl,
    previewUrl: `/api/legal/preview/${document.id}`,
    message: 'Legal document generated successfully'
  })
}

function generateLegalContent(type: string, parties: any, terms: any): string {
  const templates: Record<string, string> = {
    'nda': `NON-DISCLOSURE AGREEMENT\n\nBetween ${parties.disclosingParty} and ${parties.receivingParty}\n\n1. Confidential Information...`,
    'rental': `RENTAL AGREEMENT\n\nLandlord: ${parties.landlord}\nTenant: ${parties.tenant}\nProperty: ${terms.propertyAddress}\nRent: ${terms.monthlyRent}/month`,
    'freelance': `FREELANCE CONTRACT\n\nClient: ${parties.client}\nFreelancer: ${parties.freelancer}\nProject: ${terms.projectDescription}\nFee: ${terms.fee}`,
    'employment': `EMPLOYMENT CONTRACT\n\nEmployer: ${parties.employer}\nEmployee: ${parties.employee}\nPosition: ${terms.position}\nSalary: ${terms.salary}/month`,
    'partnership': `PARTNERSHIP AGREEMENT\n\nPartners: ${parties.partners}\nBusiness: ${terms.businessName}\nProfit Share: ${terms.profitShare}%`,
  }
  return templates[type] || templates['nda']
}
