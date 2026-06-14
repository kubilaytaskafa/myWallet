import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../store/auth/authSlice'

const NAV = [
  { to: '/dashboard', icon: 'fa-home', label: 'Genel Bakış' },
  { to: '/incomes',   icon: 'fa-arrow-down', label: 'Gelirler' },
  { to: '/expenses',  icon: 'fa-arrow-up',   label: 'Giderler' },
  { to: '/analytics', icon: 'fa-chart-bar',  label: 'Analiz' },
  { to: '/residents', icon: 'fa-users',      label: 'Ev Sakinleri' },
]

function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'KU'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-label">ANA MENÜ</div>
        {NAV.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><i className={`fas ${item.icon}`} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-section">
        <hr className="sidebar-divider" />
        <div className="sidebar-section-label">YÖNETİM</div>
        <NavLink
          to="/residents"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon"><i className="fas fa-users" /></span>
          <span>Ev Sakinleri</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user-row">
          <div className="avatar av-navy av-lg">{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="sidebar-user-name">{user?.name || 'Kullanıcı'}</div>
            <div className="sidebar-user-role">{user?.email}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
