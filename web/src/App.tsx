import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import ChallengeDetail from './pages/ChallengeDetail'
import ChallengeBrowse from './pages/ChallengeBrowse'
import ProfilePage from './pages/ProfilePage'
import ShopPage from './pages/ShopPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/challenge/:id" element={<ChallengeDetail />} />
            <Route path="/challenge/:id/browse" element={<ChallengeBrowse />} />
          </Route>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
