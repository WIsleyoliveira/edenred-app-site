// Este arquivo implementa o padrão Adapter para abstrair o acesso ao banco de dados.
// Permite trocar facilmente entre diferentes tipos de bancos (SQL, NoSQL, etc.) sem alterar o código da aplicação.
// Atualmente usa PostgreSQL via Sequelize, mas pode ser facilmente adaptado para outros bancos.

import dotenv from 'dotenv'; // Carrega variáveis de ambiente
import bcryptjs from 'bcryptjs'; // Para hash de senhas
dotenv.config();

// Importar adaptadores específicos para cada tipo de banco
import AdaptadorSQL from './adapters/sqlAdapter.js'; // Adaptador para bancos SQL (PostgreSQL)

class AdaptadorBancoDados {
  constructor() {
    this.adaptadorAtual = null; // Instância do adaptador concreto (SQL, NoSQL, etc.)
    this.tipoAdaptador = 'sql'; // Tipo atual do adaptador ('sql' para PostgreSQL)

    this.inicializar(); // Inicializa o adaptador
  }

  // Inicializa o adaptador baseado no tipo configurado
  inicializar() {
    this.adaptadorAtual = new AdaptadorSQL(); // Cria instância do adaptador SQL
    console.log(`🗄️ Usando banco de dados: ${this.tipoAdaptador.toUpperCase()}`); // Log do tipo de banco usado
  }
  
  // =================== MÉTODOS DE USUÁRIO ===================
  // Estes métodos delegam as operações para o adaptador concreto (SQL)

  // Cria um novo usuário no banco de dados
  async criarUsuario(dadosUsuario) {
    return await this.adaptadorAtual.criarUsuario(dadosUsuario);
  }

  // Busca usuário por ID único
  async buscarUsuarioPorId(id) {
    return await this.adaptadorAtual.buscarUsuarioPorId(id);
  }

  // Busca usuário por email (usado no login)
  async buscarUsuarioPorEmail(email) {
    return await this.adaptadorAtual.buscarUsuarioPorEmail(email);
  }

  // Atualiza dados de um usuário existente
  async atualizarUsuario(id, dadosAtualizacao) {
    return await this.adaptadorAtual.atualizarUsuario(id, dadosAtualizacao);
  }

  // Remove um usuário do banco (soft delete ou hard delete)
  async deletarUsuario(id) {
    return await this.adaptadorAtual.deletarUsuario(id);
  }

  // Busca usuário por ID incluindo senha (para operações de autenticação)
  async buscarUsuarioPorIdComSenha(id) {
    return await this.adaptadorAtual.buscarUsuarioPorIdComSenha(id);
  }
  
  // =================== MÉTODOS DE EMPRESA ===================
  // Gerenciam dados das empresas consultadas via CNPJ

  // Cria uma nova empresa no banco (dados vindos da API da Receita Federal)
  async criarEmpresa(dadosEmpresa) {
    return await this.adaptadorAtual.criarEmpresa(dadosEmpresa);
  }

  // Busca empresa por CNPJ (chave única)
  async buscarEmpresaPorCNPJ(cnpj) {
    return await this.adaptadorAtual.buscarEmpresaPorCNPJ(cnpj);
  }

  // Lista empresas adicionadas por um usuário específico
  async buscarEmpresasPorUsuario(idUsuario, filtros = {}) {
    return await this.adaptadorAtual.buscarEmpresasPorUsuario(idUsuario, filtros);
  }

  // Atualiza dados de uma empresa (ex: quando refaz consulta na API)
  async atualizarEmpresa(id, dadosAtualizacao) {
    return await this.adaptadorAtual.atualizarEmpresa(id, dadosAtualizacao);
  }
  
  // =================== MÉTODOS DE CONSULTA ===================
  // Gerenciam o histórico de consultas CNPJ feitas pelos usuários

  // Registra uma nova consulta CNPJ no histórico
  async criarConsulta(dadosConsulta) {
    return await this.adaptadorAtual.criarConsulta(dadosConsulta);
  }

  // Busca a última consulta bem-sucedida para um CNPJ e produto desde uma data
  async buscarConsultasPorCNPJProduto(cnpj, produto, sinceDate) {
    if (this.adaptadorAtual && typeof this.adaptadorAtual.buscarConsultasPorCNPJProduto === 'function') {
      return await this.adaptadorAtual.buscarConsultasPorCNPJProduto(cnpj, produto, sinceDate);
    }
    return null;
  }

  // Busca uma consulta específica por ID
  async buscarConsultaPorId(id) {
    return await this.adaptadorAtual.buscarConsultaPorId(id);
  }

