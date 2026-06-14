import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '../../store/api/authApi'

function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResetToken('')
    try {
      const result = await forgotPassword({ email }).unwrap()
      setMessage(result.message)
      if (result.data?.token) {
        setResetToken(result.data.token)
      }
    } catch (err) {
      setError(err?.data?.message || 'Bir hata oluştu.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🔐</span>
          <h1 className="auth-title">Şifremi Unuttum</h1>
          <p className="auth-subtitle">E-posta adresinizi girin</p>
        </div>

        <form id="forgot-password-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && (
            <div className="alert alert-success">
              <div>{message}</div>
              {resetToken && (
                <div className="mt-2">
                  <small className="text-muted">Sıfırlama Token:</small>
                  <code className="d-block mt-1 p-2 bg-light rounded" style={{ wordBreak: 'break-all' }}>
                    {resetToken}
                  </code>
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="forgot-email" className="form-label">E-posta</label>
            <input
              id="forgot-email"
              type="email"
              className="form-control wallet-input"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            id="forgot-submit-btn"
            type="submit"
            className="btn wallet-btn-primary w-100 mt-2"
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>

          <div className="auth-links mt-3 text-center">
            <Link to="/login" className="auth-link">← Giriş sayfasına dön</Link>
          </div>
          <div className="auth-links mt-2 text-center">
            <Link to="/reset-password" className="auth-link">Token ile şifre sıfırla →</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
