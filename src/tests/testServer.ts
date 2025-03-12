import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth';
import topicRoutes from '../routes/topics';
import commentRoutes from '../routes/comments';

// Criar uma instância do Express para testes
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/comments', commentRoutes);

export { app };