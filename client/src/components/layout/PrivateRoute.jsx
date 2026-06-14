import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default PrivateRoute
