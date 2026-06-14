import { useState } from 'react'

function ExpenseFilter({ onFilter }) {
  const [form, setForm] = useState({ start: '', end: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleApply = (e) => {
    e.preventDefault()
    onFilter(form)
  }

  const handleReset = () => {
    setForm({ start: '', end: '' })
    onFilter({})
  }

  return (
    <form id="expense-filter-form" className="filter-bar" onSubmit={handleApply}>
      <div className="filter-group">
        <label htmlFor="expense-filter-start" className="filter-label">Başlangıç</label>
        <input
          id="expense-filter-start"
          type="date"
          name="start"
          className="form-control wallet-input filter-input"
          value={form.start}
          onChange={handleChange}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="expense-filter-end" className="filter-label">Bitiş</label>
        <input
          id="expense-filter-end"
          type="date"
          name="end"
          className="form-control wallet-input filter-input"
          value={form.end}
          onChange={handleChange}
        />
      </div>
      <div className="filter-actions">
        <button id="expense-filter-apply" type="submit" className="btn wallet-btn-outline-expense">
          Filtrele
        </button>
        <button id="expense-filter-reset" type="button" className="btn wallet-btn-secondary" onClick={handleReset}>
          Temizle
        </button>
      </div>
    </form>
  )
}

export default ExpenseFilter
