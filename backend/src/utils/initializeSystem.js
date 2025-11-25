import { obterAdaptadorBanco } from '../config/dbAdapter.js';
import bcryptjs from 'bcryptjs';

// Dados de teste para serem inseridos
const dadosIniciais = {
  usuarios: [
    {
      name: 'Admin Edenred',
      email: 'admin@edenred.com.br',
      password: '123456',
      role: 'admin'
    },
    {
      name: 'Consultor Edenred',
      email: 'consultor@edenred.com.br',
      password: 'consultor123',
      role: 'user'
    }
  ],
  empresas: [
    {
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'EMPRESA TESTE EDENRED LTDA',
      nomeFantasia: 'Edenred Teste',
      situacao: 'ATIVA',
      porte: 'MEDIO',
      addressStreet: 'Rua das Empresas',
      addressNumber: '123',
      addressZipCode: '01234-567',
      addressCity: 'São Paulo',
      addressState: 'SP',
      contactPhone: '(11) 9999-8888',
      contactEmail: 'contato@teste.com.br',
      cnaePrincipal: '7020-4/00',
      cnaePrincipalDescricao: 'Atividades de consultoria em gestão empresarial'
    }
  ]
};

export const inicializarSistema = async () => {
  try {
    console.log('🚀 Inicializando sistema Edenred...');

    const db = obterAdaptadorBanco();

    // Verificar se usuários já existem
    const adminExistente = await db.buscarUsuarioPorEmail('admin@edenred.com.br');

    if (!adminExistente) {
      console.log('👥 Criando usuários padrão...');

      for (const usuario of dadosIniciais.usuarios) {
        try {
          await db.criarUsuario(usuario);
          console.log(`✅ Usuário criado: ${usuario.email}`);
        } catch (error) {
          console.log(`⚠️ Usuário ${usuario.email} já existe ou erro:`, error.message);
        }
      }
    } else {
      console.log('👥 Usuários já existem no sistema');
    }

    // Criar empresa de teste
    console.log('🏢 Verificando empresa de teste...');
    const empresaExistente = await db.buscarEmpresaPorCNPJ('12.345.678/0001-90');

    if (!empresaExistente) {
      for (const empresa of dadosIniciais.empresas) {
        empresa.addedBy = adminExistente.id; // Use the admin user ID
        await db.criarEmpresa(empresa);
        console.log(`✅ Empresa criada: ${empresa.razaoSocial}`);
      }
    } else {
      console.log('🏢 Empresa de teste já existe');
    }

    console.log('🎉 Sistema inicializado com sucesso!');

    // Retornar credenciais de teste
    return {
      credenciais: [
        { email: 'admin@edenred.com.br', senha: '123456', tipo: 'Admin' },
        { email: 'consultor@edenred.com.br', senha: 'consultor123', tipo: 'Consultor' }
      ]
    };

  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
    throw error;
  }
};

export default inicializarSistema;
