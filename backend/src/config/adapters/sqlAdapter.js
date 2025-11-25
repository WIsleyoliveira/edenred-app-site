// Este arquivo define o AdaptadorSQL, uma classe que abstrai todas as operações com o banco PostgreSQL.
// Ele usa Sequelize como ORM para interagir com o banco, fornecendo métodos CRUD para usuários, empresas, consultas e paisagens.
// O adaptador implementa o padrão Adapter para permitir troca fácil entre diferentes tipos de banco (SQL vs NoSQL).

import { Sequelize, Op } from 'sequelize'; // Sequelize para ORM, Op para operadores de query
import bcryptjs from 'bcryptjs'; // Para hash e comparação de senhas

// Importa os modelos Sequelize para cada entidade do banco
import UserModel from '../../models/User.js'; // Modelo de Usuário
import CompanyModel from '../../models/Company.js'; // Modelo de Empresa
import ConsultationModel from '../../models/Consultation.js'; // Modelo de Consulta
import LandscapeModel from '../../models/Landscape.js'; // Modelo de Paisagem

// Classe principal do adaptador SQL
class AdaptadorSQL {
  constructor() {
    this.sequelize = null; // Instância do Sequelize (inicializada na conexão)
    this.isConnected = false; // Flag para verificar se está conectado
    this.models = {}; // Objeto para armazenar os modelos inicializados
  }

  // Método para conectar ao banco PostgreSQL
  async connect() {
    try {
      if (this.isConnected) return true; // Se já conectado, retorna true

      // Cria instância do Sequelize com configurações do PostgreSQL
      this.sequelize = new Sequelize(
        process.env.DB_NAME || 'cnpj_consultation', // Nome do banco
        process.env.DB_USER || 'postgres', // Usuário
        process.env.DB_PASSWORD || 'password', // Senha
        {
          host: process.env.DB_HOST || 'localhost', // Host
          port: process.env.DB_PORT || 5432, // Porta padrão do PostgreSQL
          dialect: 'postgres', // Dialeto PostgreSQL
          logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log apenas em dev
          pool: { // Pool de conexões para performance
            max: 5, // Máx 5 conexões
            min: 0, // Mín 0 ociosas
            acquire: 30000, // Timeout para adquirir conexão
            idle: 10000 // Timeout para conexão ociosa
          }
        }
      );

      // Inicializa os modelos Sequelize passando a instância do sequelize
      this.models.User = UserModel(this.sequelize); // Modelo User
      this.models.Company = CompanyModel(this.sequelize); // Modelo Company
      this.models.Consultation = ConsultationModel(this.sequelize); // Modelo Consultation
      this.models.Landscape = LandscapeModel(this.sequelize); // Modelo Landscape

      // Configura as associações (relacionamentos) entre os modelos
      this.setupAssociations();

      // Testa a conexão com o banco
      await this.sequelize.authenticate();
      console.log('✅ PostgreSQL conectado');

      // Sincroniza os modelos com o banco (cria/altera tabelas)
      await this.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
      console.log('✅ Tabelas sincronizadas');

      this.isConnected = true; // Marca como conectado
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar PostgreSQL:', error);
      throw error; // Lança erro para tratamento superior
    }
  }

  // Método para configurar as associações (relacionamentos) entre os modelos
  setupAssociations() {
    const { User, Company, Consultation, Landscape } = this.models;

    // Relacionamento User -> Company (1:N): Um usuário pode adicionar várias empresas
    User.hasMany(Company, { foreignKey: 'addedBy', as: 'companies' }); // User tem muitas Companies
    Company.belongsTo(User, { foreignKey: 'addedBy', as: 'user' }); // Company pertence a um User

    // Relacionamento User -> Consultation (1:N): Um usuário pode fazer várias consultas
    User.hasMany(Consultation, { foreignKey: 'userId', as: 'consultations' }); // User tem muitas Consultations
    Consultation.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Consultation pertence a um User

    // Relacionamento Company -> Consultation (1:N): Uma empresa pode ter várias consultas
    Company.hasMany(Consultation, { foreignKey: 'companyId', as: 'consultations' }); // Company tem muitas Consultations
    Consultation.belongsTo(Company, { foreignKey: 'companyId', as: 'company' }); // Consultation pertence a uma Company

    // Relacionamento User -> Landscape (1:N): Um usuário pode fazer upload de várias paisagens
    User.hasMany(Landscape, { foreignKey: 'uploadedBy', as: 'landscapes' }); // User tem muitas Landscapes
    Landscape.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' }); // Landscape pertence a um User
  }

