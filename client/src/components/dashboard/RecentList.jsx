import { Link } from 'react-router-dom'
import { useGetIncomesQuery } from '../../store/api/incomesApi'
import { useGetExpensesQuery } from '../../store/api/expensesApi'

function RecentList() {
  const { data: incomesData } = useGetIncomesQuery({})
  const { data: expensesData } = useGetExpensesQuery({})

  const incomes = (incomesData?.data || []).slice(0, 3).map((i) => ({ ...i, type: 'income' }))
  const expenses = (expensesData?.data || []).slice(0, 3).map((e) => ({ ...e, type: 'expense' }))

  const recent = [...incomes, ...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)

  return (
    <div className="recent-card">
      <div className="recent-header">
        <h5 className="recent-title">Son İşlemler</h5>
        <div className="recent-links">
          <Link to="/incomes" className="recent-link">Gelirler</Link>
          <span className="mx-1 text-muted">|</span>
          <Link to="/expenses" className="recent-link">Giderler</Link>
        </div>
      </div>
      <div className="recent-list">
        {recent.length === 0 ? (
          <div className="recent-empty">Henüz işlem yok</div>
        ) : (
          recent.map((item) => (
            <div key={`${item.type}-${item.id}`} className="recent-item">
              <div className="recent-item-icon">
                {item.type === 'income' ? '💰' : '💸'}
              </div>
              <div className="recent-item-info">
                <div className="recent-item-title">{item.title}</div>
                <div className="recent-item-meta">
                  {item.category} • {new Date(item.date).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className={`recent-item-amount ${item.type}`}>
                {item.type === 'income' ? '+' : '-'}
                ₺{item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentList
