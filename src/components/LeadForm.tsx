'use client'

import { useState } from 'react'
import { createLead } from '@/app/actions'
import { PlusCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export function LeadForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function actionForm(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createLead({
        name: formData.get('name') as string,
        whatsapp: formData.get('whatsapp') as string,
        is_online: formData.get('modalidade') === 'online',
        escolaridade: formData.get('escolaridade') as string,
        disponibilidade: formData.get('disponibilidade') as string,
        observacoes: formData.get('observacoes') as string,
      })
      toast.success('Lead cadastrado com sucesso!')
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao cadastrar lead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="fixed bottom-8 right-8 h-14 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 group z-50 px-6 bg-primary text-primary-foreground font-medium">
        <PlusCircle size={20} />
        <span className="font-semibold group-hover:block hidden">Novo Lead</span>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Cadastrar Novo Lead</DialogTitle>
        </DialogHeader>
        
        <form action={actionForm} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Aluno <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" required placeholder="Ex: Mateus Silva" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp <span className="text-destructive">*</span></Label>
            <Input id="whatsapp" name="whatsapp" type="tel" required placeholder="5511999999999" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Select name="modalidade" defaultValue="online">
                <SelectTrigger id="modalidade">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="escolaridade">Escolaridade</Label>
              <Input id="escolaridade" name="escolaridade" placeholder="Opcional" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilidade">Disponibilidade de Horários</Label>
            <Input id="disponibilidade" name="disponibilidade" placeholder="Ex: Seg e Qua após 18h" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea 
              id="observacoes" 
              name="observacoes" 
              placeholder="Anotações sobre o aluno..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
