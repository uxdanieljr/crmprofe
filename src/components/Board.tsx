'use client'

import { useState } from 'react'
import { Column, Lead } from '@prisma/client'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { updateLeadStatus } from '@/app/actions'
import { LeadCard } from './LeadCard'
import { GripHorizontal } from 'lucide-react'

type ColumnWithLeads = Column & { leads: Lead[] }

export function Board({ initialColumns }: { initialColumns: ColumnWithLeads[] }) {
  const [columns, setColumns] = useState<ColumnWithLeads[]>(initialColumns)

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Optimistic update
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

    // Persist change
    try {
      await updateLeadStatus(draggableId, destination.droppableId)
    } catch (error) {
      console.error('Failed to update lead status', error)
      setColumns(initialColumns) // rollback on error
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[320px] w-[320px] bg-white/60 backdrop-blur-md rounded-2xl p-4 flex flex-col max-h-[85vh] snap-center border border-white/80 shadow-sm">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-foreground tracking-tight">{column.name}</h2>
                <span className="bg-white text-muted-foreground text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {column.leads.length}
                </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing">
                <GripHorizontal size={18} />
              </button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto min-h-[150px] transition-colors duration-200 rounded-xl p-1
                    ${snapshot.isDraggingOver ? 'bg-blue-50/50' : 'bg-transparent'}`}
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
        {/* Placeholder for "Add Column" button */}
        <div className="min-w-[320px] w-[320px] flex items-center justify-center p-4">
           <button className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-medium hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
             <span>+ Nova Coluna</span>
           </button>
        </div>
      </div>
    </DragDropContext>
  )
}
