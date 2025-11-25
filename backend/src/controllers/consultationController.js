// Este arquivo contém os controllers para operações de consulta CNPJ.
// Demonstra como o sistema integra APIs externas com o banco de dados PostgreSQL.
// Fluxo: Recebe CNPJ → Verifica cache no banco → Consulta APIs externas → Salva no banco

import { obterAdaptadorBanco } from '../config/dbAdapter.js'; // Adaptador singleton para acesso ao banco
import { consultCNPJWithFallback, formatCNPJ } from '../utils/cnpjService.js'; // Serviços de consulta CNPJ

// =================== CONSULTA CNPJ ===================
// Endpoint principal: consulta CNPJ e salva resultado no banco
export const consultCNPJ = async (req, res) => {
  const startTime = Date.now(); // Marca tempo inicial para métricas

  try {
    const { cnpj, produto } = req.body; // CNPJ e produto enviados pelo usuário
    const formattedCNPJ = formatCNPJ(cnpj); // Formata CNPJ para padrão brasileiro

    // Validação do produto
    if (!produto) {
      return res.status(400).json({
        success: false,
        message: 'Produto é obrigatório',
        code: 'PRODUCT_REQUIRED'
      });
    }

    const validProducts = ['FLEET', 'TICKET_RESTAURANT', 'PAY', 'ALIMENTA', 'ABASTECIMENTO', 'OUTRAS'];
    if (!validProducts.includes(produto)) {
      return res.status(400).json({
        success: false,
        message: 'Produto inválido',
        code: 'INVALID_PRODUCT'
      });
    }

    // =================== REGRA DE NEGOCIO: 3 MESES ===================
    // Impede que o mesmo CNPJ consulte o mesmo produto novamente antes de 3 meses.
    // Verifica no banco se existe uma consulta bem-sucedida para esse CNPJ+produto nos 
    // últimos 3 meses. Se existir, retorna erro informando quando será possível novamente.
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // buscarConsultasPorCNPJProduto é um método do adaptador (implementado no Adaptador SQL)
    const recent = await obterAdaptadorBanco().buscarConsultasPorCNPJProduto(formattedCNPJ, produto, threeMonthsAgo);
    if (recent) {
      const lastDate = new Date(recent.createdAt || recent.updatedAt || recent.created_at);
      const nextAllowed = new Date(lastDate);
      nextAllowed.setMonth(nextAllowed.getMonth() + 3);

      return res.status(429).json({
        success: false,
        message: 'Este CNPJ já foi consultado para este produto nos últimos 3 meses.',
        code: 'CNPJ_RECENTLY_CONSULTED',
        data: {
          lastConsultationAt: lastDate.toISOString(),
          nextAllowedAt: nextAllowed.toISOString()
        }
      });
    }

    // =================== CRIAR REGISTRO DE CONSULTA ===================
    // Cria registro no banco antes de consultar APIs (auditoria)
    const consultationData = {
      cnpj: formattedCNPJ,
      produto: produto,
      userId: req.user.id,
      status: 'PENDING', // Status inicial: pendente
      metadata: {
        userAgent: req.headers['user-agent'], // Navegador/dispositivo
        ipAddress: req.ip // Endereço IP para auditoria
      }
    };

    // Salva registro de consulta no banco
    const consultation = await obterAdaptadorBanco().criarConsulta(consultationData);

    try {
      // =================== VERIFICAÇÃO DE CACHE NO BANCO ===================
      // Verifica se empresa já existe no banco (cache local)
      let company = await obterAdaptadorBanco().buscarEmpresaPorCNPJ(formattedCNPJ);

      // Se empresa existe e foi atualizada há menos de 24h, usa cache
      if (company && Date.now() - new Date(company.lastUpdated || company.updatedAt) < 24 * 60 * 60 * 1000) {
        // Atualiza consulta como sucesso usando cache
        const updatedConsultation = await obterAdaptadorBanco().atualizarConsulta(consultation.id, {
          status: 'SUCCESS',
          source: 'CACHE', // Indica que veio do cache do banco
          companyId: company.id,
          result: company
        });

        // Retorna resposta com dados do cache
        return res.json({
          success: true,
          message: 'CNPJ consultado com sucesso (cache)',
          data: { company, consultation: updatedConsultation }
        });
      }

      // =================== CONSULTA APIs EXTERNAS ===================
      // Se não há cache válido, consulta APIs da Receita Federal
      const apiResult = await consultCNPJWithFallback(formattedCNPJ);

      // =================== SALVAR/ATUALIZAR EMPRESA ===================
      // Salva ou atualiza dados da empresa no banco
      if (company) {
        // Empresa já existe, apenas atualiza
        company = await obterAdaptadorBanco().atualizarEmpresa(company.id, {
          ...apiResult.data,
          lastUpdated: new Date()
        });
      } else {
        // Empresa não existe, cria nova
        company = await obterAdaptadorBanco().criarEmpresa({
          ...apiResult.data,
          addedBy: req.user.id, // Vincula ao usuário que consultou
          lastUpdated: new Date()
        });
      }

      // =================== ATUALIZAR CONSULTA ===================
      // Marca consulta como sucesso e vincula à empresa
      const updatedConsultation = await obterAdaptadorBanco().atualizarConsulta(consultation.id, {
        status: 'SUCCESS',
        source: apiResult.source, // RECEITA_FEDERAL ou API_EXTERNA
        companyId: company.id,
        result: apiResult.data
      });

      // Retorna resposta de sucesso
      res.json({
        success: true,
        message: 'CNPJ consultado com sucesso',
        data: { company, consultation: updatedConsultation }
      });

    } catch (apiError) {
      console.error('Erro na consulta CNPJ:', apiError);

      // =================== TRATAMENTO DE ERROS ===================
      // Marca consulta como erro e salva detalhes
      await obterAdaptadorBanco().atualizarConsulta(consultation.id, {
        status: 'ERROR',
        error: apiError.message
      });

      // Retorna erro para o cliente
      res.status(500).json({
        success: false,
        message: 'Erro ao consultar CNPJ',
        error: apiError.message
      });
    }

  } catch (error) {
    console.error('Erro na consulta CNPJ:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// =================== LISTAR CONSULTAS ===================
// Lista consultas do usuário com filtros e paginação
// Admin vê todas as consultas, usuários comuns veem apenas as suas
export const getConsultations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, favorite } = req.query;

    // Monta filtros baseados nos parâmetros
    const filters = {};
    
    // Se não for admin, filtra apenas consultas do próprio usuário
    if (req.user.role !== 'admin') {
      filters.userId = req.user.id;
    }
    
    if (status) filters.status = status;
    if (favorite === 'true') filters.isFavorite = true;

    // Admin usa busca geral, usuário comum usa busca por usuário
    let result;
    if (req.user.role === 'admin') {
      // Buscar todas as consultas para admin
      result = await obterAdaptadorBanco().buscarTodasConsultas(filters);
    } else {
      // Buscar apenas consultas do usuário
      result = await obterAdaptadorBanco().buscarConsultasPorUsuario(req.user.id, filters);
    }

    res.json({
      success: true,
      data: {
        consultations: result.data,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// =================== ESTATÍSTICAS DE CONSULTAS ===================
// Retorna estatísticas das consultas do usuário
export const getConsultationStats = async (req, res) => {
  try {
    // Busca estatísticas usando método do adaptador
    const stats = await obterAdaptadorBanco().obterEstatisticasConsulta(req.user.id);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// =================== FAVORITAR CONSULTA ===================
// Adiciona ou remove consulta dos favoritos
export const toggleFavorite = async (req, res) => {
  try {
    // Busca consulta específica do usuário
    const consultation = await obterAdaptadorBanco().buscarConsultasPorUsuario(req.user.id, { id: req.params.id });

    if (!consultation || !consultation.data || consultation.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada',
        code: 'CONSULTATION_NOT_FOUND'
      });
    }

    const consultationItem = consultation.data[0];

    // Inverte status de favorito (toggle)
    const isFavorite = !consultationItem.isFavorite;
    const updatedConsultation = await obterAdaptadorBanco().atualizarConsulta(req.params.id, {
      isFavorite
    });

    res.json({
      success: true,
      message: isFavorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos',
      data: { consultation: updatedConsultation }
    });

  } catch (error) {
    console.error('Erro ao favoritar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// =================== DELETAR CONSULTA ===================
// Deleta uma consulta específica
export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da consulta dos parâmetros da rota

    // Verifica se a consulta pertence ao usuário autenticado
    const consultation = await obterAdaptadorBanco().buscarConsultaPorId(id);

    if (!consultation || consultation.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada ou não autorizada',
        code: 'CONSULTATION_NOT_FOUND_OR_UNAUTHORIZED'
      });
    }

    // Deleta a consulta usando o adaptador
    await obterAdaptadorBanco().excluirConsulta(id);

    res.json({
      success: true,
      message: 'Consulta deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};
