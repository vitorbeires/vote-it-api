import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vote-It API',
      version: '1.0.0',
      description: `
    # API para a rede social Vote-It
    
    Esta API permite que usuários criem temas para votação, votem em temas existentes e comentem.
    
    ## Autenticação
    
    A maioria dos endpoints requer autenticação via token JWT.
    
    Para obter um token:
    1. Registre-se usando o endpoint \`POST /api/auth/register\`
    2. Faça login usando o endpoint \`POST /api/auth/login\`
    
    Ambos os endpoints retornarão um token JWT que deve ser incluído no header de autorização das requisições subsequentes:
    
    \`\`\`
    Authorization: Bearer seu_token_jwt
    \`\`\`
    
    Os endpoints que requerem autenticação estão marcados com um cadeado 🔒 na documentação.
  `,
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login ou registro. Formato: Bearer {token}',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID do usuário gerado automaticamente',
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário (único)',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário (mínimo 6 caracteres)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização do usuário',
            },
          },
        },
        Topic: {
          type: 'object',
          required: ['title', 'description', 'user'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID do tema gerado automaticamente',
            },
            title: {
              type: 'string',
              description: 'Título do tema',
            },
            description: {
              type: 'string',
              description: 'Descrição do tema',
            },
            user: {
              type: 'string',
              description: 'ID do usuário que criou o tema',
            },
            votes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: {
                    type: 'string',
                    description: 'ID do usuário que votou',
                  },
                  value: {
                    type: 'string',
                    enum: ['up', 'down'],
                    description: 'Valor do voto (up ou down)',
                  },
                },
              },
            },
            voteCount: {
              type: 'object',
              properties: {
                up: {
                  type: 'number',
                  description: 'Número de votos positivos',
                },
                down: {
                  type: 'number',
                  description: 'Número de votos negativos',
                },
                total: {
                  type: 'number',
                  description: 'Total de votos (up - down)',
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do tema',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização do tema',
            },
          },
        },
        Comment: {
          type: 'object',
          required: ['content', 'user', 'topic'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID do comentário gerado automaticamente',
            },
            content: {
              type: 'string',
              description: 'Conteúdo do comentário',
            },
            user: {
              type: 'string',
              description: 'ID do usuário que fez o comentário',
            },
            topic: {
              type: 'string',
              description: 'ID do tema ao qual o comentário pertence',
            },
            parentComment: {
              type: 'string',
              description: 'ID do comentário pai (se for uma resposta)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do comentário',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização do comentário',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Mensagem de erro',
            },
          },
        },
      },
      parameters: {
        authorizationHeader: {
          name: 'Authorization',
          in: 'header',
          description: 'Token JWT para autenticação. Formato: Bearer {token}',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  // Adicionar informações sobre autenticação na página inicial do Swagger
  const swaggerOptions = {
    customSiteTitle: 'Vote-It API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    }
  };
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
};