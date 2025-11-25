import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Plus, BarChart3, TrendingUp, Users, FileText, Eye, Edit, Trash2 } from 'lucide-react'
import { apiService } from '../services/apiService'
import type { Consultation, User } from '../types/global'
import toast from 'react-hot-toast'

// Interface já importada do apiService

const Dashboard: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [stats, setStats] = useState({
    total: 0,
    emNegociacao: 0,
    concluidas: 0,
    perdidas: 0
  })

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: ''
  })

  const loadCurrentUser = () => {
    const user = apiService.getCurrentUser()
    setCurrentUser(user)
  }

  useEffect(() => {
    fetchConsultations()
    loadCurrentUser()
    
    // Atualizar automaticamente a cada 30 segundos
    const interval = setInterval(() => {
      fetchConsultations()
    }, 30000) // 30 segundos
    
    // Limpar intervalo quando componente desmontar
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterConsultations()
  }, [searchTerm, statusFilter, consultations, advancedFilters])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      
      // Buscar consultas reais da API
      const response = await apiService.getConsultations({ limit: 100 })
      
      if (response.success && response.data?.consultations) {
        const consultationsData = response.data.consultations
        setConsultations(consultationsData)
        
        // Calcular estatísticas
        setStats({
          total: consultationsData.length,
          emNegociacao: consultationsData.filter(c => c.status === 'INICIADA' || c.status === 'EM_PROGRESSO').length,
          concluidas: consultationsData.filter(c => c.status === 'FINALIZADA').length,
          perdidas: consultationsData.filter(c => c.status === 'ERRO' || c.status === 'CANCELADA').length
        })
      } else {
        // Fallback para dados mock se não conseguir carregar da API
        const mockData: Consultation[] = [
          {
            _id: '1',
            cnpj: '12.345.678/0001-90',
            userId: 'user1',
            userName: 'Usuario Teste',
            step: 5,
            maxSteps: 10,
            completed: false,
            status: 'FINALIZADA',
            progress: 50,
            isFavorite: false,
            priority: 'MEDIUM',
            produto: 'TICKET_RESTAURANT',
            createdAt: '2024-04-18T00:00:00.000Z',
            updatedAt: '2024-04-18T00:00:00.000Z'
          }
        ]
        
        setConsultations(mockData)
        setStats({
          total: mockData.length,
          emNegociacao: 0,
          concluidas: 1,
          perdidas: 0
        })
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar consultas:', error)
      toast.error('Erro ao carregar dados do painel')
      
      // Fallback em caso de erro
      setConsultations([])
      setStats({ total: 0, emNegociacao: 0, concluidas: 0, perdidas: 0 })
    } finally {
      setLoading(false)
    }
  }

  const filterConsultations = () => {
    let filtered = consultations

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.cnpj?.includes(searchTerm) ||
        c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c._id?.toString().includes(searchTerm)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Advanced filters
    if (advancedFilters.dateFrom) {
      filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(advancedFilters.dateFrom))
    }

    if (advancedFilters.dateTo) {
      filtered = filtered.filter(c => new Date(c.createdAt) <= new Date(advancedFilters.dateTo))
    }

    if (advancedFilters.status) {
      filtered = filtered.filter(c => c.status === advancedFilters.status)
    }

    setFilteredConsultations(filtered)
  }

  const exportToCSV = () => {
    if (filteredConsultations.length === 0) {
      toast.error('Nenhum dado para exportar')
      return
    }

    const headers = ['Data', 'Número', 'CNPJ', 'Produto', 'Status', 'Progresso']
    const csvContent = [
      headers.join(','),
      ...filteredConsultations.map(c => [
        new Date(c.createdAt).toLocaleDateString('pt-BR'),
        c._id || '',
        c.cnpj,
        c.produto || 'Não informado',
        c.status,
        `${c.progress || 0}%`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `consultas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Dados exportados com sucesso!')
  }

  const applyAdvancedFilters = () => {
    // The filters are already applied via state change
    setShowAdvancedFilters(false)
    toast.success('Filtros avançados aplicados!')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INICIADA':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">INICIADA</span>
      case 'EM_PROGRESSO':
        return <span className="badge-em-andamento">EM PROGRESSO</span>
      case 'FINALIZADA':
        return <span className="badge-sucesso">FINALIZADA</span>
      case 'ERRO':
        return <span className="badge-erro">ERRO</span>
      case 'CANCELADA':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">CANCELADA</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">{status}</span>
    }
  }

  const getProdutoBadge = (produto?: string) => {
    if (!produto) return <span className="text-gray-400 text-sm">Não informado</span>
    
    const produtos = {
      'FLEET': { label: 'Fleet', color: 'bg-blue-100 text-blue-800' },
      'TICKET_RESTAURANT': { label: 'Ticket Restaurant', color: 'bg-green-100 text-green-800' },
      'PAY': { label: 'Pay', color: 'bg-purple-100 text-purple-800' },
      'ALIMENTA': { label: 'Alimenta', color: 'bg-orange-100 text-orange-800' },
      'ABASTECIMENTO': { label: 'Abastecimento', color: 'bg-yellow-100 text-yellow-800' },
      'OUTRAS': { label: 'Outras', color: 'bg-gray-100 text-gray-800' }
    }

    const prod = produtos[produto as keyof typeof produtos] || { label: produto, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`${prod.color} px-3 py-1 rounded-full text-sm font-semibold`}>
        {prod.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen dashboard-section py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Painel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="titulo-principal text-4xl font-bold mb-2">Painel de Controle</h1>
                <p className="texto-elegante text-xl text-red-100">
                  {currentUser?.role === 'admin' 
                    ? 'Visualização completa de todas as indicações do sistema' 
                    : 'Acompanhe suas indicações e performance'}
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-red-200 text-sm">Total</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.emNegociacao}</div>
                  <div className="text-red-200 text-sm">Em Andamento</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.concluidas}</div>
                  <div className="text-red-200 text-sm">Ganhas</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.perdidas}</div>
                  <div className="text-red-200 text-sm">Perdidas</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards de Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="cartao-edenred text-center group hover:scale-105 transition-transform">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            <p className="texto-eleganter text-gray-600 font-semibold">Total de Indicações</p>
          </div>

          <div className="cartao-edenred text-center group hover:scale-105 transition-transform">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl mb-4">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.emNegociacao}</h3>
            <p className="texto-eleganter text-gray-600 font-semibold">Em Negociação</p>
          </div>

          <div className="cartao-edenred text-center group hover:scale-105 transition-transform">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-4">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.concluidas}</h3>
            <p className="texto-eleganter text-gray-600 font-semibold">Concluídas e Ganhas</p>
          </div>

          <div className="cartao-edenred text-center group hover:scale-105 transition-transform">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.perdidas}</h3>
            <p className="texto-eleganter text-gray-600 font-semibold">Perdidas</p>
          </div>
        </motion.div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cartao-edenredash mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por CNPJ, produto ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full sm:w-80"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="forms border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Todos os Status</option>
                <option value="INICIADA">Iniciada</option>
                <option value="EM_PROGRESSO">Em Progresso</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="ERRO">Erro</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  fetchConsultations()
                  toast.success('Dados atualizados!')
                }}
                className="botao-edenred-secundario flex items-center"
                title="Atualizar dados"
              >
                <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Atualizar
              </button>
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="botao-edenred-secundario flex items-center"
              >
                <Filter className="mr-2" size={18} />
                Filtros Avançados
              </button>
              <button
                onClick={exportToCSV}
                className="botao-edenred-primario flex items-center"
              >
                <Download className="mr-2" size={18} />
                Exportar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabela de Indicações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="cartao-edenredash overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white p-6 mb-6 rounded-xl">
            <h3 className="font-bold text-center text-lg mb-4">
              🔍 ACOMPANHAR INDICAÇÕES
            </h3>
            <div className="text-center text-red-100 text-sm">
              FILTROS: NÚMERO | CNPJ | PRODUTO | STATUS
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="carregamento-edenred mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando indicações...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">DATA</th>
                    <th className="px-6 py-4 text-left font-semibold">NÚMERO</th>
                    <th className="px-6 py-4 text-left font-semibold">CNPJ</th>
                    <th className="px-6 py-4 text-left font-semibold">PRODUTO</th>
                    {currentUser?.role === 'admin' && (
                      <th className="px-6 py-4 text-left font-semibold">USUÁRIO</th>
                    )}
                    <th className="px-6 py-4 text-left font-semibold">STATUS</th>
                    <th className="px-6 py-4 text-left font-semibold">PROGRESSO</th>
                    <th className="px-6 py-4 text-left font-semibold">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredConsultations.map((consultation, index) => (
                    <tr key={consultation._id} className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {new Date(consultation.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600">
                        {consultation._id || `${String(index + 1).padStart(3, '0')}`}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {consultation.cnpj}
                      </td>
                      <td className="px-6 py-4">
                        {getProdutoBadge(consultation.produto)}
                      </td>
                      {currentUser?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm mr-2">
                              {consultation.userName ? consultation.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{consultation.userName || 'Usuário'}</div>
                              <div className="text-xs text-gray-500">ID: {consultation.userId || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {getStatusBadge(consultation.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-red-600 h-2 rounded-full transition-all" 
                              style={{ width: `${consultation.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{consultation.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye size={18} />
                          </button>
                          <button className="text-green-600 hover:text-green-800 transition-colors">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhuma indicação encontrada</p>
                  <p className="text-gray-400 text-sm">Ajuste os filtros ou faça uma nova consulta</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Botão de Nova Consulta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => window.location.href = '/consultation'}
            className="botao-edenred-primario text-lg px-8 py-4"
          >
            <Plus className="mr-3" size={20} />
            Nova Indicação
          </button>
        </motion.div>

        {/* Modal de Filtros Avançados */}
        {showAdvancedFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filtros Avançados</h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Todos os Status</option>
                    <option value="INICIADA">Iniciada</option>
                    <option value="EM_PROGRESSO">Em Progresso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="ERRO">Erro</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setAdvancedFilters({ dateFrom: '', dateTo: '', status: '' })
                    setShowAdvancedFilters(false)
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={applyAdvancedFilters}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
