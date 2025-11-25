import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken,
  logout,
  deleteAccount
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  authRateLimit
} from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', validateUserRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', authRateLimit, validateUserLogin, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
router.put('/profile', authenticate, validateUserUpdate, updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar senha do usuário
 * @access  Private
 */
router.post('/change-password', 
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    body('newPassword')
      .isLength({ min: 6, max: 128 })
      .withMessage('Nova senha deve ter entre 6 e 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Nova senha deve conter pelo menos uma letra minúscula, maiúscula e um número')
  ],
  changePassword
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar se token é válido
 * @access  Private
 */
router.get('/verify', authenticate, verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   DELETE /api/auth/account
 * @desc    Deletar conta do usuário
 * @access  Private
 */
router.delete('/account', 
  authenticate,
  [
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória para deletar conta')
  ],
  deleteAccount
);

export default router;
