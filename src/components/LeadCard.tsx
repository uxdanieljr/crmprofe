'use client'

import { Lead } from '@prisma/client'
import { Draggable } from '@hello-pangea/dnd'
import { MessageCircle, MonitorPlay, Users } from 'lucide-react'

export function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const cleanNumber = lead.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-card p-4 rounded-xl shadow-sm border border-border/50 mb-3 group 
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/50 opacity-90 scale-105' : 'hover:border-primary/40'} 
            transition-all duration-200 ease-in-out`}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-card-foreground text-sm">{lead.name}</h3>
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 ${lead.is_online ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-700'}`}>
              {lead.is_online ? <MonitorPlay size={10} /> : <Users size={10} />}
              {lead.is_online ? 'Online' : 'Presencial'}
            </span>
          </div>
          
          {(lead.escolaridade || lead.disponibilidade) && (
            <div className="text-xs text-muted-foreground space-y-1 mb-3">
              {lead.escolaridade && <p className="flex items-center gap-1.5"><span>📚</span> {lead.escolaridade}</p>}
              {lead.disponibilidade && <p className="flex items-center gap-1.5"><span>🕒</span> {lead.disponibilidade}</p>}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <button
              onClick={openWhatsApp}
              className="text-xs flex items-center gap-1.5 text-green-600 font-medium hover:text-green-700 hover:bg-green-50 px-2 py-1.5 rounded-md transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <span className="text-[10px] text-muted-foreground/70 font-medium">
              {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  )
}
