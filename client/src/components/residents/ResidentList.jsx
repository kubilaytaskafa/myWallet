import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetResidentsQuery, useDeleteResidentMutation } from '../../store/api/residentsApi'
import ResidentForm from './ResidentForm'

const COLORS = ['av-navy', 'av-amber', 'av-forest', 'av-steel', 'av-coral']
const RELATION_BADGES = {
  'Eş': 'badge-navy',
  'Çocuk': 'badge-forest',
  'Ebeveyn': 'badge-amber',
  'Kardeş': 'badge-steel',
  'Diğer': 'badge-steel',
}

function ResidentList() {
  const navigate = useNavigate()
  const { data, isLoading } = useGetResidentsQuery()
  const [deleteResident] = useDeleteResidentMutation()
  const [editItem, setEditItem] = useState(null)

  const residents = data?.data || []

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" isimli kişiyi silmek istiyor musunuz?`)) return
    try { await deleteResident(id).unwrap() }
    catch { alert('Silme işlemi başarısız.') }
  }

  if (isLoading) return <div className="loading-state"><i className="fas fa-spinner fa-spin" /> Yükleniyor...</div>

  if (residents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><i className="fas fa-users" /></div>
        <div className="empty-text">Henüz ev sakini eklenmemiş</div>
        <div className="empty-sub">Yukarıdaki butonu kullanarak ekleyin</div>
      </div>
    )
  }

  return (
    <>
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card-header">
              <h5><i className="fas fa-user-edit me-2" />Düzenle</h5>
              <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <ResidentForm editItem={editItem} onClose={() => setEditItem(null)} />
          </div>
        </div>
      )}

      <div className="residents-grid">
        {residents.map((r, idx) => {
          const initials = `${r.name[0]}${r.surname[0]}`.toUpperCase()
          const colorClass = COLORS[idx % COLORS.length]
          const badgeClass = RELATION_BADGES[r.relation] || 'badge-steel'

          return (
            <div key={r.id} className={`resident-card${!r.is_active ? ' resident-inactive' : ''}`}>
              <div className="resident-card-header">
                <div className={`avatar av-lg ${colorClass}`}>{initials}</div>
                <div className="resident-card-info">
                  <div className="resident-name">{r.name} {r.surname}</div>
                  <div className="resident-relation">
                    <span className={`badge ${badgeClass}`}>{r.relation}</span>
                  </div>
                </div>
              </div>

              {r.birth_date && r.birth_date !== '0001-01-01T00:00:00Z' && (
                <div style={{ fontSize: '.75rem', color: 'var(--steel-dark)' }}>
                  <i className="fas fa-birthday-cake me-1" />
                  {new Date(r.birth_date).toLocaleDateString('tr-TR')}
                </div>
              )}

              <div className="resident-card-footer">
                <span className={`badge ${r.is_active ? 'badge-forest' : 'badge-coral'}`}>
                  {r.is_active ? 'Aktif' : 'Pasif'}
                </span>
                <div className="resident-actions">
                  <button
                    id={`detail-resident-${r.id}`}
                    className="btn-action btn-action-detail"
                    onClick={() => navigate(`/residents/${r.id}`)}
                    title="Detay"
                  >
                    <i className="fas fa-chart-line" />
                  </button>
                  <button id={`edit-resident-${r.id}`} className="btn-action btn-action-edit" onClick={() => setEditItem(r)} title="Düzenle">
                    <i className="fas fa-pen" />
                  </button>
                  <button id={`delete-resident-${r.id}`} className="btn-action btn-action-delete" onClick={() => handleDelete(r.id, `${r.name} ${r.surname}`)} title="Sil">
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ResidentList
