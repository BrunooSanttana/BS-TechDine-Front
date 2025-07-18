const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize('bj_tech_dine', 'postgres', 'admin', {
  host: '127.0.0.1',
  dialect: 'postgres',
});

// Teste de conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão bem-sucedida com o banco de dados!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
  }
}

testConnection();
