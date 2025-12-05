import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import BarraNavegacao from './components/Navbar'
import Chatbot from './components/Chatbot'
import Inicio from './pages/Home'
import Consulta from './pages/Consultation'
import PainelControle from './pages/Dashboard'
import Empresas from './pages/Companies'
import Entrar from './pages/Login'

function App() {
  const [estaAutenticado, setEstaAutenticado] = useState(false) // 👈 controle de autenticação do usuário
  const [carregandoAuth, setCarregandoAuth] = useState(true)

  // Sempre mostrar tela de login ao iniciar
  useEffect(() => {
    setCarregandoAuth(false)
  }, [])

  // Mostrar loading enquanto verifica autenticação
  if (carregandoAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: { background: '#363636', color: '#fff', fontSize: '14px' },
          success: { style: { background: '#10b981' } },
          error: { style: { background: '#ef4444' } }
        }}
      />
      
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* só mostra Barra de Navegação se o usuário estiver autenticado */}
          {estaAutenticado && <BarraNavegacao />}
          
          <Routes>
            {/* Se não estiver autenticado ainda, só mostra página de login */}
            {!estaAutenticado ? (
              <Route path="*" element={<Entrar aoEntrar={() => setEstaAutenticado(true)} />} />
            ) : (
              <>
                <Route path="/" element={<Inicio />} />
                <Route path="/consultation" element={<Consulta />} />
                <Route path="/dashboard" element={<PainelControle />} />
                <Route path="/companies" element={<Empresas />} />
                <Route path="/login" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
          
          {/* Chatbot disponível em todas as páginas quando autenticado */}
          {estaAutenticado && <Chatbot />}
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
