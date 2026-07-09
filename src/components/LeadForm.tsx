'use client'

import { useState } from 'react'
import { createLead } from '@/app/actions'
import { PlusCircle, Loader2 } from 'lucide-react'

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
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      alert('Erro ao cadastrar lead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 group z-50"
      >
        <PlusCircle size={24} />
        <span className="font-semibold pr-2 group-hover:block hidden">Novo Lead</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Cadastrar Novo Lead</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 text-2xl leading-none">&times;</button>
        </div>
        
        <form action={actionForm} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Aluno *</label>
            <input required name="name" type="text" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Ex: Mateus Silva" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp *</label>
            <input required name="whatsapp" type="tel" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="5511999999999" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade</label>
              <select name="modalidade" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white">
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escolaridade</label>
              <input name="escolaridade" type="text" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="Opcional" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidade de Horários</label>
            <input name="disponibilidade" type="text" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="Ex: Seg e Qua após 18h" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea name="observacoes" rows={3} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none" placeholder="Anotações sobre o aluno..."></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button disabled={isSubmitting} type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