  // Método para desconectar do banco
  async disconnect() {
    if (this.isConnected && this.sequelize) {
      await this.sequelize.close(); // Fecha a conexão Sequelize
      this.isConnected = false; // Marca como desconectado
      console.log('🔒 PostgreSQL desconectado');
    }
  }

  // Método para verificar se a conexão está saudável
  async healthCheck() {
    try {
      if (!this.isConnected) return false; // Se não conectado, retorna false
      await this.sequelize.authenticate(); // Testa a conexão
      return true; // Conexão saudável
    } catch (error) {
      return false; // Conexão com problema
    }
  }

  // =================== MÉTODOS DE USUÁRIO ===================

  // Cria um novo usuário no banco
  async createUser(userData) {
    const user = await this.models.User.create(userData); // Cria usuário com dados fornecidos
    return user.toJSON(); // Retorna dados do usuário criado (sem senha devido ao hook toJSON)
  }

  // Busca usuário por ID
  async findUserById(id) {
    const user = await this.models.User.findByPk(id); // findByPk = find by primary key
    return user ? user.toJSON() : null; // Retorna usuário ou null se não encontrado
  }

  // Busca usuário por email (usado para login)
  async findUserByEmail(email) {
    const user = await this.models.User.findOne({ where: { email } }); // Busca única por email
    return user ? user.toJSON() : null;
  }

  // Atualiza dados de um usuário
  async updateUser(id, updateData) {
    const [affectedRows] = await this.models.User.update(updateData, { where: { id } }); // Atualiza e retorna linhas afetadas
    if (affectedRows === 0) return null; // Se nenhuma linha afetada, usuário não existe
    const user = await this.models.User.findByPk(id); // Busca usuário atualizado
    return user ? user.toJSON() : null;
  }

  // "Deleta" usuário (soft delete - marca como inativo)
  async deleteUser(id) {
    const affectedRows = await this.models.User.update(
      { isActive: false }, // Marca como inativo em vez de deletar fisicamente
      { where: { id } }
    );
    return affectedRows > 0; // Retorna true se atualizado com sucesso
  }

  // Busca usuário por ID incluindo senha (para operações de autenticação)
  async findUserByIdWithPassword(id) {
    const user = await this.models.User.findByPk(id, {
      attributes: { include: ['password'] } // Inclui senha na busca
    });
    return user ? user.toJSON() : null;
  }

  // =================== MÉTODOS DE EMPRESA ===================

  // Cria uma nova empresa no banco
  async createCompany(companyData) {
    const company = await this.models.Company.create(companyData); // Cria empresa com dados fornecidos
    return company.toJSON(); // Retorna dados da empresa criada
  }

  // Busca empresa por CNPJ (único por empresa)
  async findCompanyByCNPJ(cnpj) {
    const company = await this.models.Company.findOne({ where: { cnpj } }); // Busca única por CNPJ
    return company ? company.toJSON() : null;
  }

