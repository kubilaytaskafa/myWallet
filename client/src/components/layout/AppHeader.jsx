import { useSelector } from 'react-redux'
import { useDarkMode } from '../../hooks/useDarkMode'

function AppHeader() {
  const { user } = useSelector((s) => s.auth)
  const [dark, setDark] = useDarkMode()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'KU'

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <i className="fas fa-wallet" />
        </div>
        <span>myWallet</span>
      </div>
      <div className="header-sep" />
      <div className="header-actions">
        <button
          id="dark-mode-toggle"
          className="header-action-btn"
          onClick={() => setDark(d => !d)}
          title={dark ? 'Açık Tema' : 'Koyu Tema'}
        >
          <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`} />
        </button>
        <div className="header-user">
          <div className="avatar av-amber" style={{ width: 26, height: 26, fontSize: '.65rem' }}>
            {initials}
          </div>
          <div>
            <div className="header-user-name">{user?.name}</div>
            <div className="header-user-role">Admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
