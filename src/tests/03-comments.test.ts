import request from 'supertest';
import { app } from './testServer';
import { registerUserAndGetToken } from './authUtils';
import Topic from '../models/Topic';
import Comment from '../models/Comment';

// Prefixo "03-" para garantir que este teste seja executado após os testes de temas

describe('Comentários', () => {
  let token: string;
  let userId: string;
  let topicId: string;

  beforeAll(async () => {
    // Registrar um usuário para os testes
    const auth = await registerUserAndGetToken();
    token = auth.token;
    userId = auth.userId;

    // Criar um tema para os testes de comentários
    const topic = await Topic.create({
      title: 'Tema para Comentários',
      description: 'Descrição do tema para comentários',
      user: userId,
    });

    topicId = topic._id.toString();
  });

  describe('POST /api/topics/:topicId/comments', () => {
    it('deve adicionar um comentário a um tema quando autenticado', async () => {
      const response = await request(app)
        .post(`/api/topics/${topicId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Este é um comentário de teste',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Este é um comentário de teste');
      expect(response.body.data.user._id).toBe(userId);
      expect(response.body.data.topic).toBe(topicId);

      // Verificar se o comentário foi criado no banco de dados
      const comment = await Comment.findById(response.body.data._id);
      expect(comment).not.toBeNull();
      expect(comment?.content).toBe('Este é um comentário de teste');
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      const response = await request(app)
        .post(`/api/topics/${topicId}/comments`)
        .send({
          content: 'Este comentário não deve ser criado',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 quando o conteúdo está vazio', async () => {
      const response = await request(app)
        .post(`/api/topics/${topicId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/topics/:topicId/comments', () => {
    it('deve retornar todos os comentários de um tema', async () => {
      // Criar alguns comentários para o teste
      await Comment.create({
        content: 'Comentário 1',
        user: userId,
        topic: topicId,
      });

      await Comment.create({
        content: 'Comentário 2',
        user: userId,
        topic: topicId,
      });

      const response = await request(app).get(`/api/topics/${topicId}/comments`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/comments/:commentId/replies', () => {
    let commentId: string;

    beforeEach(async () => {
      // Criar um comentário para os testes de respostas
      const comment = await Comment.create({
        content: 'Comentário para respostas',
        user: userId,
        topic: topicId,
      });

      commentId = comment._id.toString();
    });

    it('deve adicionar uma resposta a um comentário quando autenticado', async () => {
      const response = await request(app)
        .post(`/api/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Esta é uma resposta de teste',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Esta é uma resposta de teste');
      expect(response.body.data.user._id).toBe(userId);
      expect(response.body.data.parentComment).toBe(commentId);

      // Verificar se a resposta foi criada no banco de dados
      const reply = await Comment.findById(response.body.data._id);
      expect(reply).not.toBeNull();
      expect(reply?.content).toBe('Esta é uma resposta de teste');
      expect(reply?.parentComment?.toString()).toBe(commentId);
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      const response = await request(app)
        .post(`/api/comments/${commentId}/replies`)
        .send({
          content: 'Esta resposta não deve ser criada',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/comments/:commentId/replies', () => {
    let commentId: string;

    beforeAll(async () => {
      // Criar um comentário para os testes de respostas
      const comment = await Comment.create({
        content: 'Comentário para listar respostas',
        user: userId,
        topic: topicId,
      });

      commentId = comment._id.toString();

      // Criar algumas respostas para o teste
      await Comment.create({
        content: 'Resposta 1',
        user: userId,
        topic: topicId,
        parentComment: commentId,
      });

      await Comment.create({
        content: 'Resposta 2',
        user: userId,
        topic: topicId,
        parentComment: commentId,
      });
    });

    it('deve retornar todas as respostas de um comentário', async () => {
      const response = await request(app).get(`/api/comments/${commentId}/replies`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});