  // Lista consultas feitas por um usuário (com filtros opcionais)
  async buscarConsultasPorUsuario(idUsuario, filtros = {}) {
    return await this.adaptadorAtual.buscarConsultasPorUsuario(idUsuario, filtros);
  }

  // Lista todas as consultas (para admin) com filtros opcionais
  async buscarTodasConsultas(filtros = {}) {
    return await this.adaptadorAtual.buscarTodasConsultas(filtros);
  }

  // Lista todas as empresas (para admin) com filtros opcionais
  async buscarTodasEmpresas(filtros = {}) {
    return await this.adaptadorAtual.buscarTodasEmpresas(filtros);
  }

  // Atualiza status de uma consulta (PENDING -> SUCCESS/ERROR)
  async atualizarConsulta(id, dadosAtualizacao) {
    return await this.adaptadorAtual.atualizarConsulta(id, dadosAtualizacao);
  }

  // Exclui uma consulta do banco de dados
  async excluirConsulta(id) {
    return await this.adaptadorAtual.excluirConsulta(id);
  }

  // Calcula estatísticas das consultas de um usuário (total, sucesso, falhas, etc.)
  async obterEstatisticasConsulta(idUsuario) {
    return await this.adaptadorAtual.obterEstatisticasConsulta(idUsuario);
  }
  
  // =================== MÉTODOS DE PAISAGEM ===================
  // Gerenciam imagens/paisagens enviadas pelos usuários (funcionalidade adicional)

  // Salva uma nova imagem/paisagem no banco
  async criarPaisagem(dadosPaisagem) {
    return await this.adaptadorAtual.criarPaisagem(dadosPaisagem);
  }

  // Lista paisagens com filtros (categoria, usuário, etc.)
  async buscarPaisagens(filtros = {}) {
    return await this.adaptadorAtual.buscarPaisagens(filtros);
  }

  // Lista paisagens enviadas por um usuário específico
  async buscarPaisagensPorUsuario(idUsuario, filtros = {}) {
    return await this.adaptadorAtual.buscarPaisagensPorUsuario(idUsuario, filtros);
  }

  // Atualiza dados de uma paisagem (likes, comentários, etc.)
  async atualizarPaisagem(id, dadosAtualizacao) {
    return await this.adaptadorAtual.atualizarPaisagem(id, dadosAtualizacao);
  }
  
  // =================== MÉTODOS DE CONEXÃO ===================
  // Gerenciam o ciclo de vida da conexão com o banco

  // Estabelece conexão com o banco de dados
  async conectar() {
    return await this.adaptadorAtual.conectar();
  }

  // Fecha conexão com o banco de dados
  async desconectar() {
    return await this.adaptadorAtual.desconectar();
  }

  // =================== VERIFICAÇÃO DE SAÚDE ===================
  // Verifica se o banco está funcionando corretamente

  // Testa conectividade e saúde geral do banco
  async verificarSaude() {
    return await this.adaptadorAtual.verificarSaude();
  }

  // =================== AUTENTICAÇÃO ===================
  // Método especial para login de usuários

  // Autentica usuário comparando email e senha hash
  // Primeiro tenta usar método do adaptador, senão faz fallback manual
  async autenticarUsuario(email, password) {
    // Tenta usar método específico do adaptador (mais eficiente)
    if (this.adaptadorAtual && typeof this.adaptadorAtual.autenticarUsuario === 'function') {
      return await this.adaptadorAtual.autenticarUsuario(email, password);
    }

    // Fallback: busca usuário e compara senha manualmente
    const user = await this.buscarUsuarioPorEmail(email);
    if (!user) return null; // Usuário não encontrado

    // Verifica se senha existe e é válida
    if (user.password) {
      const isValid = await bcryptjs.compare(password, user.password);
      if (!isValid) return null; // Senha incorreta

      // Remove senha do retorno por segurança
      const { password: pw, ...userSafe } = user;
      return userSafe;
    }

    return null; // Sem senha cadastrada
  }
}

// =================== SINGLETON ===================
// Garante que existe apenas uma instância do adaptador em toda a aplicação
// Isso evita múltiplas conexões desnecessárias com o banco

let instanciaBanco = null; // Instância única armazenada

// Função para obter a instância singleton do adaptador
export const obterAdaptadorBanco = () => {
  if (!instanciaBanco) {
    instanciaBanco = new AdaptadorBancoDados(); // Cria apenas na primeira chamada
  }
  return instanciaBanco; // Retorna sempre a mesma instância
};

export default AdaptadorBancoDados;
