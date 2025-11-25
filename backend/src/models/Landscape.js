// Este arquivo define o modelo Landscape (Paisagem) para o Sequelize.
// Representa imagens de paisagens enviadas pelos usuários, com metadados, localização e interações sociais.

import { DataTypes } from 'sequelize'; // Tipos de dados do Sequelize

// Função que cria e retorna o modelo Landscape
const LandscapeModel = (sequelize) => {
  // Define o modelo Landscape com todas as colunas da tabela
  const Landscape = sequelize.define('Landscape', {
    // Chave primária auto-incrementada
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Título da imagem
    title: {
      type: DataTypes.STRING(200), // Até 200 caracteres
      allowNull: false, // Obrigatório
      validate: {
        notEmpty: { msg: 'Título é obrigatório' },
        len: [1, 200]
      }
    },
    // Descrição da imagem
    description: {
      type: DataTypes.STRING(1000), // Até 1000 caracteres
      allowNull: true // Opcional
    },
    // URL da imagem principal
    imageUrl: {
      type: DataTypes.STRING(500), // URL da imagem
      allowNull: false, // Obrigatório
      validate: {
        notEmpty: { msg: 'URL da imagem é obrigatória' }
      }
    },
    // ID público da imagem no serviço de armazenamento (ex: Cloudinary)
    imagePublicId: {
      type: DataTypes.STRING(255),
      allowNull: true // Opcional
    },
    // URL da thumbnail (miniatura)
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true // Opcional
    },
    // Nome do local onde a foto foi tirada
    locationName: {
      type: DataTypes.STRING(255),
      allowNull: true // Opcional
    },
    // Latitude da localização (coordenadas GPS)
    locationLatitude: {
      type: DataTypes.DECIMAL(10, 8), // Precisão de 8 casas decimais
      allowNull: true,
      validate: {
        min: -90, // Latitude varia de -90 a 90
        max: 90
      }
    },
    // Longitude da localização (coordenadas GPS)
    locationLongitude: {
      type: DataTypes.DECIMAL(11, 8), // Precisão de 8 casas decimais
      allowNull: true,
      validate: {
        min: -180, // Longitude varia de -180 a 180
        max: 180
      }
    },
    // País da localização
    locationCountry: {
      type: DataTypes.STRING(50),
      defaultValue: 'Brasil' // Padrão: Brasil
    },
    // Estado da localização
    locationState: {
      type: DataTypes.STRING(50),
      allowNull: true // Opcional
    },
    // Cidade da localização
    locationCity: {
      type: DataTypes.STRING(100),
      allowNull: true // Opcional
    },
    // Metadados - Tamanho do arquivo em bytes
    metadataFileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0 // Não pode ser negativo
      }
    },
    // Metadados - Largura da imagem em pixels
    metadataDimensionsWidth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0 // Não pode ser negativo
      }
    },
    // Metadados - Altura da imagem em pixels
    metadataDimensionsHeight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0 // Não pode ser negativo
      }
    },
    // Metadados - Formato da imagem
    metadataFormat: {
      type: DataTypes.ENUM('jpeg', 'jpg', 'png', 'webp', 'gif'),
      allowNull: true // Opcional
    },
    // Metadados EXIF da câmera (dados técnicos da foto)
    metadataExif: {
      type: DataTypes.JSON, // Armazena dados EXIF em JSON
      allowNull: true // Opcional
    },
    // Tags para categorização (array em JSON)
    tags: {
      type: DataTypes.JSON, // Array de strings
      defaultValue: [] // Padrão: array vazio
    },
    // Categoria da imagem
    category: {
      type: DataTypes.ENUM('landscape', 'urban', 'nature', 'architecture', 'portrait', 'abstract', 'other'),
      defaultValue: 'landscape' // Padrão: landscape
    },
    // Flag se a imagem é pública
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true // Padrão: pública
    },
    // Flag se a imagem é destaque
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Padrão: não destaque
    },
    // ID do usuário que fez upload (chave estrangeira)
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false, // Obrigatório
      references: { // Referência para tabela users
        model: 'users',
        key: 'id'
      }
    },
    // Lista de likes (array de objetos com user e data)
    likes: {
      type: DataTypes.JSON, // Array de objetos {user: id, likedAt: date}
      defaultValue: [] // Padrão: array vazio
    },
    // Lista de comentários (array de objetos)
    comments: {
      type: DataTypes.JSON, // Array de objetos {user: id, text, createdAt}
      defaultValue: [] // Padrão: array vazio
    },
    // Número de visualizações
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Padrão: 0 visualizações
      validate: {
        min: 0 // Não pode ser negativo
      }
    },
    // Status da imagem (active, inactive, pending, rejected)
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'rejected'),
      defaultValue: 'active' // Padrão: ativa
    }
  }, {
    // Configurações da tabela
    tableName: 'landscapes', // Nome da tabela no banco
    timestamps: true, // Adiciona createdAt e updatedAt
    indexes: [ // Índices para otimizar consultas
      { fields: ['title'] }, // Índice no título
      { fields: ['uploadedBy', 'createdAt'] }, // Índice composto por uploader e data
      { fields: ['category'] }, // Índice na categoria
      { fields: ['isPublic', 'status'] }, // Índice composto por público e status
      { fields: ['isFeatured'] }, // Índice nas imagens em destaque
      // { fields: ['tags'] }, // Removido por problemas de indexação JSON no PostgreSQL
      { fields: ['locationLatitude', 'locationLongitude'] } // Índice nas coordenadas GPS
    ]
  });

  // =================== MÉTODOS DE INSTÂNCIA ===================

  // Método para adicionar/remover like (toggle)
  Landscape.prototype.addLike = function(userId) {
    const likes = this.likes || []; // Obtém array de likes atual
    const existingLike = likes.find(like => like.user === userId); // Verifica se já deu like

    if (existingLike) {
      // Se já deu like, remove
      this.likes = likes.filter(like => like.user !== userId);
      return { action: 'removed', count: this.likes.length }; // Retorna ação e nova contagem
    } else {
      // Se não deu like, adiciona
      likes.push({ user: userId, likedAt: new Date() });
      this.likes = likes;
      return { action: 'added', count: this.likes.length }; // Retorna ação e nova contagem
    }
  };

  // Método para adicionar comentário
  Landscape.prototype.addComment = function(userId, text) {
    const comments = this.comments || []; // Obtém array de comentários atual
    comments.push({ // Adiciona novo comentário
      user: userId, // ID do usuário
      text, // Texto do comentário
      createdAt: new Date() // Data do comentário
    });
    this.comments = comments; // Atualiza array
    return comments[comments.length - 1]; // Retorna o comentário adicionado
  };

  // Método para incrementar visualização
  Landscape.prototype.incrementView = function() {
    this.views += 1; // Incrementa contador
    return this.save(); // Salva e retorna promise
  };

  // Retorna o modelo Landscape configurado
  return Landscape;
};

export default LandscapeModel;
