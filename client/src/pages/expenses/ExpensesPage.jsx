import { useState } from 'react'
import { useGetExpensesQuery } from '../../store/api/expensesApi'
import ExpenseList from '../../components/expenses/ExpenseList'
import ExpenseForm from '../../components/expenses/ExpenseForm'
import ExpenseFilter from '../../components/expenses/ExpenseFilter'

function ExpensesPage() {
  const [showForm, setShowForm] = useState(false)
  const [filterParams, setFilterParams] = useState({})
  const { data, isLoading, error } = useGetExpensesQuery(filterParams)

  const expenses = data?.data || []
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">💸 Giderler</h2>
          <p className="page-subtitle">
            Toplam: <strong>₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
            {' '}({expenses.length} kayıt)
          </p>
        </div>
        <button
          id="add-expense-btn"
          className="btn wallet-btn-expense"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Kapat' : '+ Gider Ekle'}
        </button>
      </div>

      {showForm && (
        <div className="form-card mb-4">
          <h5 className="form-card-title">Yeni Gider</h5>
          <ExpenseForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <ExpenseFilter onFilter={setFilterParams} />

      {isLoading ? (
        <div className="loading-state">
          <span className="spinner-border me-2" /> Yükleniyor...
        </div>
      ) : error ? (
        <div className="alert alert-danger">Giderler yüklenemedi.</div>
      ) : (
        <ExpenseList expenses={expenses} />
      )}
    </div>
  )
}

export default ExpensesPage
