import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useGetChartQuery } from '../../store/api/statsApi'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PERIODS = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
  { value: 'yearly', label: 'Yıllık' },
]

function PeriodChart() {
  const [period, setPeriod] = useState('monthly')
  const { data, isLoading } = useGetChartQuery(period)

  const chartData = {
    labels: data?.data?.map((p) => p.label) || [],
    datasets: [
      {
        label: 'Gelir',
        data: data?.data?.map((p) => p.income) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Gider',
        data: data?.data?.map((p) => p.expense) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#e2e8f0' } },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ₺${ctx.parsed.y.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
      y: {
        ticks: {
          color: '#94a3b8',
          callback: (v) => `₺${v.toLocaleString('tr-TR')}`,
        },
        grid: { color: 'rgba(148,163,184,0.1)' },
      },
    },
  }

  return (
    <div className="period-chart-card">
      <div className="period-chart-header">
        <h5 className="period-chart-title">Gelir / Gider Grafiği</h5>
        <div className="period-buttons">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              id={`period-btn-${p.value}`}
              className={`period-btn ${period === p.value ? 'active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="period-chart-body">
        {isLoading ? (
          <div className="chart-loading">
            <span className="spinner-border spinner-border-sm me-2" />
            Yükleniyor...
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  )
}

export default PeriodChart
