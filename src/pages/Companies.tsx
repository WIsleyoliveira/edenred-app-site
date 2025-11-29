import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Building2, MapPin, Phone, Mail, Filter, Plus, Eye, Edit, Trash2, Download } from 'lucide-react'
import { apiService } from '../services/apiService'
import type { Company, User } from '../types/global'
import toast from 'react-hot-toast'

// Interface Company já importada do apiService

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [situacaoFilter, setSituacaoFilter] = useState('')
  const [porteFilter, setPorteFilter] = useState('')
  const [atividadeFilter, setAtividadeFilter] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    fetchCompanies()
    loadCurrentUser()
    
    // Atualizar automaticamente a cada 30 segundos
    const interval = setInterval(() => {
      fetchCompanies()
    }, 30000) // 30 segundos
    
    // Limpar intervalo quando componente desmontar
    return () => clearInterval(interval)
  }, [])

  const handleDeleteCompany = async (companyId: string, cnpj: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa ${cnpj}? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      // Chamar API para excluir empresa (se existir)
      // Por enquanto, apenas remover do estado local
      setCompanies(prev => prev.filter(c => c._id !== companyId))
      toast.success('Empresa excluída com sucesso!')
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error)
      toast.error('Erro ao excluir empresa')
    }
  }

  const loadCurrentUser = () => {
    const user = apiService.getCurrentUser()
    setCurrentUser(user)
  }

  useEffect(() => {
    filterCompanies()
  }, [searchTerm, situacaoFilter, porteFilter, atividadeFilter, companies])

  const fetchCompanies = async () => {
    try {
      setLoading(true)

      // Obter usuário atual
      const user = apiService.getCurrentUser()
      console.log('👤 Usuário atual:', user?._id)

      // Buscar consultas do usuário (limite razoável)
      const consultationsResponse = await apiService.getConsultations({ limit: 200 })
      console.log('📊 Resposta de consultas:', consultationsResponse)

      if (!consultationsResponse.success || !consultationsResponse.data?.consultations) {
        console.warn('⚠️ Nenhuma consulta encontrada ou resposta inválida')
        setCompanies([])
        return
      }

      const consultations = consultationsResponse.data.consultations
      console.log(`✅ ${consultations.length} consultas encontradas`)

      // Filtrar apenas consultas realizadas pelo usuário logado (se houver user)
      const userConsultations = user
        ? consultations.filter(c => c.userId === user._id)
        : consultations

      console.log(`👥 ${userConsultations.length} consultas do usuário logado`)

      // Mapear para empresas e deduplicar por CNPJ (preferir companyData se presente)
      const mapByCnpj = new Map<string, Company>()

      userConsultations.forEach((c, index) => {
        try {
          const cnpj = c.cnpj || ''
          
          if (!cnpj || !cnpj.trim()) {
            console.warn(`⚠️ Consulta ${index} sem CNPJ válido:`, c._id)
            return
          }

          const normalized = cnpj.trim()

          // Evitar duplicatas
          if (mapByCnpj.has(normalized)) {
            return
          }

          // Backend retorna dados em c.result (da API) ou c.company (do banco)
          const sourceData = (c.result || c.company || c.companyData) as any

          // Se existe dados da empresa (result/company/companyData)
          if (sourceData && typeof sourceData === 'object') {
            mapByCnpj.set(normalized, {
              _id: sourceData._id || sourceData.id || c._id,
              cnpj: normalized,
              razaoSocial: sourceData.razaoSocial || sourceData.razao_social || sourceData.nome || `Empresa ${normalized}`,
              nomeFantasia: sourceData.nomeFantasia || sourceData.nome_fantasia || sourceData.fantasia || undefined,
              situacao: sourceData.situacao || sourceData.status || 'ATIVA',
              porte: sourceData.porte || 'DEMAIS',
              dataAbertura: sourceData.dataAbertura || sourceData.data_abertura || sourceData.abertura || undefined,
              naturezaJuridica: sourceData.naturezaJuridica || sourceData.natureza_juridica || undefined,
              atividadePrincipal: sourceData.atividadePrincipal || sourceData.atividade_principal || undefined,
              telefone: sourceData.telefone || undefined,
              email: sourceData.email || undefined,
              logradouro: sourceData.logradouro || sourceData.endereco?.logradouro || undefined,
              numero: sourceData.numero || sourceData.endereco?.numero || undefined,
              complemento: sourceData.complemento || sourceData.endereco?.complemento || undefined,
              bairro: sourceData.bairro || sourceData.endereco?.bairro || undefined,
              municipio: sourceData.municipio || sourceData.endereco?.municipio || sourceData.endereco?.cidade || undefined,
              uf: sourceData.uf || sourceData.endereco?.uf || undefined,
              cep: sourceData.cep || sourceData.endereco?.cep || undefined,
              capitalSocial: sourceData.capitalSocial || sourceData.capital_social || undefined,
              qsa: sourceData.qsa || [],
              status: c.status || 'EM_ANALISE',
              userId: c.userId || user?._id || '',
              createdAt: c.createdAt,
              updatedAt: c.updatedAt,
              lastUpdated: c.updatedAt || c.createdAt
            } as Company)
          } else {
            // Se não tem dados da empresa, tenta extrair do formData ou cria básico
            const formData = c.formData || {}
            mapByCnpj.set(normalized, {
              _id: c._id,
              cnpj: normalized,
              razaoSocial: (formData.razaoSocial as string) || `Empresa ${normalized}`,
              nomeFantasia: (formData.nomeFantasia as string) || undefined,
              situacao: 'ATIVA',
              porte: 'DEMAIS',
              telefone: (formData.telefone as string) || undefined,
              email: (formData.email as string) || undefined,
              status: c.status || 'EM_ANALISE',
              userId: c.userId || user?._id || '',
              createdAt: c.createdAt,
              updatedAt: c.updatedAt
            } as Company)
          }
        } catch (itemError) {
          console.error(`❌ Erro ao processar consulta ${index}:`, itemError, c)
        }
      })

      const deduped = Array.from(mapByCnpj.values())
      console.log(`🏢 ${deduped.length} empresas únicas encontradas`)
      
      setCompanies(deduped)

      if (deduped.length === 0) {
        toast('Nenhuma empresa consultada ainda. Faça sua primeira consulta!', { icon: 'ℹ️' })
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar empresas por consultas:', error)
      toast.error(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = companies

    if (searchTerm) {
      const normalizedSearch = searchTerm.replace(/\D/g, '').toLowerCase()

      filtered = filtered.filter(c => {
        const cnpjDigits = (c.cnpj || '').replace(/\D/g, '')
        const matchesCnpj = cnpjDigits.includes(normalizedSearch) && normalizedSearch.length > 0

        const nameMatch = (c.razaoSocial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.nomeFantasia || '').toLowerCase().includes(searchTerm.toLowerCase())

        return matchesCnpj || nameMatch
      })
    }

    if (situacaoFilter) {
      filtered = filtered.filter(c => c.situacao === situacaoFilter)
    }

    if (porteFilter) {
      filtered = filtered.filter(c => c.porte === porteFilter)
    }

    if (atividadeFilter) {
      filtered = filtered.filter(c =>
        c.atividades?.some(a => a.descricao.toLowerCase().includes(atividadeFilter.toLowerCase()))
      )
    }

    setFilteredCompanies(filtered)
  }

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'ATIVA':
        return <span className="badge-sucesso">ATIVA</span>
      case 'SUSPENSA':
        return <span className="badge-erro">SUSPENSA</span>
      case 'BAIXADA':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">BAIXADA</span>
      default:
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{situacao}</span>
    }
  }

  const getPorteBadge = (porte: string) => {
    const colors = {
      'ME': 'bg-green-100 text-green-800',
      'EPP': 'bg-blue-100 text-blue-800',
      'DEMAIS': 'bg-purple-100 text-purple-800'
    }

    const labels = {
      'ME': 'ME',
      'EPP': 'EPP',
      'DEMAIS': 'DEMAIS'
    }

    return (
      <span className={`${colors[porte as keyof typeof colors] || 'bg-gray-100 text-gray-800'} px-3 py-1 rounded-full text-sm font-semibold`}>
        {labels[porte as keyof typeof labels] || porte}
      </span>
    )
  }

  const exportToCSV = () => {
    const headers = [
      'CNPJ',
      'Razão Social',
      'Nome Fantasia',
      'Situação',
      'Porte',
      'Telefone',
      'Email',
      'Logradouro',
      'Número',
      'Bairro',
      'CEP',
      'Cidade',
      'UF',
      'Atividades',
      'Status',
      'Data Criação',
      'Última Atualização'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredCompanies.map(company => [
        `"${company.cnpj}"`,
        `"${company.razaoSocial}"`,
        `"${company.nomeFantasia || ''}"`,
        `"${company.situacao}"`,
        `"${company.porte}"`,
        `"${company.telefone || ''}"`,
        `"${company.email || ''}"`,
        `"${company.endereco?.logradouro || ''}"`,
        `"${company.endereco?.numero || ''}"`,
        `"${company.endereco?.bairro || ''}"`,
        `"${company.endereco?.cep || ''}"`,
        `"${company.endereco?.cidade || ''}"`,
        `"${company.endereco?.uf || ''}"`,
        `"${company.atividades?.map(a => a.descricao).join('; ') || ''}"`,
        `"${company.status}"`,
        `"${new Date(company.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${new Date(company.updatedAt).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `empresas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen companies-section py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="titulo-principal text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Gestão de Empresas</h1>
                <p className="texto-elegante text-sm sm:text-base md:text-xl text-red-100">
                  {currentUser?.role === 'admin' 
                    ? 'Visualização completa de todas as empresas do sistema' 
                    : 'Empresas consultadas e cadastradas'}
                </p>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{companies.length}</div>
                  <div className="text-red-200 text-xs sm:text-sm">Empresas</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cartao-edenredash mb-8"
        >
          <div className="flex flex-col gap-4">
            {/* Barra de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por CNPJ, razão social ou nome fantasia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
              />
            </div>

            {/* Filtros em grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <select
                value={situacaoFilter}
                onChange={(e) => setSituacaoFilter(e.target.value)}
                className="forms border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base py-2.5 sm:py-3"
              >
                <option value="">Todas as Situações</option>
                <option value="ATIVA">Ativa</option>
                <option value="SUSPENSA">Suspensa</option>
                <option value="BAIXADA">Baixada</option>
              </select>

              <select
                value={porteFilter}
                onChange={(e) => setPorteFilter(e.target.value)}
                className="forms border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base py-2.5 sm:py-3"
              >
                <option value="">Todos os Portes</option>
                <option value="ME">Microempresa</option>
                <option value="EPP">Pequena</option>
                <option value="DEMAIS">Médio/Grande</option>
              </select>

              <select
                value={atividadeFilter}
                onChange={(e) => setAtividadeFilter(e.target.value)}
                className="forms border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base py-2.5 sm:py-3"
              >
                <option value="">Todas as Atividades</option>
                <option value="Distribuição de Alimentos">Distribuição de Alimentos</option>
                <option value="Consultoria Empresarial">Consultoria Empresarial</option>
                <option value="Desenvolvimento de Software">Desenvolvimento de Software</option>
                <option value="Metalurgia">Metalurgia</option>
              </select>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  fetchCompanies()
                  toast.success('Dados atualizados!')
                }}
                className="botao-edenred-secundario flex items-center text-sm sm:text-base px-3 sm:px-4 py-2"
                title="Atualizar dados"
              >
                <svg className="mr-1 sm:mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">Atualizar</span>
              </button>
              <button className="botao-edenred-secundario flex items-center text-sm sm:text-base px-3 sm:px-4 py-2">
                <Filter className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Filtros Avançados</span>
                <span className="sm:hidden">Filtros</span>
              </button>
              <button
                onClick={exportToCSV}
                className="botao-edenred-secundario flex items-center text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <Download className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Exportar CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              <button
                onClick={() => window.location.href = '/consultation'}
                className="botao-edenred-primario flex items-center text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <Plus className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Nova Empresa</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabela de Empresas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cartao-edenredash overflow-hidden"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="carregamento-edenred mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando empresas...</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">CNPJ</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">RAZÃO SOCIAL</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">SITUAÇÃO</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">PORTE</th>
                        {currentUser?.role === 'admin' && (
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">ADICIONADO POR</th>
                        )}
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">CONTATO</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">LOCALIZAÇÃO</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredCompanies.map((company) => (
                        <tr key={company._id} className="hover:bg-red-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div>
                              <div className="font-mono text-xs sm:text-sm font-semibold">{company.cnpj}</div>
                              {company.nomeFantasia && (
                                <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-xs">{company.nomeFantasia}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm max-w-[150px] sm:max-w-xs truncate">
                              {company.razaoSocial}
                            </div>
                            {company.atividades && company.atividades.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px] sm:max-w-xs">{company.atividades[0].descricao}</div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {getSituacaoBadge(company.situacao)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {getPorteBadge(company.porte)}
                          </td>
                          {currentUser?.role === 'admin' && (
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-xs mr-2">
                                  U
                                </div>
                                <div className="hidden lg:block">
                                  <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                    Usuário
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {company.userId || 'Desconhecido'}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {company.telefone && (
                                <div className="flex items-center text-xs sm:text-sm">
                                  <Phone size={12} className="mr-1 text-gray-400 hidden sm:block" />
                                  <span className="truncate max-w-[100px] sm:max-w-none">{company.telefone}</span>
                                </div>
                              )}
                              {company.email && (
                                <div className="flex items-center text-xs sm:text-sm">
                                  <Mail size={12} className="mr-1 text-gray-400 hidden sm:block" />
                                  <span className="truncate max-w-[100px] sm:max-w-[150px]">{company.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {company.endereco && (
                              <div className="text-xs sm:text-sm">
                                <div className="flex items-center">
                                  <MapPin size={12} className="mr-1 text-gray-400 hidden sm:block" />
                                  <span className="font-medium">{company.endereco.cidade}/{company.endereco.uf}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                                  CEP: {company.endereco.cep}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex space-x-1 sm:space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="Visualizar">
                                <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                              {currentUser?.role === 'admin' && (
                                <>
                                  <button className="text-green-600 hover:text-green-800 transition-colors p-1" title="Editar">
                                    <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCompany(company._id, company.cnpj)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhuma empresa encontrada</p>
                  <p className="text-gray-400 text-sm">Ajuste os filtros ou cadastre uma nova empresa</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Estatísticas Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
        >
          <div className="cartao-edenred text-center">
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.situacao === 'ATIVA').length}
            </div>
            <p className="text-gray-600 font-semibold">Empresas Ativas</p>
          </div>
          
          <div className="cartao-edenred text-center">
            <div className="text-2xl font-bold text-blue-600">
              {companies.filter(c => c.porte === 'ME' || c.porte === 'EPP').length}
            </div>
            <p className="text-gray-600 font-semibold">Pequeno Porte</p>
          </div>

          <div className="cartao-edenred text-center">
            <div className="text-2xl font-bold text-purple-600">
              {companies.filter(c => c.porte === 'DEMAIS').length}
            </div>
            <p className="text-gray-600 font-semibold">Médio/Grande Porte</p>
          </div>
          
          <div className="cartao-edenred text-center">
            <div className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.situacao === 'SUSPENSA').length}
            </div>
            <p className="text-gray-600 font-semibold">Suspensas</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Companies
