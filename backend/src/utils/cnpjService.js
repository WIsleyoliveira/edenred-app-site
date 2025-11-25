// Este arquivo contém utilitários para trabalhar com CNPJ e APIs de consulta.
// Inclui formatação, validação e integração com APIs da Receita Federal.
// As APIs usadas são: ReceitaWS (primária) e BrasilAPI (fallback).

import axios from 'axios'; // Cliente HTTP para fazer requisições às APIs

// =================== FORMATAÇÃO CNPJ ===================

// Formata CNPJ no padrão brasileiro: XX.XXX.XXX/XXXX-XX
export const formatCNPJ = (cnpj) => {
  const numbers = cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (numbers.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  // Aplica máscara de formatação
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Remove formatação do CNPJ, deixando apenas números
export const cleanCNPJ = (cnpj) => {
  return cnpj.replace(/\D/g, '');
};

// =================== VALIDAÇÃO CNPJ ===================

// Valida CNPJ usando algoritmo oficial da Receita Federal
export const validateCNPJ = (cnpj) => {
  const numbers = cleanCNPJ(cnpj);

  if (numbers.length !== 14) return false;

  // Eliminar CNPJs inválidos conhecidos (todos dígitos iguais)
  if (/^(\d)\1+$/.test(numbers)) return false;

  // Validar primeiro dígito verificador
  let sum = 0;
  let weight = 2;

  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const remainder1 = sum % 11;
  const digit1 = remainder1 < 2 ? 0 : 11 - remainder1;

  if (parseInt(numbers[12]) !== digit1) return false;

  // Validar segundo dígito verificador
  sum = 0;
  weight = 2;

  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const remainder2 = sum % 11;
  const digit2 = remainder2 < 2 ? 0 : 11 - remainder2;

  return parseInt(numbers[13]) === digit2;
};

// =================== CONSULTA APIs RECEITA FEDERAL ===================

// Consulta CNPJ na API ReceitaWS (API primária)
// ReceitaWS é um serviço que acessa dados públicos da Receita Federal
export const consultCNPJReceitaWS = async (cnpj) => {
  try {
    const cleanedCNPJ = cleanCNPJ(cnpj);

    if (!validateCNPJ(cleanedCNPJ)) {
      throw new Error('CNPJ inválido');
    }

    // Monta URL da API ReceitaWS
    const url = `${process.env.URL_BASE_RECEITA_WS || 'https://www.receitaws.com.br/v1'}/cnpj/${cleanedCNPJ}`;
    
    // Faz requisição HTTP para a API
    const response = await axios.get(url, {
      timeout: 10000, // Timeout de 10 segundos
      headers: {
        'User-Agent': 'CNPJ-Consultation-System/1.0.0' // Identificação do sistema
      }
    });

    // Verifica se a API retornou erro
    if (response.data.status === 'ERROR') {
      throw new Error(response.data.message || 'Erro na consulta do CNPJ');
    }
    
    // Mapeia resposta da API ReceitaWS para o formato interno do sistema
    const companyData = {
      cnpj: formatCNPJ(response.data.cnpj), // Formata CNPJ
      razaoSocial: response.data.nome, // Razão social da empresa
      nomeFantasia: response.data.fantasia || response.data.nome, // Nome fantasia
      situacao: mapSituacao(response.data.situacao), // Situação cadastral
      dataAbertura: parseDate(response.data.abertura), // Data de abertura
      capitalSocial: parseFloat(response.data.capital_social?.replace(/[^\d,]/g, '')?.replace(',', '.')) || 0, // Capital social
      cnae: {
        principal: {
          codigo: response.data.atividade_principal?.[0]?.code, // CNAE principal
          descricao: response.data.atividade_principal?.[0]?.text
        },
        secundarias: response.data.atividades_secundarias?.map(atividade => ({
          codigo: atividade.code,
          descricao: atividade.text
        })) || [] // CNAEs secundários
      },
      address: {
        street: response.data.logradouro, // Endereço completo
        number: response.data.numero,
        complement: response.data.complemento,
        neighborhood: response.data.bairro,
        city: response.data.municipio,
        state: response.data.uf,
        zipCode: response.data.cep,
        country: 'Brasil'
      },
      contact: {
        phone: response.data.telefone, // Contato
        email: response.data.email
      },
      naturezaJuridica: response.data.natureza_juridica, // Natureza jurídica
      porte: mapPorte(response.data.porte), // Porte da empresa
      dataSource: 'RECEITA_FEDERAL', // Origem dos dados
      lastUpdated: new Date() // Timestamp da atualização
    };
    
    // Retorna dados mapeados com sucesso
    return {
      success: true,
      data: companyData,
      source: 'RECEITA_FEDERAL' // Indica que veio da ReceitaWS
    };

  } catch (error) {
    console.error('Erro na consulta ReceitaWS:', error);

    // Trata erros específicos da API
    if (error.response?.status === 429) {
      throw new Error('Limite de consultas excedido. Tente novamente mais tarde.');
    }

    if (error.response?.status === 404) {
      throw new Error('CNPJ não encontrado na Receita Federal.');
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout na consulta. Tente novamente.');
    }

    throw new Error(error.message || 'Erro na consulta do CNPJ');
  }
};

// Consulta CNPJ na API BrasilAPI (API alternativa/fallback)
// BrasilAPI também acessa dados da Receita Federal, mas com estrutura diferente
export const consultCNPJBrasilAPI = async (cnpj) => {
  try {
    const cleanedCNPJ = cleanCNPJ(cnpj);

    if (!validateCNPJ(cleanedCNPJ)) {
      throw new Error('CNPJ inválido');
    }

    // URL da API BrasilAPI
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cleanedCNPJ}`;
    
    // Faz requisição HTTP para BrasilAPI
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'CNPJ-Consultation-System/1.0.0'
      }
    });

    // Mapeia resposta da BrasilAPI para o formato interno do sistema
    const companyData = {
      cnpj: formatCNPJ(response.data.cnpj), // Formata CNPJ
      razaoSocial: response.data.razao_social, // Razão social
      nomeFantasia: response.data.nome_fantasia || response.data.razao_social, // Nome fantasia
      situacao: mapSituacao(response.data.descricao_situacao_cadastral), // Situação
      dataAbertura: parseDate(response.data.data_inicio_atividade), // Data de abertura
      capitalSocial: parseFloat(response.data.capital_social) || 0, // Capital social
      cnae: {
        principal: {
          codigo: response.data.cnae_fiscal, // CNAE principal
          descricao: response.data.cnae_fiscal_descricao
        },
        secundarias: response.data.cnaes_secundarios?.map(cnae => ({
          codigo: cnae.codigo,
          descricao: cnae.descricao
        })) || [] // CNAEs secundários
      },
      address: {
        street: response.data.logradouro, // Endereço
        number: response.data.numero,
        complement: response.data.complemento,
        neighborhood: response.data.bairro,
        city: response.data.municipio,
        state: response.data.uf,
        zipCode: response.data.cep,
        country: 'Brasil'
      },
      contact: {
        phone: response.data.ddd_telefone_1, // Contato (BrasilAPI tem estrutura diferente)
        email: null // BrasilAPI geralmente não retorna email
      },
      naturezaJuridica: response.data.natureza_juridica, // Natureza jurídica
      porte: mapPorte(response.data.porte), // Porte
      dataSource: 'API_EXTERNA', // Indica que veio de API externa
      lastUpdated: new Date()
    };
    
    // Retorna dados mapeados com sucesso
    return {
      success: true,
      data: companyData,
      source: 'API_EXTERNA' // Indica que veio da BrasilAPI
    };

  } catch (error) {
    console.error('Erro na consulta BrasilAPI:', error);
    throw error;
  }
};

// =================== SISTEMA DE FALLBACK ===================

// Consulta CNPJ com fallback automático entre APIs
// Primeiro tenta ReceitaWS, se falhar tenta BrasilAPI
export const consultCNPJWithFallback = async (cnpj) => {
  const errors = []; // Armazena erros de cada tentativa

  // Tenta ReceitaWS primeiro (API primária)
  try {
    return await consultCNPJReceitaWS(cnpj);
  } catch (error) {
    errors.push({ service: 'ReceitaWS', error: error.message });
  }

  // Fallback para BrasilAPI se ReceitaWS falhou
  try {
    return await consultCNPJBrasilAPI(cnpj);
  } catch (error) {
    errors.push({ service: 'BrasilAPI', error: error.message });
  }

  // Se todas as APIs falharam, lança erro com detalhes
  throw new Error(`Falha em todas as APIs de consulta: ${errors.map(e => `${e.service}: ${e.error}`).join('; ')}`);
};

// =================== FUNÇÕES AUXILIARES ===================

// Mapeia situação cadastral da API para nosso enum interno
const mapSituacao = (situacao) => {
  if (!situacao) return 'ATIVA';

  const situacaoUpper = situacao.toUpperCase();

  if (situacaoUpper.includes('ATIVA')) return 'ATIVA';
  if (situacaoUpper.includes('BAIXADA')) return 'BAIXADA';
  if (situacaoUpper.includes('SUSPENSA')) return 'SUSPENSA';
  if (situacaoUpper.includes('INAPTA')) return 'INAPTA';

  return 'ATIVA'; // Default para situações desconhecidas
};

// Mapeia porte da empresa da API para nosso enum interno
const mapPorte = (porte) => {
  if (!porte) return 'ME';

  const porteUpper = porte.toUpperCase();

  if (porteUpper.includes('MEI')) return 'MEI';
  if (porteUpper.includes('PEQUENO') || porteUpper.includes('ME')) return 'ME';
  if (porteUpper.includes('EPP')) return 'EPP';
  if (porteUpper.includes('MÉDIO') || porteUpper.includes('MEDIO')) return 'MEDIO';
  if (porteUpper.includes('GRANDE')) return 'GRANDE';

  return 'ME'; // Default para portes desconhecidos
};

// Converte string de data da API para objeto Date
const parseDate = (dateString) => {
  if (!dateString) return null;

  // Tenta formato brasileiro DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }

  // Tenta formato ISO ou outros formatos
  return new Date(dateString);
};

export default {
  formatCNPJ,
  cleanCNPJ,
  validateCNPJ,
  consultCNPJReceitaWS,
  consultCNPJBrasilAPI,
  consultCNPJWithFallback
};
