import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useResetPasswordMutation } from '../../store/api/authApi'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [form, setForm] = useState({ token: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    try {
      await resetPassword({ token: form.token, password: form.password }).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err?.data?.message || 'Şifre sıfırlanamadı.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🔑</span>
          <h1 className="auth-title">Şifre Sıfırla</h1>
          <p className="auth-subtitle">Yeni şifrenizi belirleyin</p>
        </div>

        {success ? (
          <div className="alert alert-success text-center">
            ✅ Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...
          </div>
        ) : (
          <form id="reset-password-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label htmlFor="reset-token" className="form-label">Sıfırlama Token</label>
              <input
                id="reset-token"
                type="text"
                name="token"
                className="form-control wallet-input"
                placeholder="Token kodunu girin"
                value={form.token}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reset-password" className="form-label">Yeni Şifre</label>
              <input
                id="reset-password"
                type="password"
                name="password"
                className="form-control wallet-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reset-confirm" className="form-label">Şifre Tekrar</label>
              <input
                id="reset-confirm"
                type="password"
                name="confirm"
                className="form-control wallet-input"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              className="btn wallet-btn-primary w-100 mt-2"
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              {isLoading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
            </button>

            <div className="auth-links mt-3 text-center">
              <Link to="/login" className="auth-link">← Giriş sayfasına dön</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
