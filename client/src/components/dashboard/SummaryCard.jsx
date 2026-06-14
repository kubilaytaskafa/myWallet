function SummaryCard({ title, amount, icon, colorClass, subtitle }) {
  const formattedAmount = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount || 0)

  return (
    <div className={`summary-card ${colorClass}`}>
      <div className="summary-card-header">
        <span className="summary-card-icon">{icon}</span>
        <span className="summary-card-title">{title}</span>
      </div>
      <div className="summary-card-amount">{formattedAmount}</div>
      {subtitle && <div className="summary-card-subtitle">{subtitle}</div>}
    </div>
  )
}

export default SummaryCard
