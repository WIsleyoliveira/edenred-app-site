// Este arquivo contém middlewares de autenticação e autorização.
// Implementa JWT (JSON Web Tokens) para controle de acesso.
// Fluxo: Token → Verificação → Busca usuário → Autorização

import jwt from 'jsonwebtoken';
import { obterAdaptadorBanco } from '../config/dbAdapter.js'; // Adaptador para acesso ao banco

// =================== AUTENTICAÇÃO JWT ===================
// Middleware principal: verifica token JWT e carrega usuário
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Extrai token do header Authorization (formato: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Se não há token, retorna erro 401
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido. Por favor, faça login.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verifica e decodifica o token JWT
      const decoded = jwt.verify(token, process.env.CHAVE_SECRETA_JWT || 'chave_secreta_padrao');

      // Busca usuário no banco usando o ID do token
      const db = obterAdaptadorBanco();
      const user = await db.buscarUsuarioPorId(decoded.id);

      // Verifica se usuário existe
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Usuário não encontrado.',
          code: 'INVALID_TOKEN'
        });
      }

      // Verifica se conta está ativa
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada. Entre em contato com o suporte.',
          code: 'ACCOUNT_DISABLED'
        });
      }

      // Adiciona dados do usuário ao objeto request
      req.user = user;
      next(); // Continua para o próximo middleware/controller

    } catch (jwtError) {
      // Trata diferentes tipos de erro do JWT
      let message = 'Token inválido ou expirado.';
      let code = 'INVALID_TOKEN';

      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token expirado. Por favor, faça login novamente.';
        code = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Token malformado.';
        code = 'MALFORMED_TOKEN';
      }

      return res.status(401).json({
        success: false,
        message,
        code
      });
    }

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// =================== AUTORIZAÇÃO POR PERMISSÕES ===================
// Middleware para verificar se usuário é administrador
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Usuário é admin, continua
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões de administrador requeridas.',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
};

// Middleware para verificar propriedade dos recursos (próprio usuário ou admin)
export const requireOwnershipOrAdmin = (req, res, next) => {
  const userId = req.params.userId || req.body.userId; // ID do usuário dono do recurso

  // Permite acesso se: usuário logado é o dono OU é admin
  if (req.user && (req.user.id.toString() === userId || req.user.role === 'admin')) {
    next(); // Acesso autorizado
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
};

// Middleware opcional de autenticação (não bloqueia se não houver token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.CHAVE_SECRETA_JWT || 'chave_secreta_padrao');
        const db = obterAdaptadorBanco();
        const user = await db.buscarUsuarioPorId(decoded.id);

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (jwtError) {
        // Ignora erros de token para autenticação opcional
        console.log('Token opcional inválido:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    next();
  }
};

// Utilitário para gerar token JWT
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.CHAVE_SECRETA_JWT || 'chave_secreta_padrao',
    {
      expiresIn: process.env.TEMPO_EXPIRACAO_JWT || '7d'
    }
  );
};


// Utilitário para extrair informações do token sem verificar
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
