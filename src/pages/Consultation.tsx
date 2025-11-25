import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Search, Building2, CheckCircle, FileText, Users, MapPin, Phone, BarChart3 } from 'lucide-react'
import { apiService } from '../services/apiService'
import type { Company } from '../types/global'
import toast from 'react-hot-toast'

interface FormData {
  cnpj: string
  produto: string
  quantidadeFuncionarios: string
  maisInformacoes: boolean
  observacoes: string
  razaoSocial?: string
  telefone?: string
  endereco?: string
}

const Consultation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    cnpj: '',
    produto: '',
    quantidadeFuncionarios: '',
    maisInformacoes: false,
    observacoes: ''
  })
  const [companyData, setCompanyData] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)

  const totalSteps = 5

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '')
    return numbers.length === 14
  }

  const searchCompany = async (cnpj: string) => {
    setLoading(true)
    try {
      const cleanCNPJ = cnpj.replace(/\D/g, '')

      // Tentar consultar via API do backend
      const response = await apiService.consultCNPJ(cleanCNPJ, formData.produto)

      if (response.success && response.data.company) {
        const company = response.data.company
        setCompanyData(company)
        setFormData(prev => ({
          ...prev,
          razaoSocial: company.razaoSocial,
          telefone: company.telefone,
          endereco: company.endereco ?
            `${company.endereco.logradouro}, ${company.endereco.numero} - ${company.endereco.cidade}/${company.endereco.uf}` :
            'Endereço não informado'
        }))

        // A consulta já foi criada pelo backend
        setConsultationId(response.data.consultation._id)
        setCurrentStep(2)
        toast.success('Empresa encontrada com sucesso!')
      } else {
        toast.error('CNPJ não encontrado ou erro na consulta')
      }
    } catch (error: any) {
      console.error('Erro ao consultar:', error)

      // Verificar se é erro de CNPJ recentemente consultado
      if (error.code === 'CNPJ_RECENTLY_CONSULTED') {
        const nextDate = new Date(error.details?.nextAvailableDate)
        toast.error(`Este CNPJ já foi consultado recentemente. Próxima consulta disponível em: ${nextDate.toLocaleDateString('pt-BR')}`)
      } else {
        toast.error(error.message || 'Erro ao consultar CNPJ')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateConsultation = async (step: number, completed: boolean = false) => {
    if (!consultationId) return

    try {
      // Como não temos um endpoint de update específico para consultas,
      // vamos apenas registrar o progresso localmente por enquanto
      // TODO: Implementar endpoint de atualização de consulta no backend
      console.log('Atualizando consulta:', {
        id: consultationId,
        step,
        completed,
        formData,
        status: completed ? 'CONCLUIDA' : 'EM_ANDAMENTO'
      })
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateCNPJ(formData.cnpj)) {
        toast.error('Por favor, insira um CNPJ válido com 14 dígitos')
        return
      }
      await searchCompany(formData.cnpj)
    } else if (currentStep === 2) {
      if (!formData.produto) {
        toast.error('Por favor, selecione um produto')
        return
      }
      setCurrentStep(3)
      await updateConsultation(3)
    } else if (currentStep === 3) {
      if (!formData.quantidadeFuncionarios) {
        toast.error('Por favor, selecione o número de funcionários')
        return
      }
      setCurrentStep(4)
      await updateConsultation(4)
    } else if (currentStep === 4) {
      setCurrentStep(5)
      await updateConsultation(5, true)
      toast.success('Consulta finalizada com sucesso!')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="animacao-entrada"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-3xl mb-6">
                <Search className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="titulo-principalcnpj text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
                Consulta CNPJ
              </h2>
              <p className="texto-elegantecnpj text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Bem-vindo ao Sistema Edenred Brasil. Vamos iniciar sua consulta hoje.
              </p>
            </div>

            <div className="cartao-edenredr max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="titulo-secundarior text-2xl font-semibold mb-6">Olá, Consultor Edenred</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <FileText className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-red-700">Acompanhar Indicações</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <Users className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-red-700">Indicações em Massa</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <Building2 className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-red-700">Consultar Cliente</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    CNPJ para indicar
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    className="campo-edenred"
                    maxLength={18}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Qual produto você vai indicar?
                  </label>
                  <select 
                    value={formData.produto}
                    onChange={(e) => handleInputChange('produto', e.target.value)}
                    className="campo-edenred"
                  >
                    <option value="">Selecione o produto...</option>
                    <option value="FLEET">Fleet - Gestão de Frotas</option>
                    <option value="TICKET_RESTAURANT">Ticket Restaurant - Alimentação</option>
                    <option value="PAY">Pay - Pagamentos Digitais</option>
                    <option value="ALIMENTA">Alimenta - Benefícios Alimentação</option>
                    <option value="ABASTECIMENTO">Abastecimento - Combustíveis</option>
                    <option value="OUTRAS">Outras Soluções</option>
                  </select>
                </div>

                {formData.produto && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      🎯 Produto Selecionado: {formData.produto}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {formData.produto === 'FLEET' && 'Solução completa para gestão de frotas e veículos corporativos.'}
                      {formData.produto === 'TICKET_RESTAURANT' && 'Benefícios de alimentação para colaboradores.'}
                      {formData.produto === 'PAY' && 'Soluções digitais de pagamento para empresas.'}
                      {formData.produto === 'ALIMENTA' && 'Benefícios de alimentação e refeição.'}
                      {formData.produto === 'ABASTECIMENTO' && 'Cartões para abastecimento e combustíveis.'}
                      {formData.produto === 'OUTRAS' && 'Outras soluções Edenred personalizadas.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="botao-edenred-primario text-lg px-12 py-4"
                >
                  {loading ? (
                    <>
                      <div className="carregamento-edenred mr-3"></div>
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-3" size={20} />
                      CONSULTAR
                    </>
                  )}
                </button>
              </div>

              {companyData && (
                <div className="text-center mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-700 font-semibold">✓ EMPRESA ENCONTRADA</p>
                  <p className="text-green-600 text-sm mt-1">→ Prosseguir para próxima etapa</p>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="animacao-entrada"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mb-6">
                <Building2 className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="titulo-principalcnpj text-4xl font-bold text-red-600 mb-4">
                Informações da Empresa
              </h2>
              <p className="texto-elegantej text-xl text-gray-600">
                Verificação e validação dos dados empresariais
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Configuração */}
              <div className="cartao-edenred-cnpj">
                <h3 className="titulo-secundario text-xl font-semibold mb-6 text-center">Configuração</h3>
                <div className="space-y-4">
                  <div>
                    <label className="blockr text-sm font-semibold text-gray-700 mb-2">CNPJ para indicar</label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      readOnly
                      className="campo-edenred bg-gray-50"
                    />
                  </div>
                  
                  <div className=" bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="blockrf text-gray-700 mb-4 font-medium">
                      Deseja copiar informações existentes do CRM?
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="radio" name="copy" className="mr-3 text-red-600" />
                        <span className="blockrf font-medium">Sim</span>
                      </label>
                      <button className="blockrf font-semibold underline block">
                        Selecionar sua empresa
                      </button>
                      <label className="flex items-center">
                        <input type="radio" name="copy" className="mr-3 text-red-600" defaultChecked />
                        <span className="blockrf font-medium">Não, continuar manualmente</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="botao-edenred-primario w-full"
                  >
                    CONTINUAR
                  </button>
                </div>
              </div>

              {/* Informações */}
              <div className="cartao-edenred-cnpj">
                <h3 className="titulo-secundario text-xl font-semibold mb-6 text-center">Informações</h3>
                <div className="space-y-4">
                  {companyData ? (
                    <>
                      <div>
                        <label className="blockr text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Building2 size={16} className="mr-2 text-red-600" />
                          RAZÃO SOCIAL
                        </label>
                        <p className="text font-medium text-gray-900">{companyData.razaoSocial}</p>
                      </div>
                      <div>
                        <label className="blockr text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <MapPin size={16} className="mr-2 text-red-600" />
                          ENDEREÇO
                        </label>
                        <p className="text text-gray-700">{formData.endereco}</p>
                      </div>
                      <div>
                        <label className="blockr text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Phone size={16} className="mr-2 text-red-600" />
                          TELEFONE
                        </label>
                        <p className="text text-gray-700">{companyData.telefone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="blockr text-sm font-semibold text-gray-700 mb-2">
                          SITUAÇÃO
                        </label>
                        <span className="badge-sucesso">{companyData.situacao}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="carregamento-edenred mx-auto mb-4"></div>
                      <p className="text-gray-500">Carregando informações...</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleNext}
                  className="botao-edenred-primario w-full mt-6"
                >
                  CONFIRMAR
                </button>
              </div>

              {/* Validação */}
              <div className="cartao-edenred-cnpj">
                <h3 className="titulo-secundario text-xl font-semibold mb-6 text-center">Validação</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.cnpj}
                    readOnly
                    className="campo-edenred bg-gray-50"
                  />
                  
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-sm text-gray-700 mb-4 font-medium">
                      Deseja copiar informações existentes do CRM?
                    </p>
                    <div className="bg-red-50 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm font-semibold">
                        ⚠️ Este CNPJ possui empresas indicadas no CRM
                      </p>
                    </div>
                    <label className="flex items-center">
                      <input type="radio" name="continue" className="mr-3 text-red-600" />
                      <span className="blockrf font-medium">Não, continuar manualmente</span>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="botao-edenred-primario w-full"
                  >
                    CONTINUAR
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="animacao-entrada"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mb-6">
                <Users className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="titulo-principal-info text-4xl font-bold text-red-600 mb-4">
                Informações Complementares
              </h2>
              <p className="texto-elegantej text-xl text-gray-600">
                Detalhes sobre quadro de funcionários e necessidades específicas
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="cartao-edenred-cnpj">
                <h3 className="titulo-secundarior text-xl font-semibold mb-8 text-center">Quadro de Funcionários</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ para indicar</label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      readOnly
                      className="campo-edenred bg-gray-50"
                    />
                  </div>
                  
                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <h4 className="font-semibold text-gray-900 mb-4">NÚMERO DE FUNCIONÁRIOS</h4>
                    <div className="space-y-3">
                      {['1-10', '11-50', '51-100', '101-500', '500+'].map((range) => (
                        <label key={range} className="blockg flex items-center text-black">
                          <input 
                            type="radio" 
                            name="funcionarios" 
                            value={range}
                            checked={formData.quantidadeFuncionarios === range}
                            onChange={(e) => handleInputChange('quantidadeFuncionarios', e.target.value)}
                            className="mr-3 text-red-600" 
                          />
                          <span className="blockg font-medium">{range} funcionários</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleNext}
                  className="botao-edenred-primario w-full mt-8"
                >
                  CONTINUAR
                </button>
              </div>

              <div className="cartao-edenred-cnpj">
                <h3 className="titulo-secundario text-xl font-semibold mb-8 text-center">Necessidades Específicas</h3>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      INFORMAÇÕES COMPLEMENTARES
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      (veículos, cartões, volume, etc.)
                    </p>
                    
                    <div className="space-y-3">
                      <label className="blockg flex items-center">
                        <input 
                          type="radio" 
                          name="maisInfo" 
                          value="sim"
                          checked={formData.maisInformacoes}
                          onChange={(e) => handleInputChange('maisInformacoes', true)}
                          className="blockg mr-3 text-blue-600" 
                        />
                        <span className="blockrf font-medium">Sim, tenho informações adicionais</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="maisInfo" 
                          value="nao"
                          checked={!formData.maisInformacoes}
                          onChange={(e) => handleInputChange('maisInformacoes', false)}
                          className="mr-3 text-blue-600" 
                        />
                        <span className="blockrf font-medium">Não, continuar sem detalhes</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                    // TODO: Implementar abertura do formulário detalhado por produto
                    toast('Funcionalidade em desenvolvimento', { icon: 'ℹ️' })
                  }}>
                    <p className="text-sm text-gray-600 text-center">
                      📋 ABRIR FORMULÁRIO DETALHADO POR PRODUTO
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleNext}
                  className="botao-edenred-secundario w-full mt-8"
                >
                  CONTINUAR
                </button>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="animacao-entrada"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mb-6">
                <FileText className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="titulo-principalcnpj text-4xl font-bold text-red-600 mb-4">
                Acompanhamento de Indicações
              </h2>
              <p className="texto-elegantej text-xl text-gray-600">
                Painel de controle dos processos em andamento
              </p>
            </div>

            <div className="cartao-edenred-cnpj max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl mb-6">
                  <h3 className="font-bold text-center text-lg">
                    🔍 FILTROS DISPONÍVEIS
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                    <div className="bg-white/20 rounded-lg p-2 text-center">NÚMERO</div>
                    <div className="bg-white/20 rounded-lg p-2 text-center">CNPJ</div>
                    <div className="bg-white/20 rounded-lg p-2 text-center">RAZÃO SOCIAL</div>
                    <div className="bg-white/20 rounded-lg p-2 text-center">PRODUTO</div>
                    <div className="bg-white/20 rounded-lg p-2 text-center">STATUS</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">DATA</th>
                        <th className="px-6 py-4 text-left font-semibold">NÚMERO</th>
                        <th className="px-6 py-4 text-left font-semibold">CNPJ</th>
                        <th className="px-6 py-4 text-left font-semibold">RAZÃO SOCIAL</th>
                        <th className="px-6 py-4 text-left font-semibold">PRODUTO</th>
                        <th className="px-6 py-4 text-left font-semibold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-red-50 transition-colors">
                        <td className="text-v px-6 py-4 font-medium">18/04/2024</td>
                        <td className="text-v px-6 py-4 font-bold text-red-600">001</td>
                        <td className="text-v px-6 py-4 font-mono">12.345.678/0001-90</td>
                        <td className="text-v px-6 py-4 font-semibold">ANTONIO DISTRIBUIÇÃO</td>
                        <td className="text-v px-6 py-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            FLEET
                          </span>
                        </td>
                        <td className="text-v px-6 py-4">
                          <span className="badge-em-andamento">EM NEGOCIAÇÃO</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-red-50 transition-colors">
                        <td className="text-v px-6 py-4 font-medium">17/01/2024</td>
                        <td className="text-v px-6 py-4 font-bold text-red-600">002</td>
                        <td className="text-v px-6 py-4 font-mono">98.765.432/0001-10</td>
                        <td className="text-v px-6 py-4 font-semibold">ELIANE SERVIÇOS</td>
                        <td className="text-v px-6 py-4">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                            TICKET RESTAURANT
                          </span>
                        </td>
                        <td className="text-v px-6 py-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                            EM PROCESSAMENTO
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-red-50 transition-colors">
                        <td className="text-v px-6 py-4 font-medium">23/02/2024</td>
                        <td className="text-v px-6 py-4 font-bold text-red-600">003</td>
                        <td className="text-v px-6 py-4 font-mono">11.222.333/0001-44</td>
                        <td className="text-v px-6 py-4 font-semibold">LEA CONSULTORIA</td>
                        <td className="text-v px-6 py-4">
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                            PAY
                          </span>
                        </td>
                        <td className="text-v px-6 py-4">
                          <span className="badge-sucesso">CONCLUÍDO E GANHO</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-red-50 transition-colors">
                        <td className="text-v px-6 py-4 font-medium">22/06/2024</td>
                        <td className="text-v px-6 py-4 font-bold text-red-600">004</td>
                        <td className="text-v px-6 py-4 font-mono">55.666.777/0001-88</td>
                        <td className="text-v px-6 py-4 font-semibold">ERIC INDÚSTRIAS</td>
                        <td className="text-v px-6 py-4">
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ALIMENTA
                          </span>
                        </td>
                        <td className="text-v px-6 py-4">
                          <span className="badge-erro">CONCLUÍDO E PERDIDO</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleNext}
                className="botao-edenred-primario text-lg px-12 py-4"
              >
                <CheckCircle className="mr-3" size={22} />
                Finalizar Consulta
              </button>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center animacao-entrada"
          >
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            
            <div>
              <h2 className="titulo-principal text-5xl font-bold text-green-600 mb-6">
                Consulta Finalizada!
              </h2>
              <p className="texto-elegante text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Sua consulta foi processada com sucesso e registrada no sistema Edenred Brasil.
              </p>
              
              {companyData && (
                <div className="cartao-edenred-cnpj max-w-3xl mx-auto mb-12">
                  <h3 className="titulo-secundarior text-2xl font-semibold mb-8">Resumo da Consulta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="text-left">
                        <p className="text text-sm text-gray-500 font-semibold">CNPJ</p>
                        <p className="text text-xl font-bold text-gray-900">{formatCNPJ(companyData.cnpj)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text text-sm text-gray-500 font-semibold">RAZÃO SOCIAL</p>
                        <p className="text text-xl font-bold text-gray-900">{companyData.razaoSocial}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className=" text-left">
                        <p className="text text-sm text-gray-500 font-semibold">SITUAÇÃO</p>
                        <span className="badge-sucesso text-lg">{companyData.situacao}</span>
                      </div>
                      <div className="text-left">
                        <p className="text text-sm text-gray-500 font-semibold">PORTE</p>
                        <p className="text text-xl font-bold text-gray-900">{companyData.porte}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle size={20} className="mr-2" />
                      <span className="font-semibold">Consulta registrada em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => {
                  setCurrentStep(1)
                  setFormData({
                    cnpj: '',
                    produto: '',
                    quantidadeFuncionarios: '',
                    maisInformacoes: false,
                    observacoes: ''
                  })
                  setCompanyData(null)
                  setConsultationId(null)
                }}
                className="botao-edenred-primario text-lg px-8 py-4"
              >
                <Search className="mr-3" size={20} />
                Nova Consulta
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="botao-edenred-secundario text-lg px-8 py-4"
              >
                <BarChart3 className="mr-3" size={20} />
                Ver Painel de Controle
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                🇧🇷 Consulta realizada na plataforma Edenred Brasil • Conforme LGPD
              </p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen consultation-section py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra de progresso brasileira */}
        {currentStep < 5 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-red-100 dark:border-red-900">
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Etapa {currentStep} de {totalSteps}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-red-100 dark:border-red-900">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {Math.round((currentStep / totalSteps) * 100)}% concluído
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-red-600 to-red-700 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navegação */}
        {currentStep > 1 && currentStep < 5 && (
          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrevious}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-red-600 transition-colors font-medium"
            >
              <ArrowLeft className="mr-2" size={20} />
              Anterior
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Consultation
