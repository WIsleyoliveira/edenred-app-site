import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Lista de variáveis de ambiente obrigatórias
 * Suporta nomes alternativos (para Railway/produção)
 */
const requiredEnvVars = [
  { names: ['CHAVE_SECRETA_JWT', 'JWT_SECRET'], label: 'JWT Secret' },
  { names: ['PORTA_SERVIDOR', 'PORT'], label: 'Porta do Servidor' },
  { names: ['AMBIENTE_EXECUCAO', 'NODE_ENV'], label: 'Ambiente de Execução' }
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
 * Suporta múltiplos nomes (ex: PORT ou PORTA_SERVIDOR)
 */
const isEnvVarDefined = (varNames) => {
  if (typeof varNames === 'string') {
    return process.env[varNames] !== undefined && process.env[varNames] !== '';
  }
  // Se for array, verifica se pelo menos uma existe
  return varNames.some(name => process.env[name] !== undefined && process.env[name] !== '');
};

/**
 * Obtém o valor de uma variável de ambiente com nomes alternativos
 */
const getEnvValue = (varNames) => {
  if (typeof varNames === 'string') {
    return process.env[varNames];
  }
  // Retorna o primeiro valor encontrado
  for (const name of varNames) {
    if (process.env[name] !== undefined && process.env[name] !== '') {
      return process.env[name];
    }
  }
  return undefined;
};

/**
 * Valida variáveis de ambiente obrigatórias
 */
const validateRequiredEnvVars = () => {
  const missingVars = [];

  requiredEnvVars.forEach(varConfig => {
    if (!isEnvVarDefined(varConfig.names)) {
      missingVars.push(varConfig.label + ' (' + varConfig.names.join(' ou ') + ')');
    } else {
      // Normalizar: copiar valor para o nome padrão se não existir
      const value = getEnvValue(varConfig.names);
      varConfig.names.forEach(name => {
        if (!process.env[name]) {
          process.env[name] = value;
        }
      });
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
  const tipoBanco = process.env.TIPO_BANCO_DADOS || process.env.DATABASE_TYPE || 'SQL';
  
  // Se for SQL/PostgreSQL, validar variáveis do PostgreSQL
  if (tipoBanco === 'SQL' || tipoBanco === 'sql' || tipoBanco === 'postgresql') {
    const requiredSqlVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingSqlVars = [];
    
    requiredSqlVars.forEach(varName => {
      if (!isEnvVarDefined(varName)) {
        missingSqlVars.push(varName);
      }
    });
    
    if (missingSqlVars.length > 0) {
      console.error('❌ Variáveis de ambiente do PostgreSQL não encontradas:');
      missingSqlVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      throw new Error(`Variáveis de ambiente do PostgreSQL não encontradas: ${missingSqlVars.join(', ')}`);
    }
    return;
  }
  
  // Validação original para MongoDB/Firebase
  const requiredDbVars = databaseEnvVars[tipoBanco];

  if (!requiredDbVars) {
    console.warn(`⚠️  Tipo de banco de dados '${tipoBanco}' não reconhecido. Usando SQL.`);
    return;
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
  // Validar porta (suporta PORT ou PORTA_SERVIDOR)
  const portValue = process.env.PORT || process.env.PORTA_SERVIDOR;
  const port = parseInt(portValue);
  if (isNaN(port) || port < 1000 || port > 65535) {
    // No Railway, PORT pode ser qualquer valor válido
    if (!process.env.PORT) {
      throw new Error('PORTA_SERVIDOR deve ser um número entre 1000 e 65535');
    }
  }

  // Validar ambiente (suporta NODE_ENV ou AMBIENTE_EXECUCAO)
  const envValue = process.env.NODE_ENV || process.env.AMBIENTE_EXECUCAO;
  const allowedEnvironments = ['desenvolvimento', 'development', 'producao', 'production', 'teste', 'test'];
  if (!allowedEnvironments.includes(envValue)) {
    console.warn(`⚠️  Ambiente '${envValue}' não reconhecido. Usando 'development'`);
    process.env.AMBIENTE_EXECUCAO = 'development';
    process.env.NODE_ENV = 'development';
  } else {
    // Normalizar valores
    if (envValue === 'development') process.env.AMBIENTE_EXECUCAO = 'desenvolvimento';
    if (envValue === 'production') process.env.AMBIENTE_EXECUCAO = 'producao';
    if (envValue === 'test') process.env.AMBIENTE_EXECUCAO = 'teste';
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
    console.log(`📊 Ambiente: ${process.env.AMBIENTE_EXECUCAO || process.env.NODE_ENV}`);
    console.log(`🗄️ Banco de dados: ${(process.env.TIPO_BANCO_DADOS || process.env.DATABASE_TYPE || 'SQL').toUpperCase()}`);
    console.log(`🚪 Porta: ${process.env.PORT || process.env.PORTA_SERVIDOR}`);
    
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