import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useGetIncomesQuery } from '../../store/api/incomesApi'
import { useGetExpensesQuery } from '../../store/api/expensesApi'
import { useGetSummaryQuery, useGetResidentSummaryQuery } from '../../store/api/statsApi'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const today = new Date().toISOString().substring(0, 10)
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().substring(0, 10)

const RESIDENT_COLORS = [
  { bar: 'rgba(74,112,169,0.85)', border: '#4A70A9', text: '#4A70A9' },
  { bar: 'rgba(250,185,91,0.85)', border: '#FAB95B', text: '#c47a00' },
  { bar: 'rgba(74,151,130,0.85)', border: '#4A9782', text: '#4A9782' },
  { bar: 'rgba(191,70,70,0.85)',  border: '#BF4646', text: '#BF4646' },
  { bar: 'rgba(84,119,146,0.85)', border: '#547792', text: '#547792' },
]

const PERIOD_LABELS = { daily: 'Bugün', weekly: 'Bu Hafta', monthly: 'Bu Ay', yearly: 'Bu Yıl' }

function fmt(v) {
  return `₺${(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
}

function AnalyticsPage() {
  const [filter, setFilter] = useState({ start: monthStart, end: today })
  const [tempFilter, setTempFilter] = useState({ start: monthStart, end: today })
  const [residentPeriod, setResidentPeriod] = useState('monthly')

  const { data: incomesData, isLoading: loadingInc } = useGetIncomesQuery(filter)
  const { data: expensesData, isLoading: loadingExp } = useGetExpensesQuery(filter)
  const { data: summaryData } = useGetSummaryQuery()
  const { data: residentSummaryData, isLoading: loadingResidents } = useGetResidentSummaryQuery()

  const incomes = incomesData?.data || []
  const expenses = expensesData?.data || []
  const residentStats = residentSummaryData?.data || []

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)

  // Gider kategori dağılımı
  const expenseByCat = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  // Gelir kategori dağılımı
  const incomeByCat = incomes.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.amount
    return acc
  }, {})

  const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#a855f7','#f97316','#64748b']

  const expenseDoughnut = {
    labels: Object.keys(expenseByCat),
    datasets: [{
      data: Object.values(expenseByCat),
      backgroundColor: COLORS,
      borderWidth: 2,
      borderColor: '#1e293b',
    }],
  }

  const incomeDoughnut = {
    labels: Object.keys(incomeByCat),
    datasets: [{
      data: Object.values(incomeByCat),
      backgroundColor: COLORS,
      borderWidth: 2,
      borderColor: '#1e293b',
    }],
  }

  const compareBar = {
    labels: ['Gelir', 'Gider', 'Net Bakiye'],
    datasets: [{
      label: 'Tutar (₺)',
      data: [totalIncome, totalExpense, totalIncome - totalExpense],
      backgroundColor: [
        'rgba(74,151,130,0.85)',
        'rgba(191,70,70,0.85)',
        totalIncome - totalExpense >= 0 ? 'rgba(74,112,169,0.85)' : 'rgba(250,185,91,0.85)',
      ],
      borderRadius: 8,
    }],
  }

  // Üye bazlı harcama bar chart
  const residentExpenseKey = {
    daily: 'daily_expense', weekly: 'weekly_expense',
    monthly: 'monthly_expense', yearly: 'yearly_expense'
  }[residentPeriod]
  const residentIncomeKey = {
    daily: 'daily_income', weekly: 'weekly_income',
    monthly: 'monthly_income', yearly: 'yearly_income'
  }[residentPeriod]

  const residentBarData = {
    labels: residentStats.map(r => `${r.name} ${r.surname}`),
    datasets: [
      {
        label: 'Gider',
        data: residentStats.map(r => r[residentExpenseKey] || 0),
        backgroundColor: 'rgba(191,70,70,0.8)',
        borderRadius: 6,
      },
      {
        label: 'Gelir',
        data: residentStats.map(r => r[residentIncomeKey] || 0),
        backgroundColor: 'rgba(74,151,130,0.8)',
        borderRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e2e8f0' } },
      tooltip: {
        callbacks: {
          label: (ctx) => `₺${ctx.parsed.y?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || ctx.parsed.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
      y: { ticks: { color: '#94a3b8', callback: (v) => `₺${v.toLocaleString('tr-TR')}` }, grid: { color: 'rgba(148,163,184,0.1)' } },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#e2e8f0', padding: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₺${ctx.parsed.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
        },
      },
    },
  }

  const handleFilterChange = (e) => {
    setTempFilter({ ...tempFilter, [e.target.name]: e.target.value })
  }

  const handleApply = (e) => {
    e.preventDefault()
    setFilter(tempFilter)
  }

  const summary = summaryData?.data

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">📈 Finansal Analiz</h2>
        <p className="page-subtitle">Tarih aralığına göre detaylı rapor</p>
      </div>

      {/* Özet Kutular */}
      {summary && (
        <div className="analytics-summary-row">
          {[
            { label: 'Günlük Net', value: summary.daily?.net_balance, period: 'Bugün', inc: summary.daily?.total_income, exp: summary.daily?.total_expense },
            { label: 'Haftalık Net', value: summary.weekly?.net_balance, period: 'Bu Hafta', inc: summary.weekly?.total_income, exp: summary.weekly?.total_expense },
            { label: 'Aylık Net', value: summary.monthly?.net_balance, period: 'Bu Ay', inc: summary.monthly?.total_income, exp: summary.monthly?.total_expense },
            { label: 'Yıllık Net', value: summary.yearly?.net_balance, period: 'Bu Yıl', inc: summary.yearly?.total_income, exp: summary.yearly?.total_expense },
          ].map((item) => (
            <div key={item.label} className={`analytics-mini-card ${item.value >= 0 ? 'positive' : 'negative'}`}>
              <div className="analytics-mini-period">{item.period}</div>
              <div className={`analytics-mini-value ${item.value >= 0 ? 'positive' : 'negative'}`}>
                {item.value >= 0 ? '+' : ''}₺{item.value?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <div className="analytics-mini-label">{item.label}</div>
              <div className="analytics-mini-detail">
                <span className="analytics-mini-inc">▲ {fmt(item.inc)}</span>
                <span className="analytics-mini-exp">▼ {fmt(item.exp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====== ÜYE BAZLI HARCAMA ANALİZİ ====== */}
      <div className="analytics-chart-card">
        <div className="analytics-section-header">
          <div>
            <h5 className="analytics-chart-title" style={{ marginBottom: '.2rem' }}>
              <i className="fas fa-users me-2" style={{ color: 'var(--navy-mid)' }} />
              Üye Bazlı Harcama Analizi
            </h5>
            <p style={{ fontSize: '.76rem', color: 'var(--text-secondary)', margin: 0 }}>
              Ev sakinlerinin gelir ve giderlerini dönemsel olarak karşılaştırın
            </p>
          </div>
          <div className="period-buttons">
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`period-btn ${residentPeriod === key ? 'active' : ''}`}
                onClick={() => setResidentPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loadingResidents ? (
          <div className="loading-state"><i className="fas fa-spinner fa-spin me-2" />Yükleniyor...</div>
        ) : residentStats.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-icon"><i className="fas fa-users" /></div>
            <div className="empty-text">Kayıtlı ev sakini yok</div>
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div style={{ height: 240, marginBottom: '1.25rem' }}>
              <Bar data={residentBarData} options={chartOptions} />
            </div>

            {/* Detay Tablosu */}
            <div style={{ overflowX: 'auto' }}>
              <table className="ptable">
                <thead>
                  <tr>
                    <th>Kişi</th>
                    <th>İlişki</th>
                    <th style={{ color: 'var(--coral)' }}>Günlük Gider</th>
                    <th style={{ color: 'var(--coral)' }}>Haftalık Gider</th>
                    <th style={{ color: 'var(--coral)' }}>Aylık Gider</th>
                    <th style={{ color: 'var(--coral)' }}>Yıllık Gider</th>
                    <th style={{ color: 'var(--forest-mid)' }}>Aylık Gelir</th>
                    <th style={{ color: 'var(--forest-mid)' }}>Yıllık Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {residentStats.map((r, idx) => {
                    const col = RESIDENT_COLORS[idx % RESIDENT_COLORS.length]
                    const initials = `${r.name[0]}${r.surname[0]}`.toUpperCase()
                    return (
                      <tr key={r.resident_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: col.bar, border: `2px solid ${col.border}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '.65rem', fontWeight: 700, color: '#fff', flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <span style={{ fontWeight: 700, color: col.text }}>
                              {r.name} {r.surname}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-steel">{r.relation}</span>
                        </td>
                        <td>
                          <span className="amount-expense">{fmt(r.daily_expense)}</span>
                        </td>
                        <td>
                          <span className="amount-expense">{fmt(r.weekly_expense)}</span>
                        </td>
                        <td>
                          <span className="amount-expense">{fmt(r.monthly_expense)}</span>
                        </td>
                        <td>
                          <span className="amount-expense">{fmt(r.yearly_expense)}</span>
                        </td>
                        <td>
                          <span className="amount-income">{fmt(r.monthly_income)}</span>
                        </td>
                        <td>
                          <span className="amount-income">{fmt(r.yearly_income)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--sand-mid)', fontWeight: 700 }}>
                    <td colSpan={2} style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '.8rem' }}>
                      TOPLAM
                    </td>
                    <td><span className="amount-expense">{fmt(residentStats.reduce((s, r) => s + (r.daily_expense || 0), 0))}</span></td>
                    <td><span className="amount-expense">{fmt(residentStats.reduce((s, r) => s + (r.weekly_expense || 0), 0))}</span></td>
                    <td><span className="amount-expense">{fmt(residentStats.reduce((s, r) => s + (r.monthly_expense || 0), 0))}</span></td>
                    <td><span className="amount-expense">{fmt(residentStats.reduce((s, r) => s + (r.yearly_expense || 0), 0))}</span></td>
                    <td><span className="amount-income">{fmt(residentStats.reduce((s, r) => s + (r.monthly_income || 0), 0))}</span></td>
                    <td><span className="amount-income">{fmt(residentStats.reduce((s, r) => s + (r.yearly_income || 0), 0))}</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Tarih Filtresi */}
      <form id="analytics-filter-form" className="filter-bar mb-4" onSubmit={handleApply}>
        <div className="filter-group">
          <label htmlFor="analytics-start" className="filter-label">Başlangıç</label>
          <input
            id="analytics-start"
            type="date"
            name="start"
            className="form-control wallet-input filter-input"
            value={tempFilter.start}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="analytics-end" className="filter-label">Bitiş</label>
          <input
            id="analytics-end"
            type="date"
            name="end"
            className="form-control wallet-input filter-input"
            value={tempFilter.end}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-actions">
          <button id="analytics-filter-btn" type="submit" className="btn wallet-btn-primary">
            Raporla
          </button>
        </div>
      </form>

      {(loadingInc || loadingExp) ? (
        <div className="loading-state"><span className="spinner-border me-2" />Yükleniyor...</div>
      ) : (
        <>
          {/* Karşılaştırma Grafiği */}
          <div className="analytics-chart-card mb-4">
            <h5 className="analytics-chart-title">Gelir / Gider Karşılaştırması</h5>
            <div style={{ height: 220 }}>
              <Bar data={compareBar} options={chartOptions} />
            </div>
          </div>

          <div className="analytics-doughnut-row">
            <div className="analytics-chart-card">
              <h5 className="analytics-chart-title">
                Gider Kategorileri
                <span className="ms-2 fs-6 fw-normal" style={{ color: 'var(--coral)' }}>
                  ₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </h5>
              <div style={{ height: 220 }}>
                {Object.keys(expenseByCat).length > 0
                  ? <Doughnut data={expenseDoughnut} options={doughnutOptions} />
                  : <div className="empty-state">Bu dönemde gider yok</div>}
              </div>
            </div>
            <div className="analytics-chart-card">
              <h5 className="analytics-chart-title">
                Gelir Kategorileri
                <span className="ms-2 fs-6 fw-normal" style={{ color: 'var(--forest-mid)' }}>
                  ₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </h5>
              <div style={{ height: 220 }}>
                {Object.keys(incomeByCat).length > 0
                  ? <Doughnut data={incomeDoughnut} options={doughnutOptions} />
                  : <div className="empty-state">Bu dönemde gelir yok</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AnalyticsPage
