import { useState } from 'react'
import { useGetIncomesQuery } from '../../store/api/incomesApi'
import IncomeList from '../../components/incomes/IncomeList'
import IncomeForm from '../../components/incomes/IncomeForm'
import IncomeFilter from '../../components/incomes/IncomeFilter'

function IncomesPage() {
  const [showForm, setShowForm] = useState(false)
  const [filterParams, setFilterParams] = useState({})
  const { data, isLoading, error } = useGetIncomesQuery(filterParams)

  const incomes = data?.data || []
  const total = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">💰 Gelirler</h2>
          <p className="page-subtitle">
            Toplam: <strong>₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
            {' '}({incomes.length} kayıt)
          </p>
        </div>
        <button
          id="add-income-btn"
          className="btn wallet-btn-income"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Kapat' : '+ Gelir Ekle'}
        </button>
      </div>

      {showForm && (
        <div className="form-card mb-4">
          <h5 className="form-card-title">Yeni Gelir</h5>
          <IncomeForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <IncomeFilter onFilter={setFilterParams} />

      {isLoading ? (
        <div className="loading-state">
          <span className="spinner-border me-2" /> Yükleniyor...
        </div>
      ) : error ? (
        <div className="alert alert-danger">Gelirler yüklenemedi.</div>
      ) : (
        <IncomeList incomes={incomes} />
      )}
    </div>
  )
}

export default IncomesPage
