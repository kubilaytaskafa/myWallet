import { useState } from 'react'
import { useDeleteIncomeMutation } from '../../store/api/incomesApi'
import IncomeForm from './IncomeForm'

function IncomeList({ incomes }) {
  const [deleteIncome] = useDeleteIncomeMutation()
  const [editItem, setEditItem] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('Bu geliri silmek istiyor musunuz?')) return
    try { await deleteIncome(id).unwrap() } catch { alert('Silme başarısız.') }
  }

  if (incomes.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon"><i className="fas fa-hand-holding-usd" /></div>
      <div className="empty-text">Henüz gelir kaydı yok</div>
      <div className="empty-sub">Yukarıdan gelir ekleyebilirsiniz</div>
    </div>
  )

  return (
    <>
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card-header">
              <h5><i className="fas fa-edit me-2" />Geliri Düzenle</h5>
              <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <IncomeForm editItem={editItem} onClose={() => setEditItem(null)} />
          </div>
        </div>
      )}
      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="ptable">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Kişi</th>
                <th>Tarih</th>
                <th>Tutar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {incomes.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td><span className="badge badge-navy">{item.category}</span></td>
                  <td>
                    {item.resident
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                          <span className="avatar av-forest" style={{ width: 22, height: 22, fontSize: '.6rem' }}>
                            {item.resident.name[0]}{item.resident.surname[0]}
                          </span>
                          {item.resident.name}
                        </span>
                      : <span style={{ color: 'var(--steel-dark)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--steel-dark)' }}>{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                  <td className="amount-income">+₺{item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.3rem' }}>
                      <button id={`edit-income-${item.id}`} className="btn-action btn-action-edit" onClick={() => setEditItem(item)}><i className="fas fa-pen" /></button>
                      <button id={`del-income-${item.id}`} className="btn-action btn-action-delete" onClick={() => handleDelete(item.id)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default IncomeList
