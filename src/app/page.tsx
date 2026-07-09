import { getColumns } from './actions'
import { Board } from '@/components/Board'
import { LeadForm } from '@/components/LeadForm'
import { Download, GraduationCap } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_COLUMNS = [
  { name: 'Novo Lead', position: 1, is_deletable: true },
  { name: 'Fila de Espera', position: 2, is_deletable: true },
  { name: 'Em Negociação', position: 3, is_deletable: true },
  { name: 'Convertido', position: 4, is_deletable: false },
  { name: 'Perdido', position: 5, is_deletable: false },
]

async function ensureColumns() {
  const count = await prisma.column.count()
  if (count === 0) {
    await prisma.column.createMany({ data: DEFAULT_COLUMNS })
  }
}

export default async function Home() {
  await ensureColumns()
  const columns = await getColumns()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">CRM Prof</h1>
            <p className="text-xs text-slate-500 font-medium">Gestão de Leads & Alunos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/api/backup"
            download="database.db"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary px-4 py-2 rounded-lg border border-border/50 transition-colors"
          >
            <Download size={16} />
            Backup Local
          </a>
          <LeadForm />
        </div>
      </header>

      <main className="flex-1 px-6 flex flex-col">
        <Board initialColumns={columns} />
      </main>
    </div>
  )
}
