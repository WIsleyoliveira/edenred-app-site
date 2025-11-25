import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Lista de variáveis de ambiente obrigatórias
 */
const requiredEnvVars = [
  'CHAVE_SECRETA_JWT',
  'PORTA_SERVIDOR',
  'AMBIENTE_EXECUCAO'
];

/**
 * Lista de variáveis de ambiente opcionais com valores padrão
 */
const optionalEnvVars = {
  TEMPO_EXPIRACAO_JWT: '7d',
  ROUNDS_CRIPTOGRAFIA_SENHA: '12',
  TAMANHO_MAXIMO_ARQUIVO: '5000000',
  TIPOS_ARQUIVOS_PERMITIDOS: 'image/jpeg,image/png,image/gif,image/webp',
  JANELA_LIMITE_REQUISICOES_MS: '900000',
  MAXIMO_REQUISICOES_POR_JANELA: '100',
  URL_BASE_RECEITA_WS: 'https://www.receitaws.com.br/v1',
  ORIGENS_CORS_PERMITIDAS: 'http://localhost:5173,http://localhost:3000,http://localhost:5174'
};

/**
 * Variáveis específicas do banco de dados
 */
const databaseEnvVars = {
  mongodb: [
    'URL_CONEXAO_MONGODB',
    'NOME_BANCO_DADOS'
  ],
  firebase: [
    'CHAVE_API_FIREBASE',
    'DOMINIO_AUTH_FIREBASE',
    'ID_PROJETO_FIREBASE',
    'BUCKET_STORAGE_FIREBASE'
  ]
};

/**
 * Valida se uma variável de ambiente está definida
 */
const isEnvVarDefined = (varName) => {
  return process.env[varName] !== undefined && process.env[varName] !== '';
};

/**
 * Valida variáveis de ambiente obrigatórias
 */
