import { useState } from 'react'
import { useGetResidentsQuery } from '../../store/api/residentsApi'
import ResidentList from '../../components/residents/ResidentList'
import ResidentForm from '../../components/residents/ResidentForm'

function ResidentsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data } = useGetResidentsQuery()
  const count = data?.data?.length || 0

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-heading" style={{ padding: 0 }}>
          <h1><i className="fas fa-users me-2" style={{ color: 'var(--navy-mid)' }} />Ev Sakinleri</h1>
          <p>{count} kişi kayıtlı</p>
        </div>
        <button id="add-resident-btn" className="btn btn-navy" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><i className="fas fa-times me-1" />Kapat</> : <><i className="fas fa-plus me-1" />Kişi Ekle</>}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-card-title">
            <i className="fas fa-user-plus" style={{ color: 'var(--navy-mid)' }} />
            Yeni Ev Sakini
          </div>
          <ResidentForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <ResidentList />
    </div>
  )
}

export default ResidentsPage
