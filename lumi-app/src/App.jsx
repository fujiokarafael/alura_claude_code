import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DependenteProfile from './pages/DependenteProfile'

function RotaProtegida({ children }) {
  const { usuarioAtual, carregando } = useAuth()
  if (carregando) return <p className="carregando">Carregando...</p>
  if (!usuarioAtual) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />
        <Route
          path="/dependente/:id"
          element={
            <RotaProtegida>
              <DependenteProfile />
            </RotaProtegida>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
