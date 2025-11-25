
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, BarChart3, Building2, Home, FileText, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const BarraNavegacao: React.FC = () => {
  const [estaAberto, setEstaAberto] = useState(false)
  const localizacao = useLocation()
  const { theme, toggleTheme } = useTheme()

  const navegacao = [
    { nome: 'Início', href: '/', icone: Home },
    { nome: 'Consulta CNPJ', href: '/consultation', icone: Search },
    { nome: 'Painel de Controle', href: '/dashboard', icone: BarChart3 },
    { nome: 'Empresas', href: '/companies', icone: Building2 },
  ]

  const estaAtivo = (caminho: string) => localizacao.pathname === caminho

  return (
    <nav className="navegacao-edenred sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Edenred Brasil */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-red-600"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Edenred
                </h1>
                <p className="text-sm text-gray-500 font-medium -mt-1">Brasil</p>
              </div>
            </Link>
          </div>

          {/* Navegação Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {navegacao.map((item) => {
              const Icone = item.icone
              return (
                <Link
                  key={item.nome}
                  to={item.href}
                  className={`link-navegacao-edenred flex items-center space-x-2 ${
                    estaAtivo(item.href) ? 'active' : ''
                  }`}
                >
                  <Icone size={18} />
                  <span className="font-medium">{item.nome}</span>
                </Link>
              )
            })}
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-4 p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Botão CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/consultation"
              className="botao-edenred-primario text-sm flex items-center gap-2 px-4 py-2 min-w-[140px]"
            >
              <Search size={14} />
              <span className="whitespace-nowrap">Nova Consulta</span>
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Theme toggle button mobile */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setEstaAberto(!estaAberto)}
              className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-expanded={estaAberto}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Abrir menu</span>
              {estaAberto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navegação Mobile */}
      {estaAberto && (
        <div 
          id="mobile-menu"
          className="lg:hidden border-t border-gray-100 bg-white fixed top-[80px] left-0 right-0 z-50 shadow-lg animate-fadeIn"
        >
          <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navegacao.map((item) => {
              const Icone = item.icone
              return (
                <Link
                  key={item.nome}
                  to={item.href}
                  onClick={() => setEstaAberto(false)}
                  className={`link-navegacao-edenred flex items-center space-x-3 w-full ${
                    estaAtivo(item.href) ? 'active' : ''
                  }`}
                >
                  <Icone size={20} />
                  <span className="font-medium">{item.nome}</span>
                </Link>
              )
            })}
            
            <div className="pt-4 border-t border-gray-100">
              <Link
                to="/consultation"
                onClick={() => setEstaAberto(false)}
                className="botao-edenred-primario w-full flex items-center justify-center gap-2 px-4 py-3 text-base"
              >
                <Search size={16} />
                <span className="whitespace-nowrap">Nova Consulta</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default BarraNavegacao
