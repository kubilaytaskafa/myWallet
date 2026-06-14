import { useSelector } from 'react-redux'
import { useGetSummaryQuery } from '../../store/api/statsApi'
import PeriodChart from '../../components/dashboard/PeriodChart'
import RecentList from '../../components/dashboard/RecentList'

function DashboardPage() {
  const { user } = useSelector((s) => s.auth)
  const { data: summaryData, isLoading } = useGetSummaryQuery()
  const m = summaryData?.data?.monthly

  return (
    <div className="page-content">
      <div className="page-heading">
        <h1>Genel Bakış</h1>
        <p>Hoş geldin, <strong>{user?.name}</strong> — aylık finansal özet</p>
      </div>

      {isLoading ? (
        <div className="loading-state"><i className="fas fa-spinner fa-spin" /> Yükleniyor...</div>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat-mini">
              <div className="stat-mini-label">Aylık Gelir</div>
              <div className="stat-mini-value">₺{(m?.total_income || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div className="stat-mini-sub up"><i className="fas fa-arrow-up" style={{ fontSize: '.6rem' }} /> Bu ay</div>
              <div className="stat-mini-bar"><div className="stat-mini-bar-fill pb-forest" style={{ width: '70%' }} /></div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Aylık Gider</div>
              <div className="stat-mini-value">₺{(m?.total_expense || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div className="stat-mini-sub down"><i className="fas fa-arrow-down" style={{ fontSize: '.6rem' }} /> Bu ay</div>
              <div className="stat-mini-bar"><div className="stat-mini-bar-fill pb-coral" style={{ width: '50%' }} /></div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Net Bakiye</div>
              <div className="stat-mini-value" style={{ color: (m?.net_balance || 0) >= 0 ? 'var(--forest-mid)' : 'var(--coral)' }}>
                {(m?.net_balance || 0) >= 0 ? '+' : ''}₺{(m?.net_balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <div className="stat-mini-sub" style={{ color: 'var(--steel-dark)' }}>Gelir - Gider</div>
              <div className="stat-mini-bar"><div className="stat-mini-bar-fill pb-navy" style={{ width: '60%' }} /></div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="period-chart-card">
              <PeriodChart />
            </div>
            <RecentList />
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardPage
