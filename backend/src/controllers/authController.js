import { obterAdaptadorBanco } from '../config/dbAdapter.js';
import { generateToken } from '../middleware/auth.js';

// Registrar novo usuário
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const db = obterAdaptadorBanco();

    // Verificar se usuário já existe
    const existingUser = await db.buscarUsuarioPorEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está cadastrado no sistema',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Criar novo usuário via adaptador (Firebase)
    const createdUser = await db.criarUsuario({
      name: name.trim(),
      email,
      password
    });

    // Gerar token usando id retornado (adapter deve retornar id/uid)
    const token = generateToken(createdUser.id || createdUser.uid);

    // Responder
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: createdUser.id || createdUser.uid,
          name: createdUser.name || name.trim(),
          email: createdUser.email,
          role: createdUser.role || 'user',
          avatar: createdUser.avatar || null,
          preferences: createdUser.preferences || {},
          createdAt: createdUser.criadoEm || new Date()
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Login de usuário
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = obterAdaptadorBanco();

    // Verificar se usuário existe
    const user = await db.buscarUsuarioPorEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o suporte.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Autenticar via adaptador
    const authenticatedUser = await db.autenticarUsuario(email, password);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Gerar token
    const token = generateToken(authenticatedUser.id || authenticatedUser.uid);

    // Atualizar último login (se adaptador suportar atualizar)
    try {
      await db.atualizarUsuario(authenticatedUser.id || authenticatedUser.uid, { lastLogin: new Date() });
    } catch (err) {
      // Ignora falhas de atualização de metadata
      console.warn('Aviso: não foi possível atualizar lastLogin via adaptador:', err.message || err);
    }

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: authenticatedUser.id || authenticatedUser.uid,
          name: authenticatedUser.name || authenticatedUser.userName || null,
          email: authenticatedUser.email,
          role: authenticatedUser.role || 'user',
          avatar: authenticatedUser.avatar || null,
          preferences: authenticatedUser.preferences || {},
          lastLogin: authenticatedUser.lastLogin || new Date(),
          createdAt: authenticatedUser.criadoEm || authenticatedUser.createdAt || new Date()
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Obter perfil do usuário logado
export const getProfile = async (req, res) => {
  try {
    const db = obterAdaptadorBanco();
    const user = await db.buscarUsuarioPorId(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Atualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const userId = req.user.id;

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const db = obterAdaptadorBanco();
    const user = await db.atualizarUsuario(userId, updateData);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          preferences: user.preferences,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Alterar senha
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const db = obterAdaptadorBanco();

    // Buscar usuário com senha
    const user = await db.buscarUsuarioPorIdComSenha(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar senha atual
    const bcryptjs = (await import('bcryptjs')).default;
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Atualizar senha
    await db.atualizarUsuario(userId, { password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Verificar token
export const verifyToken = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
};

// Logout (invalidar token do lado cliente)
export const logout = async (req, res) => {
  // Como estamos usando JWT stateless, o logout é feito no frontend
  // removendo o token do storage. Aqui apenas retornamos sucesso.
  
  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};

// Deletar conta
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const db = obterAdaptadorBanco();

    // Buscar usuário com senha
    const user = await db.buscarUsuarioPorIdComSenha(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar senha
    const bcryptjs = (await import('bcryptjs')).default;
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta',
        code: 'INVALID_PASSWORD'
      });
    }

    // Desativar conta ao invés de deletar (soft delete)
    await db.deletarUsuario(userId);

    res.status(200).json({
      success: true,
      message: 'Conta desativada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};
