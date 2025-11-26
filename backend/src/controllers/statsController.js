// Controller para estatísticas da plataforma

import { obterAdaptadorBanco } from '../config/dbAdapter.js';

/**
 * Obtém estatísticas gerais da plataforma
 * GET /api/stats/platform
 */
export const getPlatformStats = async (req, res) => {
  try {
    const db = obterAdaptadorBanco();

    // Buscar total de empresas cadastradas
    const empresasResult = await db.buscarTodasEmpresas({ limit: 1 });
    const totalEmpresas = empresasResult.pagination?.total || 0;

    // Buscar total de consultas realizadas
    const consultasResult = await db.buscarTodasConsultas({ limit: 1 });
    const totalConsultas = consultasResult.pagination?.total || 0;

    // Buscar consultas em andamento (status PENDING)
    const consultasPendentes = await db.buscarTodasConsultas({ 
      status: 'PENDING',
      limit: 1
    });
    const totalPendentes = consultasPendentes.pagination?.total || 0;

    // Buscar consultas bem-sucedidas
    const consultasSucesso = await db.buscarTodasConsultas({ 
      status: 'SUCCESS',
      limit: 1
    });
    const totalSucesso = consultasSucesso.pagination?.total || 0;

    // Buscar consultas com erro
    const consultasErro = await db.buscarTodasConsultas({ 
      status: 'ERROR',
      limit: 1
    });
    const totalErro = consultasErro.pagination?.total || 0;

    // Calcular taxa de sucesso
    const taxaSucesso = totalConsultas > 0 
      ? ((totalSucesso / totalConsultas) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        empresasCadastradas: totalEmpresas,
        consultasRealizadas: totalConsultas,
        processosAtivos: totalPendentes,
        consultasSucesso: totalSucesso,
        consultasErro: totalErro,
        taxaSucesso: parseFloat(taxaSucesso),
        ultimaAtualizacao: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas da plataforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};

/**
 * Obtém estatísticas de um usuário específico
 * GET /api/stats/user/:userId
 */
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = obterAdaptadorBanco();

    // Buscar empresas do usuário
    const empresasResult = await db.buscarEmpresasPorUsuario(userId, { limit: 1 });
    const totalEmpresas = empresasResult.pagination?.total || 0;

    // Buscar consultas do usuário
    const consultasResult = await db.buscarConsultasPorUsuario(userId, { limit: 1 });
    const totalConsultas = consultasResult.pagination?.total || 0;

    // Buscar consultas favoritas
    const favoritasResult = await db.buscarConsultasPorUsuario(userId, { 
      favorite: 'true',
      limit: 1
    });
    const totalFavoritas = favoritasResult.pagination?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        empresasCadastradas: totalEmpresas,
        consultasRealizadas: totalConsultas,
        consultasFavoritas: totalFavoritas,
        ultimaAtualizacao: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas do usuário',
      error: error.message
    });
  }
};

/**
 * Obtém consultas recentes da plataforma
 * GET /api/stats/recent-consultations
 */
export const getRecentConsultations = async (req, res) => {
  try {
    const db = obterAdaptadorBanco();
    const { limit = 5 } = req.query;

    const consultasResult = await db.buscarTodasConsultas({ 
      limit: parseInt(limit),
      page: 1
    });

    res.status(200).json({
      success: true,
      data: consultasResult.data || []
    });

  } catch (error) {
    console.error('Erro ao buscar consultas recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar consultas recentes',
      error: error.message
    });
  }
};

export default {
  getPlatformStats,
  getUserStats,
  getRecentConsultations
};