  // Busca empresas de um usuário com paginação e filtros
  async findCompaniesByUser(userId, filters = {}) {
    const { page = 1, limit = 10, search, situacao } = filters; // Parâmetros de paginação e filtro
    const offset = (page - 1) * limit; // Calcula offset para paginação

    const where = { addedBy: userId }; // Filtro base: empresas do usuário
    if (situacao) where.situacao = situacao; // Filtro opcional por situação (ATIVA, etc.)

    // Adiciona busca por texto se fornecido (case-insensitive)
    if (search) {
      where[Op.or] = [ // Operador OR para buscar em múltiplos campos
        { razaoSocial: { [Op.iLike]: `%${search}%` } }, // iLike = case-insensitive LIKE
        { nomeFantasia: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Busca com contagem total para paginação
    const companies = await this.models.Company.findAndCountAll({
      where,
      limit, // Limite de resultados por página
      offset, // Deslocamento para paginação
      order: [['createdAt', 'DESC']], // Ordena por data de criação (mais recente primeiro)
      include: [{
        model: this.models.User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    // Retorna dados paginados
    return {
      data: companies.rows.map(c => c.toJSON()), // Lista de empresas
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(companies.count / limit), // Total de páginas
        total: companies.count, // Total de registros
        hasNext: page * limit < companies.count, // Tem próxima página?
        hasPrev: page > 1 // Tem página anterior?
      }
    };
  }

  // Busca todas as empresas (para admin) com paginação e filtros
  async findAllCompanies(filters = {}) {
    const { page = 1, limit = 10, search, situacao } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (situacao) where.situacao = situacao;

    if (search) {
      where[Op.or] = [
        { razaoSocial: { [Op.iLike]: `%${search}%` } },
        { nomeFantasia: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const companies = await this.models.Company.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: this.models.User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    return {
      data: companies.rows.map(c => c.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(companies.count / limit),
        total: companies.count,
        hasNext: page * limit < companies.count,
        hasPrev: page > 1
      }
    };
  }

  // Atualiza dados de uma empresa
  async updateCompany(id, updateData) {
    const [affectedRows] = await this.models.Company.update(updateData, { where: { id } });
    if (affectedRows === 0) return null; // Empresa não encontrada
    const company = await this.models.Company.findByPk(id); // Busca empresa atualizada
    return company ? company.toJSON() : null;
  }

  // MÉTODOS DE CONSULTA
  async createConsultation(consultationData) {
    const consultation = await this.models.Consultation.create(consultationData);
    return consultation.toJSON();
  }

  async findConsultationById(id) {
    const consultation = await this.models.Consultation.findByPk(id);
    return consultation ? consultation.toJSON() : null;
  }

  async findConsultationsByUser(userId, filters = {}) {
    const { page = 1, limit = 10, status, favorite, cnpj, produto, createdAfter } = filters;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;
    if (favorite === 'true') where.isFavorite = true;
    if (cnpj) where.cnpj = cnpj;
    if (produto) where.produto = produto;
    if (createdAfter) where.createdAt = { [Op.gte]: createdAfter };

    const consultations = await this.models.Consultation.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: this.models.Company,
        as: 'company',
        attributes: ['razaoSocial', 'nomeFantasia', 'situacao']
      }, {
        model: this.models.User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    return {
      data: consultations.rows.map(c => c.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(consultations.count / limit),
        total: consultations.count,
        hasNext: page * limit < consultations.count,
        hasPrev: page > 1
      }
    };
  }

  // Busca todas as consultas (para admin)
  async findAllConsultations(filters = {}) {
    const { page = 1, limit = 10, status, favorite, cnpj, produto, createdAfter } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (favorite === 'true') where.isFavorite = true;
    if (cnpj) where.cnpj = cnpj;
    if (produto) where.produto = produto;
    if (createdAfter) where.createdAt = { [Op.gte]: createdAfter };

    const consultations = await this.models.Consultation.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: this.models.Company,
        as: 'company',
        attributes: ['razaoSocial', 'nomeFantasia', 'situacao']
      }, {
        model: this.models.User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    return {
      data: consultations.rows.map(c => c.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(consultations.count / limit),
        total: consultations.count,
        hasNext: page * limit < consultations.count,
        hasPrev: page > 1
      }
    };
  }

  // Busca a ultima consulta bem-sucedida para um dado CNPJ e produto desde uma data
  async findLatestConsultationByCNPJAndProductSince(cnpj, produto, sinceDate) {
    const where = { cnpj, produto, status: 'SUCCESS' };
    if (sinceDate) where.createdAt = { [Op.gte]: sinceDate };

    const consultation = await this.models.Consultation.findOne({
      where,
      order: [['createdAt', 'DESC']]
    });

    return consultation ? consultation.toJSON() : null;
  }

  async updateConsultation(id, updateData) {
    const [affectedRows] = await this.models.Consultation.update(updateData, { where: { id } });
    if (affectedRows === 0) return null;
    const consultation = await this.models.Consultation.findByPk(id);
    return consultation ? consultation.toJSON() : null;
  }

  async deleteConsultation(id) {
    const affectedRows = await this.models.Consultation.destroy({ where: { id } });
    return affectedRows > 0;
  }

  async getConsultationStats(userId) {
    return await this.models.Consultation.getUserStats(userId);
  }

  // MÉTODOS DE PAISAGEM
  async createLandscape(landscapeData) {
    const landscape = await this.models.Landscape.create(landscapeData);
    return landscape.toJSON();
  }

  async findLandscapes(filters = {}) {
    const { page = 1, limit = 10, category, featured, isPublic = true } = filters;
    const offset = (page - 1) * limit;

    const where = { isPublic, status: 'active' };
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;

    const landscapes = await this.models.Landscape.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: this.models.User,
        as: 'uploader',
        attributes: ['name', 'avatar']
      }]
    });

    return {
      data: landscapes.rows.map(l => l.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(landscapes.count / limit),
        total: landscapes.count,
        hasNext: page * limit < landscapes.count,
        hasPrev: page > 1
      }
    };
  }

  async findLandscapesByUser(userId, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const landscapes = await this.models.Landscape.findAndCountAll({
      where: { uploadedBy: userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      data: landscapes.rows.map(l => l.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(landscapes.count / limit),
        total: landscapes.count,
        hasNext: page * limit < landscapes.count,
        hasPrev: page > 1
      }
    };
  }

  async updateLandscape(id, updateData) {
    const [affectedRows] = await this.models.Landscape.update(updateData, { where: { id } });
    if (affectedRows === 0) return null;
    const landscape = await this.models.Landscape.findByPk(id);
    return landscape ? landscape.toJSON() : null;
  }

  // Autenticar usuário
  async autenticarUsuario(email, password) {
    const user = await this.models.User.findOne({
      where: { email, isActive: true }, // Apenas usuários ativos podem fazer login
      attributes: { include: ['password'] }
    });

    if (!user) return null;

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) return null;

    const { password: _, ...userSafe } = user.toJSON();
    return userSafe;
  }
}

// Wrappers em PT-BR para compatibilidade com AdaptadorBancoDados
AdaptadorSQL.prototype.conectar = AdaptadorSQL.prototype.connect;
AdaptadorSQL.prototype.desconectar = AdaptadorSQL.prototype.disconnect;
AdaptadorSQL.prototype.verificarSaude = AdaptadorSQL.prototype.healthCheck;
AdaptadorSQL.prototype.criarUsuario = AdaptadorSQL.prototype.createUser;
AdaptadorSQL.prototype.buscarUsuarioPorId = AdaptadorSQL.prototype.findUserById;
AdaptadorSQL.prototype.buscarUsuarioPorEmail = AdaptadorSQL.prototype.findUserByEmail;
AdaptadorSQL.prototype.atualizarUsuario = AdaptadorSQL.prototype.updateUser;
AdaptadorSQL.prototype.deletarUsuario = AdaptadorSQL.prototype.deleteUser;
AdaptadorSQL.prototype.buscarUsuarioPorIdComSenha = AdaptadorSQL.prototype.findUserByIdWithPassword;
AdaptadorSQL.prototype.criarEmpresa = AdaptadorSQL.prototype.createCompany;
AdaptadorSQL.prototype.buscarEmpresaPorCNPJ = AdaptadorSQL.prototype.findCompanyByCNPJ;
AdaptadorSQL.prototype.buscarEmpresasPorUsuario = AdaptadorSQL.prototype.findCompaniesByUser;
AdaptadorSQL.prototype.buscarTodasEmpresas = AdaptadorSQL.prototype.findAllCompanies;
AdaptadorSQL.prototype.atualizarEmpresa = AdaptadorSQL.prototype.updateCompany;
AdaptadorSQL.prototype.criarConsulta = AdaptadorSQL.prototype.createConsultation;
AdaptadorSQL.prototype.buscarConsultaPorId = AdaptadorSQL.prototype.findConsultationById;
AdaptadorSQL.prototype.buscarConsultasPorUsuario = AdaptadorSQL.prototype.findConsultationsByUser;
AdaptadorSQL.prototype.buscarTodasConsultas = AdaptadorSQL.prototype.findAllConsultations;
AdaptadorSQL.prototype.buscarConsultasPorCNPJProduto = AdaptadorSQL.prototype.findLatestConsultationByCNPJAndProductSince;
AdaptadorSQL.prototype.atualizarConsulta = AdaptadorSQL.prototype.updateConsultation;
AdaptadorSQL.prototype.excluirConsulta = AdaptadorSQL.prototype.deleteConsultation;
AdaptadorSQL.prototype.obterEstatisticasConsulta = AdaptadorSQL.prototype.getConsultationStats;
AdaptadorSQL.prototype.criarPaisagem = AdaptadorSQL.prototype.createLandscape;
AdaptadorSQL.prototype.buscarPaisagens = AdaptadorSQL.prototype.findLandscapes;
AdaptadorSQL.prototype.buscarPaisagensPorUsuario = AdaptadorSQL.prototype.findLandscapesByUser;
AdaptadorSQL.prototype.atualizarPaisagem = AdaptadorSQL.prototype.updateLandscape;

export default AdaptadorSQL;
