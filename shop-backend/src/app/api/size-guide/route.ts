import { NextRequest, NextResponse } from 'next/server'

const sizeGuides: Record<string, {
  title: string
  description: string
  columns: string[]
  rows: string[][]
  howToMeasure: { step: string; detail: string }[]
}> = {
  clothing: {
    title: 'Clothing Size Guide',
    description: 'Find your perfect fit with our clothing size chart',
    columns: ['Size', 'US', 'UK', 'EU', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)'],
    rows: [
      ['XS', '0-2', '4-6', '32-34', '78-82', '60-64', '86-90'],
      ['S', '4-6', '8-10', '36-38', '82-86', '64-68', '90-94'],
      ['M', '8-10', '12-14', '40-42', '86-90', '68-72', '94-98'],
      ['L', '12-14', '16-18', '44-46', '90-94', '72-76', '98-102'],
      ['XL', '16-18', '20-22', '48-50', '94-98', '76-80', '102-106'],
      ['XXL', '20-22', '24-26', '52-54', '98-102', '80-84', '106-110'],
    ],
    howToMeasure: [
      { step: 'Chest', detail: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
      { step: 'Waist', detail: 'Measure around the narrowest part of your waist, keeping the tape comfortably loose.' },
      { step: 'Hip', detail: 'Stand with feet together and measure around the fullest part of your hip.' },
    ],
  },
  shoes: {
    title: 'Shoe Size Guide',
    description: 'Find the right shoe size for your feet',
    columns: ['US', 'UK', 'EU', 'CM', 'Inches'],
    rows: [
      ['5', '2.5', '35', '22', '8.5"'],
      ['6', '3.5', '36', '23', '9"'],
      ['7', '4.5', '37', '23.5', '9.25"'],
      ['8', '5.5', '38', '24.5', '9.5"'],
      ['9', '6.5', '39-40', '25', '9.75"'],
      ['10', '7.5', '41', '26', '10.25"'],
      ['11', '8.5', '42', '27', '10.5"'],
      ['12', '9.5', '43', '27.5', '10.75"'],
    ],
    howToMeasure: [
      { step: 'Length', detail: 'Stand on a piece of paper, trace your foot, then measure from heel to longest toe.' },
      { step: 'Width', detail: 'Measure the widest part of your foot across the ball area.' },
    ],
  },
  accessories: {
    title: 'Accessories Size Guide',
    description: 'Ring, bracelet, and belt sizes',
    columns: ['Size', 'US', 'UK', 'EU', 'CM / Inches'],
    rows: [
      ['Ring XS', '5', 'J', '48', '4.8 cm'],
      ['Ring S', '6', 'L', '51', '5.1 cm'],
      ['Ring M', '7', 'O', '54', '5.4 cm'],
      ['Ring L', '8', 'Q', '57', '5.7 cm'],
      ['Ring XL', '9', 'S', '60', '6.0 cm'],
      ['Belt S', '28-30', '-', '-', '28-30"'],
      ['Belt M', '32-34', '-', '-', '32-34"'],
      ['Belt L', '36-38', '-', '-', '36-38"'],
    ],
    howToMeasure: [
      { step: 'Ring', detail: 'Wrap a strip of paper around your finger, mark the overlap, and measure the length.' },
      { step: 'Belt', detail: 'Measure around your waist where you normally wear your belt.' },
    ],
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  if (category && sizeGuides[category]) {
    return NextResponse.json({
      category,
      ...sizeGuides[category],
    })
  }

  return NextResponse.json({
    categories: Object.keys(sizeGuides),
    guides: sizeGuides,
  })
}
