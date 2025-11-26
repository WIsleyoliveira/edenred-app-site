import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurações
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validar variáveis de ambiente antes de iniciar
import validateEnvironment from './utils/validateEnv.js';
if (!validateEnvironment()) {
  console.error('❌ Falha na validação de variáveis de ambiente. Encerrando aplicação.');
  process.exit(1);
}

// Importar configuração do banco
import { obterAdaptadorBanco } from './config/dbAdapter.js';

// Importar middlewares
import { apiRateLimit } from './middleware/validation.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import consultationRoutes from './routes/consultations.js';
import landscapeRoutes from './routes/landscapes.js';
import uploadRoutes from './routes/upload.js';
import chatbotRoutes from './routes/chatbot.js';

const app = express();

// Inicialização assíncrona
const inicializarAplicacao = async () => {
  try {
    // Conectar ao banco de dados
    const adaptador = obterAdaptadorBanco();
    await adaptador.conectar();
    console.log('✅ Banco de dados conectado com sucesso');

    // Inicializar sistema com dados padrão
    const inicializarSistema = (await import('./utils/initializeSystem.js')).default;
    await inicializarSistema();
  } catch (error) {
    console.error('Erro ao conectar database:', error);
    process.exit(1);
  }
};

// Middlewares de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
}));

// Configuração CORS
const opcoesCors = {
  origin: function (origin, callback) {
    // Em desenvolvimento, permitir todas as origens localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      const allowedOrigins = process.env.ORIGENS_CORS_PERMITIDAS ? 
        process.env.ORIGENS_CORS_PERMITIDAS.split(',') : 
        ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(opcoesCors));

// Middlewares gerais
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
  whitelist: ['tags', 'category', 'sort']
}));

// Logging
if ((process.env.AMBIENTE_EXECUCAO || 'desenvolvimento') === 'desenvolvimento') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting global
app.use('/api/', apiRateLimit);

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando normalmente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.AMBIENTE_EXECUCAO || process.env.NODE_ENV || 'desenvolvimento'
  });
});

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API do Sistema de Consulta CNPJ',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      consultations: '/api/consultations',
      landscapes: '/api/landscapes',
      upload: '/api/upload',
      chatbot: '/api/chatbot'
    }
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/landscapes', landscapeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Servir frontend em produção (DEPOIS das rotas da API)
if (process.env.NODE_ENV === 'production' || process.env.AMBIENTE_EXECUCAO === 'producao') {
  const frontendPath = path.join(__dirname, '../../dist');
  
  // Servir arquivos estáticos do frontend
  app.use(express.static(frontendPath));
  
  // Rota catch-all para SPA - deve vir ANTES do middleware 404
  app.get('*', (req, res, next) => {
    // Não interceptar rotas da API
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Middleware para rotas não encontradas (404)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro capturado pelo middleware global:', err);

  let error = { ...err };
  error.message = err.message;

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      details: message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Erro de chave duplicada (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      message: `${field} '${value}' já existe no sistema`,
      code: 'DUPLICATE_FIELD'
    });
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido fornecido',
      code: 'INVALID_ID'
    });
  }

  // Erro de limite de tamanho do payload
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 10MB',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }

  // Erro padrão
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.AMBIENTE_EXECUCAO === 'desenvolvimento' && { stack: err.stack })
  });
});

// Configurar porta (Railway usa PORT, local usa PORTA_SERVIDOR)
const PORT = process.env.PORT || process.env.PORTA_SERVIDOR || 5000;

// Inicializar app e banco
inicializarAplicacao();

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando em modo ${process.env.AMBIENTE_EXECUCAO || 'desenvolvimento'}`);
  console.log(`📡 URL: http://0.0.0.0:${PORT}`);
  console.log(`📊 Health Check: http://0.0.0.0:${PORT}/health`);
  console.log(`📚 API Docs: http://0.0.0.0:${PORT}/api/docs`);
  console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);
});

// Lidar com fechamento graceful
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM recebido. Fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado.');
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT recebido. Fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado.');
    process.exit(0);
  });
});

// Lidar com rejeições de promises não capturadas
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
