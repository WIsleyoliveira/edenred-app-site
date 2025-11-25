// Este arquivo define o modelo Company (Empresa) para o Sequelize.
// Representa empresas brasileiras consultadas na Receita Federal, armazenando dados como CNPJ, razão social, endereço, etc.

import { DataTypes } from 'sequelize'; // Tipos de dados do Sequelize

// Função que cria e retorna o modelo Company
const CompanyModel = (sequelize) => {
  // Define o modelo Company com todas as colunas da tabela
  const Company = sequelize.define('Company', {
    // Chave primária auto-incrementada
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // CNPJ da empresa (formato: XX.XXX.XXX/XXXX-XX)
    cnpj: {
      type: DataTypes.STRING(18), // Máximo 18 caracteres (com pontos e barras)
      allowNull: false, // Obrigatório
      unique: true, // CNPJ deve ser único
      validate: {
        notEmpty: { msg: 'CNPJ é obrigatório' },
        is: { // Validação de formato usando regex
          args: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
          msg: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
        }
      }
    },
    // Razão social (nome oficial da empresa)
    razaoSocial: {
      type: DataTypes.STRING(200), // Até 200 caracteres
      allowNull: false, // Obrigatório
      validate: {
        notEmpty: { msg: 'Razão social é obrigatória' },
        len: [1, 200]
      }
    },
    // Nome fantasia (nome comercial)
    nomeFantasia: {
      type: DataTypes.STRING(200),
      allowNull: true // Opcional
    },
    // Natureza jurídica (tipo de empresa: LTDA, S.A., etc.)
    naturezaJuridica: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Situação cadastral (ATIVA, BAIXADA, SUSPENSA, INAPTA)
    situacao: {
      type: DataTypes.ENUM('ATIVA', 'BAIXADA', 'SUSPENSA', 'INAPTA'),
      defaultValue: 'ATIVA' // Padrão: ativa
    },
    // Data de abertura da empresa
    dataAbertura: {
      type: DataTypes.DATE, // Data completa
      allowNull: true
    },
    // Capital social (valor em reais)
    capitalSocial: {
      type: DataTypes.DECIMAL(15, 2), // Até 15 dígitos, 2 casas decimais
      allowNull: true,
      validate: {
        min: 0 // Não pode ser negativo
      }
    },
    // Código CNAE principal (Classificação Nacional de Atividades Econômicas)
    cnaePrincipal: {
      type: DataTypes.STRING(10), // Código como "6201-5/00"
      allowNull: true
    },
    // Descrição do CNAE principal
    cnaePrincipalDescricao: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    // Porte da empresa (MEI, ME, EPP, MEDIO, GRANDE)
    porte: {
      type: DataTypes.ENUM('MEI', 'ME', 'EPP', 'MEDIO', 'GRANDE'),
      defaultValue: 'ME' // Padrão: Micro Empresa
    },
    // Regime tributário (SIMPLES, PRESUMIDO, REAL)
    regimeTributario: {
      type: DataTypes.ENUM('SIMPLES', 'PRESUMIDO', 'REAL'),
      defaultValue: 'SIMPLES' // Padrão: Simples Nacional
    },
    // Endereço - Rua/Logradouro
    addressStreet: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    // Endereço - Número
    addressNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // Endereço - Complemento
    addressComplement: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Endereço - Bairro
    addressNeighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Endereço - Cidade
    addressCity: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Endereço - Estado (UF)
    addressState: {
      type: DataTypes.STRING(2), // Sigla: SP, RJ, etc.
      allowNull: true
    },
    // Endereço - CEP
    addressZipCode: {
      type: DataTypes.STRING(10), // Formato: 01234-567
      allowNull: true
    },
    // País (padrão Brasil)
    addressCountry: {
      type: DataTypes.STRING(50),
      defaultValue: 'Brasil'
    },
    // Telefone de contato
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // Email de contato
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true // Validação de formato de email
      }
    },
    // Website da empresa
    contactWebsite: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    // Última atualização dos dados
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW // Padrão: agora
    },
    // Fonte dos dados (RECEITA_FEDERAL, MANUAL, API_EXTERNA)
    dataSource: {
      type: DataTypes.ENUM('RECEITA_FEDERAL', 'MANUAL', 'API_EXTERNA'),
      defaultValue: 'RECEITA_FEDERAL' // Padrão: Receita Federal
    },
    // Tags para categorização (array em JSON)
    tags: {
      type: DataTypes.JSON, // Array de strings
      defaultValue: [] // Padrão: array vazio
    },
    // Notas/anotações sobre a empresa
    notes: {
      type: DataTypes.TEXT, // Tipo TEXT para textos longos
      allowNull: true,
      validate: {
        len: [0, 1000] // Máximo 1000 caracteres
      }
    },
    // Flag para empresa favorita do usuário
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Padrão: não favorita
    },
    // ID do usuário que adicionou a empresa (chave estrangeira)
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: false, // Obrigatório
      references: { // Referência para tabela users
        model: 'users',
        key: 'id'
      }
    }
  }, {
    // Configurações da tabela
    tableName: 'companies', // Nome da tabela no banco
    timestamps: true, // Adiciona createdAt e updatedAt
    indexes: [ // Índices para otimizar consultas
      { unique: true, fields: ['cnpj'] }, // Índice único no CNPJ
      { fields: ['razaoSocial'] }, // Índice na razão social
      { fields: ['situacao'] }, // Índice na situação
      { fields: ['addedBy'] }, // Índice no usuário que adicionou
      { fields: ['createdAt'] }, // Índice na data de criação
      // { fields: ['tags'] }, // Removido por problemas de indexação JSON no PostgreSQL
      { fields: ['cnaePrincipal'] } // Índice no CNAE
    ]
  });

  // Retorna o modelo Company configurado
  return Company;
};

export default CompanyModel;
