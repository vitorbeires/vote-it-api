import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { setupSwagger } from './swagger';

// Rotas
import authRoutes from './routes/auth';
import topicRoutes from './routes/topics';
import commentRoutes from './routes/comments';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.log('Erro ao conectar ao MongoDB:', err));

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Configurar Swagger
setupSwagger(app);

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
});