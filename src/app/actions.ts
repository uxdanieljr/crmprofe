'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getColumns() {
  return prisma.column.findMany({
    orderBy: { position: 'asc' },
    include: {
      leads: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}

export async function createLead(data: {
  name: string
  whatsapp: string
  is_online: boolean
  escolaridade?: string
  disponibilidade?: string
  observacoes?: string
}) {
  const firstColumn = await prisma.column.findFirst({
    orderBy: { position: 'asc' }
  })

  if (!firstColumn) throw new Error('Nenhuma coluna encontrada para adicionar o lead.')

  const lead = await prisma.lead.create({
    data: {
      ...data,
      columnId: firstColumn.id
    }
  })

  revalidatePath('/')
  return lead
}

export async function updateLeadStatus(leadId: string, newColumnId: string) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { columnId: newColumnId }
  })
  
  revalidatePath('/')
  return lead
}
