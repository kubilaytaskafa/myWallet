import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'

function AppLayout() {
  return (
    <div className="app-layout">
      <AppHeader />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
