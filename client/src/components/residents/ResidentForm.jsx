import { useState } from 'react'
import { useCreateResidentMutation, useUpdateResidentMutation } from '../../store/api/residentsApi'

const RELATIONS = ['Eş', 'Çocuk', 'Ebeveyn', 'Kardeş', 'Diğer']

function ResidentForm({ editItem, onClose }) {
  const [create, { isLoading: isCreating }] = useCreateResidentMutation()
  const [update, { isLoading: isUpdating }] = useUpdateResidentMutation()

  const [form, setForm] = useState({
    name:       editItem?.name      || '',
    surname:    editItem?.surname   || '',
    relation:   editItem?.relation  || 'Diğer',
    birth_date: editItem?.birth_date ? editItem.birth_date.substring(0, 10) : '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.surname) { setError('Ad ve soyad zorunludur.'); return }
    try {
      if (editItem) await update({ id: editItem.id, ...form }).unwrap()
      else          await create(form).unwrap()
      onClose()
    } catch (err) {
      setError(err?.data?.message || 'Bir hata oluştu.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger mb-3" style={{ padding: '.5rem .75rem', borderRadius: 6, background: 'rgba(191,70,70,.1)', border: '1px solid rgba(191,70,70,.2)', color: '#BF4646', fontSize: '.82rem' }}>{error}</div>}

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label-navy">Ad *</label>
          <input id="resident-name" name="name" type="text" className="glass-form-control" value={form.name} onChange={handleChange} placeholder="Ad" required />
        </div>
        <div className="col-md-6">
          <label className="form-label-navy">Soyad *</label>
          <input id="resident-surname" name="surname" type="text" className="glass-form-control" value={form.surname} onChange={handleChange} placeholder="Soyad" required />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label-navy">Yakınlık Derecesi</label>
          <select id="resident-relation" name="relation" className="glass-select" value={form.relation} onChange={handleChange}>
            {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label-navy">Doğum Tarihi</label>
          <input id="resident-birthdate" name="birth_date" type="date" className="glass-form-control" value={form.birth_date} onChange={handleChange} />
        </div>
      </div>

      <div className="d-flex gap-2">
        <button id="resident-submit" type="submit" className="btn btn-navy flex-grow-1" disabled={isCreating || isUpdating}>
          {(isCreating || isUpdating) ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fas fa-save me-1" />}
          {editItem ? 'Güncelle' : 'Ekle'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
      </div>
    </form>
  )
}

export default ResidentForm
