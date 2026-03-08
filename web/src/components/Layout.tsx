import { Outlet } from 'react-router-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <NavLink to="/" className="sidebar-brand">
          챌린저스
        </NavLink>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            홈
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            프로필
          </NavLink>
          {!loading && (
            user ? (
              <button type="button" className="sidebar-link sidebar-logout" onClick={handleSignOut}>
                로그아웃
              </button>
            ) : (
              <NavLink to="/login" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                로그인
              </NavLink>
            )
          )}
        </nav>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
