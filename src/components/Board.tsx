'use client'

import { useState } from 'react'
import { Column, Lead } from '@prisma/client'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { updateLeadStatus, updateColumn, deleteColumn, createColumn } from '@/app/actions'
import { LeadCard } from './LeadCard'
import { MoreHorizontal, Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ColumnWithLeads = Column & { leads: Lead[] }

export function Board({ initialColumns }: { initialColumns: ColumnWithLeads[] }) {
  const [columns, setColumns] = useState<ColumnWithLeads[]>(initialColumns)
  const [editingColumn, setEditingColumn] = useState<ColumnWithLeads | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [editColName, setEditColName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId)
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId)
    if (sourceColIndex === -1 || destColIndex === -1) return

    const newColumns = [...columns]
    const sourceCol = { ...newColumns[sourceColIndex] }
    const destCol = { ...newColumns[destColIndex] }
    const sourceLeads = [...sourceCol.leads]
    const destLeads = sourceColIndex === destColIndex ? sourceLeads : [...destCol.leads]

    const [movedLead] = sourceLeads.splice(source.index, 1)
    movedLead.columnId = destination.droppableId
    destLeads.splice(destination.index, 0, movedLead)

    newColumns[sourceColIndex] = { ...sourceCol, leads: sourceLeads }
    if (sourceColIndex !== destColIndex) {
      newColumns[destColIndex] = { ...destCol, leads: destLeads }
    }

    setColumns(newColumns)
    try {
      await updateLeadStatus(draggableId, destination.droppableId)
    } catch {
      setColumns(initialColumns)
    }
  }

  const handleEditColumn = async () => {
    if (!editingColumn || !editColName.trim()) return
    setIsSubmitting(true)
    try {
      await updateColumn(editingColumn.id, editColName.trim())
      setColumns(cols => cols.map(c => c.id === editingColumn.id ? { ...c, name: editColName.trim() } : c))
      toast.success('Coluna renomeada!')
      setEditingColumn(null)
    } catch {
      toast.error('Erro ao renomear coluna.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteColumn = async (col: ColumnWithLeads) => {
    if (!col.is_deletable) {
      toast.error('Esta coluna não pode ser excluída.')
      return
    }
    if (!confirm(`Excluir a coluna "${col.name}"? Todos os leads nela serão removidos.`)) return
    try {
      await deleteColumn(col.id)
      setColumns(cols => cols.filter(c => c.id !== col.id))
      toast.success('Coluna excluída.')
    } catch {
      toast.error('Erro ao excluir coluna.')
    }
  }

  const handleCreateColumn = async () => {
    if (!newColName.trim()) return
    setIsSubmitting(true)
    try {
      const col = await createColumn(newColName.trim())
      setColumns(cols => [...cols, { ...col, leads: [] }])
      toast.success('Coluna criada!')
      setIsCreateOpen(false)
      setNewColName('')
    } catch {
      toast.error('Erro ao criar coluna.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 pt-4 snap-x flex-1 items-start min-h-[calc(100vh-120px)] custom-scrollbar mb-6">
          {columns.map((column) => (
            <div key={column.id} className="min-w-[320px] w-[320px] bg-white/60 backdrop-blur-md rounded-2xl p-4 flex flex-col max-h-[85vh] snap-center border border-white/80 shadow-sm">
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground tracking-tight">{column.name}</h2>
                  <span className="bg-white text-muted-foreground text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {column.leads.length}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === column.id ? null : column.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenuId === column.id && (
                    <div
                      className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[140px]"
                      onMouseLeave={() => setOpenMenuId(null)}
                    >
                      <button
                        onClick={() => { setOpenMenuId(null); setEditColName(column.name); setEditingColumn(column) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        <Pencil size={13} /> Renomear
                      </button>
                      {column.is_deletable && (
                        <button
                          onClick={() => { setOpenMenuId(null); handleDeleteColumn(column) }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} /> Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto min-h-[150px] transition-colors duration-200 rounded-xl p-1
                      ${snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-transparent'}`}
                  >
                    {column.leads.map((lead, index) => (
                      <LeadCard key={lead.id} lead={lead} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

          {/* Add Column */}
          <div className="min-w-[280px] w-[280px] flex items-start pt-1">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border text-muted-foreground font-medium hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Nova Coluna
            </button>
          </div>
        </div>
      </DragDropContext>

      {/* Edit Column Dialog */}
      <Dialog open={!!editingColumn} onOpenChange={(o) => !o && setEditingColumn(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Renomear Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome da coluna</Label>
              <Input
                value={editColName}
                onChange={e => setEditColName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEditColumn()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingColumn(null)}>Cancelar</Button>
              <Button onClick={handleEditColumn} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Column Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Nova Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome da coluna</Label>
              <Input
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateColumn()}
                placeholder="Ex: Em Avaliação"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateColumn} disabled={isSubmitting || !newColName.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
