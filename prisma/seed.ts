import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

async function main() {
  const columns = [
    { name: 'Novo Lead', position: 1, is_deletable: true },
    { name: 'Fila de Espera', position: 2, is_deletable: true },
    { name: 'Em Negociação', position: 3, is_deletable: true },
    { name: 'Convertido', position: 4, is_deletable: false },
    { name: 'Perdido', position: 5, is_deletable: false },
  ]

  for (const col of columns) {
    const existing = await prisma.column.findFirst({
      where: { name: col.name }
    })
    
    if (!existing) {
      await prisma.column.create({
        data: col
      })
    }
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
