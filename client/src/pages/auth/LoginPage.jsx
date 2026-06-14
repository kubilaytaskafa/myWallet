import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../store/api/authApi";
import { setCredentials } from "../../store/auth/authSlice";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(form).unwrap();
      const userData = result.data;
      dispatch(
        setCredentials({
          user: {
            id: userData.userId,
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
          },
          token: userData.token,
        }),
      );
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.data?.message || "Giriş başarısız. Bilgilerinizi kontrol edin.",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">💳</span>
          <h1 className="auth-title">myWallet</h1>
          <p className="auth-subtitle">Aile bütçe yöneticinize hoş geldiniz</p>
        </div>

        <form id="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">
              E-posta
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control wallet-input"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="login-password" className="form-label">
              Şifre
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-control wallet-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn wallet-btn-primary w-100 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : null}
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <div className="auth-links mt-3 text-center">
            <Link to="/forgot-password" className="auth-link">
              Şifremi Unuttum
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
