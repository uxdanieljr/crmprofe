'use client'

import { Lead } from '@prisma/client'
import { Draggable } from '@hello-pangea/dnd'
import { MessageCircle, MonitorPlay, Users, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { deleteLead, updateLead } from '@/app/actions'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const cleanNumber = lead.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm(`Excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`)) return
    setIsDeleting(true)
    try {
      await deleteLead(lead.id)
      toast.success('Lead excluído.')
    } catch {
      toast.error('Erro ao excluir lead.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleEdit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await updateLead(lead.id, {
        name: formData.get('name') as string,
        whatsapp: formData.get('whatsapp') as string,
        is_online: formData.get('modalidade') === 'online',
        escolaridade: formData.get('escolaridade') as string || undefined,
        disponibilidade: formData.get('disponibilidade') as string || undefined,
        observacoes: formData.get('observacoes') as string || undefined,
      })
      toast.success('Lead atualizado!')
      setIsEditOpen(false)
    } catch {
      toast.error('Erro ao atualizar lead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 ${lead.is_online ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-700'}`}>
                  {lead.is_online ? <MonitorPlay size={10} /> : <Users size={10} />}
                  {lead.is_online ? 'Online' : 'Presencial'}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-6 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]"
                      onMouseLeave={() => setIsMenuOpen(false)}
                    >
                      <button
                        onClick={() => { setIsMenuOpen(false); setIsEditOpen(true) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        onClick={() => { setIsMenuOpen(false); handleDelete() }}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {(lead.escolaridade || lead.disponibilidade) && (
              <div className="text-xs text-muted-foreground space-y-1 mb-3">
                {lead.escolaridade && <p className="flex items-center gap-1.5"><span>📚</span> {lead.escolaridade}</p>}
                {lead.disponibilidade && <p className="flex items-center gap-1.5"><span>🕒</span> {lead.disponibilidade}</p>}
              </div>
            )}

            {lead.observacoes && (
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-2 py-1.5 mb-3 line-clamp-2">
                {lead.observacoes}
              </p>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Lead</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Aluno <span className="text-destructive">*</span></Label>
              <Input id="edit-name" name="name" required defaultValue={lead.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp">WhatsApp <span className="text-destructive">*</span></Label>
              <Input id="edit-whatsapp" name="whatsapp" type="tel" required defaultValue={lead.whatsapp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select name="modalidade" defaultValue={lead.is_online ? 'online' : 'presencial'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-escolaridade">Escolaridade</Label>
                <Input id="edit-escolaridade" name="escolaridade" defaultValue={lead.escolaridade ?? ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-disponibilidade">Disponibilidade</Label>
              <Input id="edit-disponibilidade" name="disponibilidade" defaultValue={lead.disponibilidade ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Textarea
                id="edit-observacoes"
                name="observacoes"
                className="resize-none"
                rows={3}
                defaultValue={lead.observacoes ?? ''}
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
