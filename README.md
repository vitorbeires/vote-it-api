# Vote-It API

API backend para a rede social Vote-It - Uma plataforma para criar e votar em temas.

## Tecnologias

- Node.js
- Express
- TypeScript
- MongoDB
- JWT para autenticação
- Swagger para documentação da API

## Funcionalidades

- Autenticação de usuários (registro e login)
- Criação de temas para votação
- Sistema de votação (up/down) com controle para que cada usuário vote apenas uma vez
- Sistema de comentários e respostas a comentários

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/vitorbeires/vote-it-api.git
cd vote-it-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/vote-it
# JWT_SECRET=seu_segredo_jwt
# JWT_EXPIRE=30d

# Executar em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar em produção
npm start

# Executar testes
npm test
```

## Documentação da API

A documentação da API está disponível em `/api-docs` quando o servidor estiver em execução.

## Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar um novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter usuário atual (autenticado)

### Temas
- `POST /api/topics` - Criar um novo tema (autenticado)
- `GET /api/topics` - Obter todos os temas
- `GET /api/topics/:id` - Obter um tema específico
- `POST /api/topics/:id/vote` - Votar em um tema (autenticado)

### Comentários
- `POST /api/topics/:topicId/comments` - Adicionar um comentário a um tema (autenticado)
- `GET /api/topics/:topicId/comments` - Obter comentários de um tema
- `POST /api/comments/:commentId/replies` - Adicionar uma resposta a um comentário (autenticado)
- `GET /api/comments/:commentId/replies` - Obter respostas de um comentário