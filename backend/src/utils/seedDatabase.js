import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import UserModel from '../models/User.js';
import CompanyModel from '../models/Company.js';
import bcrypt from 'bcryptjs';

// Configurar ambiente
dotenv.config();

// Dados de exemplo para empresas
const companiesData = [
  {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'ANTONIO DISTRIBUIÇÃO LTDA',
    nomeFantasia: 'Antonio Distribuidora',
    situacao: 'ATIVA',
    porte: 'MEDIO',
    capitalSocial: 500000,
    naturezaJuridica: 'Sociedade Empresária Limitada',
    dataAbertura: '2010-01-15T00:00:00.000Z',
    addressStreet: 'Rua das Flores',
    addressNumber: '123',
    addressComplement: '',
    addressNeighborhood: 'Centro',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZipCode: '01234-567',
    contactPhone: '(11) 97463-2014',
    contactEmail: 'contato@antonio.com.br',
    cnaePrincipal: '4610-7/01',
    cnaePrincipalDescricao: 'Distribuição de Alimentos',
    lastUpdated: new Date()
  },
  {
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'ELIANE SERVIÇOS E CONSULTORIA LTDA',
    nomeFantasia: 'Eliane Consultoria',
    situacao: 'ATIVA',
    porte: 'EPP',
    capitalSocial: 100000,
    naturezaJuridica: 'Sociedade Empresária Limitada',
    dataAbertura: '2015-02-10T00:00:00.000Z',
    addressStreet: 'Av. Paulista',
    addressNumber: '456',
    addressComplement: 'Sala 301',
    addressNeighborhood: 'Bela Vista',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZipCode: '01310-100',
    contactPhone: '(11) 85642-2013',
    contactEmail: 'eliane@consultoria.com.br',
    cnaePrincipal: '7020-4/00',
    cnaePrincipalDescricao: 'Consultoria Empresarial',
    lastUpdated: new Date()
  },
  {
    cnpj: '11.222.333/0001-44',
    razaoSocial: 'LEA TECNOLOGIA E INOVAÇÃO S.A.',
    nomeFantasia: 'Lea Tech',
    situacao: 'ATIVA',
    porte: 'GRANDE',
    capitalSocial: 2000000,
    naturezaJuridica: 'Sociedade Anônima',
    dataAbertura: '2018-03-05T00:00:00.000Z',
    addressStreet: 'Rua do Ouvidor',
    addressNumber: '789',
    addressComplement: 'Andar 15',
    addressNeighborhood: 'Centro',
    addressCity: 'Rio de Janeiro',
    addressState: 'RJ',
    addressZipCode: '20040-020',
    contactPhone: '(21) 87547-3921',
    contactEmail: 'contato@leatech.com.br',
    cnaePrincipal: '6201-5/00',
    cnaePrincipalDescricao: 'Desenvolvimento de Software',
    lastUpdated: new Date()
  },
  {
    cnpj: '55.666.777/0001-88',
    razaoSocial: 'ERIC INDÚSTRIAS METALÚRGICAS LTDA',
    nomeFantasia: 'Eric Metais',
    situacao: 'SUSPENSA',
    porte: 'MEDIO',
    capitalSocial: 800000,
    naturezaJuridica: 'Sociedade Empresária Limitada',
    dataAbertura: '2012-04-12T00:00:00.000Z',
    addressStreet: 'Distrito Industrial',
    addressNumber: '1000',
    addressComplement: '',
    addressNeighborhood: 'Industrial',
    addressCity: 'Campinas',
    addressState: 'SP',
    addressZipCode: '13100-000',
    contactPhone: '(19) 99999-9999',
    contactEmail: 'eric@metalurgica.com.br',
    cnaePrincipal: '2511-0/00',
    cnaePrincipalDescricao: 'Metalurgia',
    lastUpdated: new Date()
  }
];

const seedDatabase = async () => {
  let sequelize;
  try {
    // Conectar ao PostgreSQL
    sequelize = new Sequelize(
      process.env.DB_NAME || 'cnpj_consultation',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    await sequelize.authenticate();
    console.log('✅ Conectado ao PostgreSQL para seed');

    // Inicializar modelos
    const User = UserModel(sequelize);
    const Company = CompanyModel(sequelize);

    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    // Obter o usuário teste para associar às empresas
    let user = await User.findOne({ where: { email: 'teste@edenred.com' } });

    if (!user) {
      // Criar usuário teste se não existir
      const hashedPassword = await bcrypt.hash('Test123456', 12);
      user = await User.create({
        name: 'Usuario Teste',
        email: 'teste@edenred.com',
        password: hashedPassword,
        role: 'user',
        preferences: {
          theme: 'light',
          notifications: true
        }
      });
      console.log('✅ Usuário teste criado');
    }

    // Limpar empresas existentes
    await Company.destroy({ where: {} });
    console.log('🗑️ Empresas existentes removidas');

    // Adicionar empresas de exemplo
    for (const companyData of companiesData) {
      await Company.create({
        ...companyData,
        addedBy: user.id
      });
    }

    console.log(`✅ ${companiesData.length} empresas de exemplo adicionadas`);
    console.log('🎉 Seed do banco de dados concluído com sucesso!');

    // Listar empresas criadas
    const companies = await Company.findAll({
      attributes: ['cnpj', 'razaoSocial', 'situacao']
    });
    console.log('\n📋 Empresas criadas:');
    companies.forEach(company => {
      console.log(`  - ${company.cnpj} | ${company.razaoSocial} | ${company.situacao}`);
    });

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    // Desconectar do banco
    if (sequelize) {
      await sequelize.close();
      console.log('\n✅ Desconectado do PostgreSQL');
    }
    process.exit(0);
  }
};

// Executar seed se chamado diretamente
if (process.argv[1].endsWith('seedDatabase.js')) {
  seedDatabase();
}

export default seedDatabase;
