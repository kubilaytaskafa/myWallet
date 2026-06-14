import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetResidentsQuery } from '../../store/api/residentsApi'
import { useGetIncomesQuery } from '../../store/api/incomesApi'
import { useGetExpensesQuery } from '../../store/api/expensesApi'

const COLORS = ['av-navy', 'av-amber', 'av-forest', 'av-steel', 'av-coral']
const RELATION_BADGES = {
  'Eş': 'badge-navy',
  'Çocuk': 'badge-forest',
  'Ebeveyn': 'badge-amber',
  'Kardeş': 'badge-steel',
  'Diğer': 'badge-steel',
}

const today = new Date().toISOString().substring(0, 10)
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().substring(0, 10)

function fmt(amount) {
  return `₺${(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
}

function ResidentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('expenses')
  const [filter, setFilter] = useState({ start: monthStart, end: today })
  const [tempFilter, setTempFilter] = useState({ start: monthStart, end: today })

  const { data: residentsData } = useGetResidentsQuery()
  const residents = residentsData?.data || []
  const resident = residents.find(r => String(r.id) === String(id))
  const colorClass = COLORS[residents.indexOf(resident) % COLORS.length] || 'av-navy'

  const incomeFilter = { ...filter, resident_id: id }
  const expenseFilter = { ...filter, resident_id: id }

  const { data: incomesData, isLoading: loadInc } = useGetIncomesQuery(incomeFilter)
  const { data: expensesData, isLoading: loadExp } = useGetExpensesQuery(expenseFilter)

  const incomes = incomesData?.data || []
  const expenses = expensesData?.data || []

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const netBalance = totalIncome - totalExpense

  const handleApply = (e) => {
    e.preventDefault()
    setFilter(tempFilter)
  }

  if (!resident) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-user-slash" /></div>
          <div className="empty-text">Kişi bulunamadı</div>
          <button className="btn btn-navy mt-3" onClick={() => navigate('/residents')}>
            <i className="fas fa-arrow-left me-1" />Geri Dön
          </button>
        </div>
      </div>
    )
  }

  const initials = `${resident.name[0]}${resident.surname[0]}`.toUpperCase()
  const badgeClass = RELATION_BADGES[resident.relation] || 'badge-steel'

  const isLoading = activeTab === 'incomes' ? loadInc : loadExp
  const list = activeTab === 'incomes' ? incomes : expenses

  return (
    <div className="page-content">
      {/* Geri butonu */}
      <button
        id="back-to-residents"
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/residents')}
        style={{ alignSelf: 'flex-start' }}
      >
        <i className="fas fa-arrow-left me-1" />Ev Sakinleri
      </button>

      {/* Profil Kartı */}
      <div className="resident-detail-hero">
        <div className={`avatar av-lg resident-detail-avatar ${colorClass}`}>{initials}</div>
        <div className="resident-detail-info">
          <h1 className="resident-detail-name">{resident.name} {resident.surname}</h1>
          <div className="resident-detail-meta">
            <span className={`badge ${badgeClass}`}>{resident.relation}</span>
            <span className={`badge ${resident.is_active ? 'badge-forest' : 'badge-coral'}`}>
              {resident.is_active ? 'Aktif' : 'Pasif'}
            </span>
            {resident.birth_date && resident.birth_date !== '0001-01-01T00:00:00Z' && (
              <span className="resident-detail-birthdate">
                <i className="fas fa-birthday-cake me-1" />
                {new Date(resident.birth_date).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Özet İstatistik Kartları */}
      <div className="stat-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Toplam Gelir</div>
          <div className="stat-mini-value" style={{ color: 'var(--forest-mid)' }}>{fmt(totalIncome)}</div>
          <div className="stat-mini-bar"><div className="stat-mini-bar-fill pb-forest" style={{ width: '100%' }} /></div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Toplam Gider</div>
          <div className="stat-mini-value" style={{ color: 'var(--coral)' }}>{fmt(totalExpense)}</div>
          <div className="stat-mini-bar"><div className="stat-mini-bar-fill pb-coral" style={{ width: '100%' }} /></div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Net Bakiye</div>
          <div className="stat-mini-value" style={{ color: netBalance >= 0 ? 'var(--forest-mid)' : 'var(--coral)' }}>
            {netBalance >= 0 ? '+' : ''}{fmt(netBalance)}
          </div>
          <div className="stat-mini-bar">
            <div className="stat-mini-bar-fill" style={{
              width: '100%',
              background: netBalance >= 0 ? 'var(--grad-forest)' : 'var(--grad-coral)'
            }} />
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">İşlem Sayısı</div>
          <div className="stat-mini-value">{incomes.length + expenses.length}</div>
          <div className="stat-mini-bar"><div className="stat-mini-bar-fill pb-navy" style={{ width: '100%' }} /></div>
        </div>
      </div>

      {/* Tarih Filtresi */}
      <form id="resident-detail-filter" className="filter-bar" onSubmit={handleApply}>
        <div className="filter-group">
          <label htmlFor="detail-start" className="filter-label">Başlangıç</label>
          <input
            id="detail-start"
            type="date"
            name="start"
            className="form-control wallet-input filter-input"
            value={tempFilter.start}
            onChange={e => setTempFilter({ ...tempFilter, start: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="detail-end" className="filter-label">Bitiş</label>
          <input
            id="detail-end"
            type="date"
            name="end"
            className="form-control wallet-input filter-input"
            value={tempFilter.end}
            onChange={e => setTempFilter({ ...tempFilter, end: e.target.value })}
          />
        </div>
        <div className="filter-actions">
          <button id="detail-filter-btn" type="submit" className="btn wallet-btn-primary">
            <i className="fas fa-search me-1" />Filtrele
          </button>
        </div>
      </form>

      {/* Sekme */}
      <div className="rd-tabs">
        <button
          id="tab-expenses"
          className={`rd-tab ${activeTab === 'expenses' ? 'rd-tab-active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <i className="fas fa-arrow-trend-down me-1" />
          Giderler
          <span className="rd-tab-count">{expenses.length}</span>
        </button>
        <button
          id="tab-incomes"
          className={`rd-tab ${activeTab === 'incomes' ? 'rd-tab-active' : ''}`}
          onClick={() => setActiveTab('incomes')}
        >
          <i className="fas fa-arrow-trend-up me-1" />
          Gelirler
          <span className="rd-tab-count">{incomes.length}</span>
        </button>
      </div>

      {/* Tablo */}
      <div className="panel">
        {isLoading ? (
          <div className="loading-state"><i className="fas fa-spinner fa-spin me-2" />Yükleniyor...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className={`fas ${activeTab === 'incomes' ? 'fa-coins' : 'fa-receipt'}`} />
            </div>
            <div className="empty-text">Bu dönemde {activeTab === 'incomes' ? 'gelir' : 'gider'} yok</div>
          </div>
        ) : (
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="ptable">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Tarih</th>
                  <th style={{ textAlign: 'right' }}>Tutar</th>
                  {list[0]?.description !== undefined && <th>Açıklama</th>}
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.title}</td>
                    <td>
                      <span className="badge badge-steel">{item.category}</span>
                    </td>
                    <td style={{ color: 'var(--steel-dark)', fontSize: '.76rem' }}>
                      {new Date(item.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={activeTab === 'incomes' ? 'amount-income' : 'amount-expense'}>
                        {activeTab === 'incomes' ? '+' : '-'}{fmt(item.amount)}
                      </span>
                    </td>
                    {item.description !== undefined && (
                      <td style={{ color: 'var(--steel-dark)', fontSize: '.76rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description || '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResidentDetailPage
