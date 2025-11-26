import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, BarChart3, Building2, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react'
import { usePlatformStats } from '../hooks/usePlatformStats'

const Inicio: React.FC = () => {
  const { stats, loading } = usePlatformStats(10000); // Atualiza a cada 10 segundos

  const features = [
    {
      icon: Search,
      title: 'Consulta CNPJ',
      description: 'Consulte dados de empresas de forma rápida e eficiente com nosso sistema inteligente',
      color: 'red'
    },
    {
      icon: BarChart3,
      title: 'Painel de Controle',
      description: 'Acompanhe seus indicadores e métricas em tempo real com análises aprofundadas',
      color: 'red'
    },
    {
      icon: Building2,
      title: 'Gestão de Empresas',
      description: 'Gerencie seu portfólio de empresas e prospects com ferramentas avançadas',
      color: 'red'
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento de Performance',
      description: 'Analise tendências e otimize seus processos comerciais',
      color: 'red'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Hero Section Edenred */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 dark:from-red-700 dark:via-red-800 dark:to-red-900 text-white py-24 overflow-hidden"
      >
        {/* Padrão de fundo brasileiro */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zM0 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S0 51.046 0 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-left"
              >
                <div className="mb-6">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    🇧🇷 Edenred Brasil
                  </span>
                </div>

                <h1 className="titulo-principal text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                  Sistema de
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    Consulta
                  </span>
                  <span className="titulo-principal text-4xl lg:text-5xl">Empresarial</span>
                </h1>

                <p className="texto-elegante text-xl lg:text-2xl mb-8 text-red-100 leading-relaxed">
                  Consulte, acompanhe e gerencie informações de empresas com nossa plataforma inteligente dedicada ao mercado brasileiro
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/consultation"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    <Search className="mr-3" size={22} />
                    Iniciar Consulta
                    <ArrowRight className="ml-3" size={22} />
                  </Link>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border-2 border-white/30"
                  >
                    <BarChart3 className="mr-3" size={22} />
                    Painel de Controle
                  </Link>
                </div>
              </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-red-100">Consultas Hoje</span>
                    <span className="text-2xl font-bold text-white">+{loading ? '...' : stats.consultasRealizadas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-100">Empresas Ativas</span>
                    <span className="text-2xl font-bold text-white">{loading ? '...' : stats.empresasCadastradas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-100">Processos em Andamento</span>
                    <span className="text-2xl font-bold text-white">{loading ? '...' : stats.processosAtivos}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center text-red-100">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">Última atualização: {new Date(stats.ultimaAtualizacao).toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Seção Estatísticas */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-white dark:bg-gray-800 performance-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="titulo-secundario text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Performance da Plataforma
            </h2>
            <p className="texto-elegantej text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubra as métricas principais da nossa plataforma Edenred Brasil
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Atualização em tempo real</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              variants={itemVariants} 
              className="cartao-edenred text-center group"
              key={stats.empresasCadastradas}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="carregamento-edenred mx-auto"></div>
                ) : (
                  <motion.span
                    key={stats.empresasCadastradas}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stats.empresasCadastradas.toLocaleString('pt-BR')}
                  </motion.span>
                )}
              </h3>
              <p className="texto-eleganter font-semibold">Empresas Cadastradas</p>
              <p className="text-sm text-gray-500 mt-2">Base de dados brasileira</p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="cartao-edenred text-center group"
              key={stats.consultasRealizadas}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="carregamento-edenred mx-auto"></div>
                ) : (
                  <motion.span
                    key={stats.consultasRealizadas}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stats.consultasRealizadas.toLocaleString('pt-BR')}
                  </motion.span>
                )}
              </h3>
              <p className="texto-eleganter font-semibold">Consultas Realizadas</p>
              <p className="text-sm text-gray-500 mt-2">Pesquisas efetuadas</p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="cartao-edenred text-center group"
              key={stats.processosAtivos}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="carregamento-edenred mx-auto"></div>
                ) : (
                  <motion.span
                    key={stats.processosAtivos}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stats.processosAtivos.toLocaleString('pt-BR')}
                  </motion.span>
                )}
              </h3>
              <p className="texto-eleganter font-semibold">Processos Ativos</p>
              <p className="text-sm text-gray-500 mt-2">Em andamento</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Seção Funcionalidades */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 performance-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="titulo-secundario text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Funcionalidades Avançadas
            </h2>
            <p className="texto-elegantej text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ferramentas poderosas desenvolvidas especialmente para as necessidades do mercado brasileiro Edenred
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="cartao-edenred group cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="titulo-secundariore text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="texto-eleganter leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-red-600 font-semibold text-sm group-hover:text-red-700 transition-colors">
                      Saiba mais →
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Seção CTA Brasileira */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="mb-8">
            <Award className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
          </motion.div>

          <motion.h2 variants={itemVariants} className="titulo-principal text-4xl md:text-5xl font-bold mb-6 text-white">
            Pronto para Começar?
          </motion.h2>

          <motion.p variants={itemVariants} className="texto-elegante text-xl mb-10 text-red-100 max-w-2xl mx-auto">
            Junte-se às equipes Edenred Brasil que já utilizam nossa plataforma para otimizar seus processos comerciais
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/consultation"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Search className="mr-3" size={22} />
              Iniciar uma Consulta
              <ArrowRight className="ml-3" size={22} />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-10 py-5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border-2 border-white/30"
            >
              <BarChart3 className="mr-3" size={22} />
              Acessar o Painel
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/20">
            <p className="text-red-100 text-sm">
              🇧🇷 Plataforma oficial Edenred Brasil • Segura e conforme LGPD
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}

export default Inicio
