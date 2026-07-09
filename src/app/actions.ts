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
    data: { ...data, columnId: firstColumn.id }
  })

  revalidatePath('/')
  return lead
}

export async function updateLead(id: string, data: {
  name?: string
  whatsapp?: string
  is_online?: boolean
  escolaridade?: string
  disponibilidade?: string
  observacoes?: string
}) {
  const lead = await prisma.lead.update({ where: { id }, data })
  revalidatePath('/')
  return lead
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } })
  revalidatePath('/')
}

export async function updateLeadStatus(leadId: string, newColumnId: string) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { columnId: newColumnId }
  })
  revalidatePath('/')
  return lead
}

export async function updateColumn(id: string, name: string) {
  const column = await prisma.column.update({ where: { id }, data: { name } })
  revalidatePath('/')
  return column
}

export async function deleteColumn(id: string) {
  const column = await prisma.column.findUnique({ where: { id } })
  if (!column?.is_deletable) throw new Error('Esta coluna não pode ser excluída.')
  await prisma.column.delete({ where: { id } })
  revalidatePath('/')
}

export async function createColumn(name: string) {
  const last = await prisma.column.findFirst({ orderBy: { position: 'desc' } })
  const column = await prisma.column.create({
    data: { name, position: (last?.position ?? 0) + 1, is_deletable: true }
  })
  revalidatePath('/')
  return column
}
