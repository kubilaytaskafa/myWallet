import { useState } from 'react'
import { useCreateExpenseMutation, useUpdateExpenseMutation } from '../../store/api/expensesApi'
import { useGetResidentsQuery } from '../../store/api/residentsApi'

const CATEGORIES = ['Market', 'Kira', 'Fatura', 'Ulaşım', 'Sağlık', 'Eğitim', 'Eğlence', 'Giyim', 'Restoran', 'Diğer']

function ExpenseForm({ editItem, onClose }) {
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation()
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation()
  const { data: residentsData } = useGetResidentsQuery()
  const residents = residentsData?.data || []

  const [form, setForm] = useState({
    title:       editItem?.title       || '',
    amount:      editItem?.amount      || '',
    description: editItem?.description || '',
    category:    editItem?.category    || 'Diğer',
    date:        editItem?.date ? editItem.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
    resident_id: editItem?.resident_id || '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        resident_id: form.resident_id ? parseInt(form.resident_id) : null,
      }
      if (editItem) await updateExpense({ id: editItem.id, ...payload }).unwrap()
      else          await createExpense(payload).unwrap()
      onClose()
    } catch (err) { setError(err?.data?.message || 'Bir hata oluştu.') }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form id="expense-form" onSubmit={handleSubmit}>
      {error && <div style={{ padding: '.5rem .75rem', marginBottom: '.75rem', borderRadius: 6, background: 'rgba(191,70,70,.1)', border: '1px solid rgba(191,70,70,.2)', color: '#BF4646', fontSize: '.82rem' }}>{error}</div>}

      <div className="mb-3">
        <label className="form-label-navy">Başlık *</label>
        <input id="expense-title" name="title" type="text" className="glass-form-control" value={form.title} onChange={handleChange} required />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label-navy">Miktar (₺) *</label>
          <input id="expense-amount" name="amount" type="number" step="0.01" min="0" className="glass-form-control" value={form.amount} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label-navy">Tarih *</label>
          <input id="expense-date" name="date" type="date" className="glass-form-control" value={form.date} onChange={handleChange} required />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label-navy">Kategori</label>
          <select id="expense-category" name="category" className="glass-select" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label-navy">Kişi</label>
          <select id="expense-resident" name="resident_id" className="glass-select" value={form.resident_id} onChange={handleChange}>
            <option value="">— Kişi Seç —</option>
            {residents.map(r => <option key={r.id} value={r.id}>{r.name} {r.surname}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label-navy">Açıklama</label>
        <textarea id="expense-desc" name="description" className="glass-form-control" rows={2} value={form.description} onChange={handleChange} />
      </div>

      <div className="d-flex gap-2">
        <button id="expense-submit-btn" type="submit" className="btn btn-coral flex-grow-1" disabled={isLoading}>
          {isLoading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fas fa-plus me-1" />}
          {editItem ? 'Güncelle' : 'Gider Ekle'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
      </div>
    </form>
  )
}

export default ExpenseForm
