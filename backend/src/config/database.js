// Este arquivo configura a conexão com o banco de dados PostgreSQL usando Sequelize.
// Sequelize é um ORM (Object-Relational Mapping) para Node.js que facilita a interação com bancos SQL.
// Aqui, definimos a configuração da conexão, incluindo credenciais, host, porta e opções de pool.

import { Sequelize } from 'sequelize'; // Importa a classe Sequelize para gerenciar a conexão e modelos
import dotenv from 'dotenv'; // Carrega variáveis de ambiente do arquivo .env

dotenv.config(); // Carrega as variáveis de ambiente (como DB_NAME, DB_USER, etc.)

let sequelize; // Variável global para armazenar a instância do Sequelize

// Função assíncrona para conectar ao banco de dados
const connectDatabase = async () => {
  try {
    // Cria uma nova instância do Sequelize com as configurações do PostgreSQL
    sequelize = new Sequelize(
      process.env.DB_NAME || 'cnpj_consultation', // Nome do banco (padrão: 'cnpj_consultation')
      process.env.DB_USER || 'postgres', // Usuário do banco (padrão: 'postgres')
      process.env.DB_PASSWORD || 'password', // Senha do banco (padrão: 'password')
      {
        host: process.env.DB_HOST || 'localhost', // Host do banco (padrão: 'localhost')
        port: process.env.DB_PORT || 5432, // Porta do PostgreSQL (padrão: 5432)
        dialect: 'postgres', // Dialeto do banco (PostgreSQL)
        logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log de queries apenas em desenvolvimento
        pool: { // Configurações do pool de conexões para otimizar performance
          max: 5, // Máximo de conexões simultâneas
          min: 0, // Mínimo de conexões ociosas
          acquire: 30000, // Tempo máximo para adquirir uma conexão (ms)
          idle: 10000 // Tempo máximo que uma conexão pode ficar ociosa (ms)
        }
      }
    );

    // Testa a conexão com o banco
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado'); // Confirmação de conexão bem-sucedida

    // Sincroniza os modelos com o banco (cria/altera tabelas se necessário)
    // 'alter: true' em desenvolvimento permite alterações automáticas nas tabelas
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Tabelas sincronizadas'); // Confirmação de sincronização

    // Listener para o sinal SIGINT (Ctrl+C) para fechar a conexão graciosamente
    process.on('SIGINT', async () => {
      await sequelize.close(); // Fecha a conexão
      console.log('🔒 Conexão PostgreSQL fechada devido ao encerramento da aplicação');
      process.exit(0); // Encerra o processo
    });

  } catch (error) {
    // Em caso de erro na conexão ou sincronização
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    process.exit(1); // Encerra o processo com erro
  }
};

// Exporta a instância do Sequelize para uso em outros arquivos
export { sequelize };
// Exporta a função de conexão como padrão
export default connectDatabase;