const validateRequiredEnvVars = () => {
  const missingVars = [];

  requiredEnvVars.forEach(varName => {
    if (!isEnvVarDefined(varName)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`);
  }
};

/**
 * Valida variáveis específicas do banco de dados
 */
const validateDatabaseEnvVars = () => {
  const tipoBanco = process.env.TIPO_BANCO_DADOS || 'firebase';
  const requiredDbVars = databaseEnvVars[tipoBanco];

  if (!requiredDbVars) {
    throw new Error(`Tipo de banco de dados inválido: ${tipoBanco}. Opções: mongodb, firebase`);
  }

  const missingDbVars = [];
  requiredDbVars.forEach(varName => {
    if (!isEnvVarDefined(varName)) {
      missingDbVars.push(varName);
    }
  });

  if (missingDbVars.length > 0) {
    console.error(`❌ Variáveis de ambiente do banco ${tipoBanco.toUpperCase()} não encontradas:`);
    missingDbVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    throw new Error(`Variáveis de ambiente do banco ${tipoBanco} não encontradas: ${missingDbVars.join(', ')}`);
  }
};

/**
 * Aplica valores padrão para variáveis opcionais
 */
const applyDefaultValues = () => {
  Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
    if (!isEnvVarDefined(varName)) {
      process.env[varName] = defaultValue;
      console.log(`⚠️  Usando valor padrão para ${varName}: ${defaultValue}`);
    }
  });
};

/**
 * Valida formato de algumas variáveis específicas
 */
const validateEnvVarFormats = () => {
  // Validar porta
  const port = parseInt(process.env.PORTA_SERVIDOR);
  if (isNaN(port) || port < 1000 || port > 65535) {
    throw new Error('PORTA_SERVIDOR deve ser um número entre 1000 e 65535');
  }

  // Validar ambiente
  const allowedEnvironments = ['desenvolvimento', 'producao', 'teste'];
  if (!allowedEnvironments.includes(process.env.AMBIENTE_EXECUCAO)) {
    console.warn(`⚠️  AMBIENTE_EXECUCAO '${process.env.AMBIENTE_EXECUCAO}' não reconhecido. Usando 'desenvolvimento'`);
    process.env.AMBIENTE_EXECUCAO = 'desenvolvimento';
  }

  // Validar rounds de criptografia
  const bcryptRounds = parseInt(process.env.ROUNDS_CRIPTOGRAFIA_SENHA);
  if (isNaN(bcryptRounds) || bcryptRounds < 8 || bcryptRounds > 15) {
    console.warn('⚠️  ROUNDS_CRIPTOGRAFIA_SENHA deve ser entre 8 e 15. Usando 12');
    process.env.ROUNDS_CRIPTOGRAFIA_SENHA = '12';
  }

  // Validar tamanho máximo do arquivo
  const maxFileSize = parseInt(process.env.TAMANHO_MAXIMO_ARQUIVO);
  if (isNaN(maxFileSize) || maxFileSize < 100000) { // 100KB mínimo
    console.warn('⚠️  TAMANHO_MAXIMO_ARQUIVO deve ser pelo menos 100000 (100KB). Usando 5MB');
    process.env.TAMANHO_MAXIMO_ARQUIVO = '5000000';
  }
};

/**
 * Função principal de validação
 */
const validateEnvironment = () => {
  try {
    console.log('🔍 Validando variáveis de ambiente...');
    
    // 1. Validar variáveis obrigatórias
    validateRequiredEnvVars();
    
    // 2. Aplicar valores padrão
    applyDefaultValues();
    
    // 3. Validar variáveis do banco de dados
    validateDatabaseEnvVars();
    
    // 4. Validar formatos específicos
    validateEnvVarFormats();
    
    console.log('✅ Todas as variáveis de ambiente foram validadas com sucesso');
    console.log(`📊 Ambiente: ${process.env.AMBIENTE_EXECUCAO}`);
    console.log(`🗄️ Banco de dados: ${(process.env.TIPO_BANCO_DADOS || 'firebase').toUpperCase()}`);
    console.log(`🚪 Porta: ${process.env.PORTA_SERVIDOR}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro na validação de variáveis de ambiente:', error.message);
    console.error('\n📋 Verifique o arquivo .env e certifique-se de que todas as variáveis obrigatórias estão definidas.');
    console.error('📖 Consulte o arquivo .env.example para referência.\n');
    return false;
  }
};

/**
 * Obter configurações formatadas
 */
const getConfig = () => {
  return {
    server: {
      port: parseInt(process.env.PORTA_SERVIDOR),
      environment: process.env.AMBIENTE_EXECUCAO,
      jwtSecret: process.env.CHAVE_SECRETA_JWT,
      jwtExpiration: process.env.TEMPO_EXPIRACAO_JWT,
      bcryptRounds: parseInt(process.env.ROUNDS_CRIPTOGRAFIA_SENHA)
    },
    database: {
      type: process.env.TIPO_BANCO_DADOS || 'firebase',
      mongodb: {
        uri: process.env.URL_CONEXAO_MONGODB,
        name: process.env.NOME_BANCO_DADOS
      },
      firebase: {
        apiKey: process.env.CHAVE_API_FIREBASE,
        authDomain: process.env.DOMINIO_AUTH_FIREBASE,
        projectId: process.env.ID_PROJETO_FIREBASE,
        storageBucket: process.env.BUCKET_STORAGE_FIREBASE,
        messagingSenderId: process.env.ID_REMETENTE_FIREBASE,
        appId: process.env.ID_APP_FIREBASE
      }
    },
    security: {
      corsOrigins: process.env.ORIGENS_CORS_PERMITIDAS?.split(',') || [],
      rateLimitWindow: parseInt(process.env.JANELA_LIMITE_REQUISICOES_MS),
      rateLimitMax: parseInt(process.env.MAXIMO_REQUISICOES_POR_JANELA)
    },
    upload: {
      maxFileSize: parseInt(process.env.TAMANHO_MAXIMO_ARQUIVO),
      allowedTypes: process.env.TIPOS_ARQUIVOS_PERMITIDOS?.split(',') || []
    },
    external: {
      receitawsUrl: process.env.URL_BASE_RECEITA_WS,
      cnpjApiKey: process.env.CHAVE_API_CNPJ_EXTERNA
    }
  };
};

export {
  validateEnvironment,
  getConfig,
  isEnvVarDefined
};

export default validateEnvironment;