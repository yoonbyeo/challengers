import { Outlet } from 'react-router-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture
  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? '사용자'

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
        {user && (
          <Link to="/profile" className="sidebar-profile">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="sidebar-profile-avatar" />
            ) : (
              <span className="sidebar-profile-avatar-initial">{displayName.charAt(0)}</span>
            )}
            <span className="sidebar-profile-name">{displayName}</span>
          </Link>
        )}
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
