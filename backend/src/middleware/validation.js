import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

// Middleware para processar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados inválidos fornecidos',
      errors: errorMessages,
      code: 'VALIDATION_ERROR'
    });
  }

  next();
};

// Validações para usuário
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    }),

  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Senha deve ter entre 6 e 100 caracteres'),

  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),

  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Tema deve ser "light" ou "dark"'),

  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Configuração de notificações deve ser boolean'),

  handleValidationErrors
];

// Validações para CNPJ
export const validateCNPJ = [
  body('cnpj')
    .exists({ checkFalsy: true })
    .withMessage('CNPJ é obrigatório')
    .customSanitizer((value) => {
      // Remove formatação e retorna apenas números
      if (value) {
        return value.replace(/[^\d]/g, '');
      }
      return value;
    })
    .isLength({ min: 14, max: 14 })
    .withMessage('CNPJ deve ter 14 dígitos')
    .custom((value) => {
      // Verifica se não é uma sequência de números iguais (CNPJ inválido comum)
      if (/^(\d)\1+$/.test(value)) {
        throw new Error('CNPJ inválido');
      }
      return true;
    }),

  handleValidationErrors
];

export const validateCompanyData = [
  body('cnpj')
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),

  body('razaoSocial')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Razão social deve ter entre 2 e 200 caracteres'),

  body('nomeFantasia')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Nome fantasia não pode ter mais de 200 caracteres'),

  body('situacao')
    .optional()
    .isIn(['ATIVA', 'BAIXADA', 'SUSPENSA', 'INAPTA'])
    .withMessage('Situação deve ser ATIVA, BAIXADA, SUSPENSA ou INAPTA'),

  body('capitalSocial')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capital social deve ser um número positivo'),

  body('porte')
    .optional()
    .isIn(['MEI', 'ME', 'EPP', 'MEDIO', 'GRANDE'])
    .withMessage('Porte deve ser MEI, ME, EPP, MEDIO ou GRANDE'),

  handleValidationErrors
];

// Validações para paisagens/galeria
export const validateLandscapeData = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Título deve ter entre 2 e 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição não pode ter mais de 1000 caracteres'),

  body('category')
    .optional()
    .isIn(['landscape', 'urban', 'nature', 'architecture', 'portrait', 'abstract', 'other'])
    .withMessage('Categoria inválida'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada tag deve ter entre 1 e 50 caracteres'),

  body('location.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome da localização não pode ter mais de 100 caracteres'),

  body('location.coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve estar entre -90 e 90'),

  body('location.coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve estar entre -180 e 180'),

  handleValidationErrors
];

// Validação de parâmetros
export const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} deve ser um ID válido`),

  handleValidationErrors
];

// Validação de query parameters
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'updatedAt', '-updatedAt'])
    .withMessage('Campo de ordenação inválido'),

  handleValidationErrors
];

// Validação de busca
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  query('category')
    .optional()
    .isIn(['landscape', 'urban', 'nature', 'architecture', 'portrait', 'abstract', 'other'])
    .withMessage('Categoria inválida'),

  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),

  handleValidationErrors
];

// Rate limiting removido completamente para desenvolvimento
export const createRateLimit = (windowMs, max, message) => {
  return (req, res, next) => next(); // Middleware vazio - sem rate limiting
};

// Rate limits desabilitados para desenvolvimento
export const authRateLimit = createRateLimit();
export const apiRateLimit = createRateLimit();
export const uploadRateLimit = createRateLimit();
export const cnpjRateLimit = createRateLimit();
