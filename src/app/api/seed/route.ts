import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cols = [
      { name: 'Novo Lead', position: 1, is_deletable: true },
      { name: 'Fila de Espera', position: 2, is_deletable: true },
      { name: 'Em Negociação', position: 3, is_deletable: true },
      { name: 'Convertido', position: 4, is_deletable: false },
      { name: 'Perdido', position: 5, is_deletable: false },
    ]

    const results = []
    for (const col of cols) {
      const existing = await prisma.column.findFirst({ where: { name: col.name } })
      if (!existing) {
        const created = await prisma.column.create({ data: col })
        results.push({ action: 'created', name: created.name })
      } else {
        results.push({ action: 'skipped', name: existing.name })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
