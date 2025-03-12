import request from 'supertest';
import { app } from './testServer';
import { registerUserAndGetToken } from './authUtils';
import Topic from '../models/Topic';

// Prefixo "02-" para garantir que este teste seja executado após os testes de autenticação

describe('Temas', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Registrar um usuário para os testes
    const auth = await registerUserAndGetToken();
    token = auth.token;
    userId = auth.userId;
  });

  describe('POST /api/topics', () => {
    it('deve criar um novo tema quando autenticado', async () => {
      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Tema de Teste',
          description: 'Descrição do tema de teste',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Tema de Teste');
      expect(response.body.data.description).toBe('Descrição do tema de teste');
      expect(response.body.data.user.toString()).toBe(userId);

      // Verificar se o tema foi criado no banco de dados
      const topic = await Topic.findById(response.body.data._id);
      expect(topic).not.toBeNull();
      expect(topic?.title).toBe('Tema de Teste');
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      const response = await request(app)
        .post('/api/topics')
        .send({
          title: 'Tema Sem Autenticação',
          description: 'Este tema não deve ser criado',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 quando dados estão incompletos', async () => {
      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Tema Incompleto',
          // Faltando descrição
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/topics', () => {
    it('deve retornar todos os temas', async () => {
      // Criar alguns temas para o teste
      await Topic.create({
        title: 'Tema 1',
        description: 'Descrição do tema 1',
        user: userId,
      });

      await Topic.create({
        title: 'Tema 2',
        description: 'Descrição do tema 2',
        user: userId,
      });

      const response = await request(app).get('/api/topics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/topics/:id', () => {
    it('deve retornar um tema específico', async () => {
      // Criar um tema para o teste
      const topic = await Topic.create({
        title: 'Tema Específico',
        description: 'Descrição do tema específico',
        user: userId,
      });

      const response = await request(app).get(`/api/topics/${topic._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(topic._id.toString());
      expect(response.body.data.title).toBe('Tema Específico');
    });

    it('deve retornar erro 404 quando o tema não existe', async () => {
      const response = await request(app).get('/api/topics/60f1b5b5b5b5b5b5b5b5b5b5');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/topics/:id/vote', () => {
    let topicId: string;

    beforeEach(async () => {
      // Criar um tema para os testes de votação
      const topic = await Topic.create({
        title: 'Tema para Votação',
        description: 'Descrição do tema para votação',
        user: userId,
      });

      topicId = topic._id.toString();
    });

    it('deve permitir votar em um tema quando autenticado', async () => {
      const response = await request(app)
        .post(`/api/topics/${topicId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          value: 'up',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.voteCount.up).toBe(1);
      expect(response.body.data.voteCount.down).toBe(0);
      expect(response.body.data.voteCount.total).toBe(1);

      // Verificar se o voto foi registrado no banco de dados
      const topic = await Topic.findById(topicId);
      expect(topic?.votes.length).toBe(1);
      expect(topic?.votes[0].user.toString()).toBe(userId);
      expect(topic?.votes[0].value).toBe('up');
    });

    it('deve substituir o voto anterior se o usuário já votou', async () => {
      // Primeiro voto (up)
      await request(app)
        .post(`/api/topics/${topicId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          value: 'up',
        });

      // Segundo voto (down) - deve substituir o primeiro
      const response = await request(app)
        .post(`/api/topics/${topicId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          value: 'down',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.voteCount.up).toBe(0);
      expect(response.body.data.voteCount.down).toBe(1);
      expect(response.body.data.voteCount.total).toBe(-1);

      // Verificar se apenas um voto foi registrado
      const topic = await Topic.findById(topicId);
      expect(topic?.votes.length).toBe(1);
      expect(topic?.votes[0].value).toBe('down');
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      const response = await request(app)
        .post(`/api/topics/${topicId}/vote`)
        .send({
          value: 'up',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 quando o valor do voto é inválido', async () => {
      const response = await request(app)
        .post(`/api/topics/${topicId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          value: 'invalid',
        });

      expect(response.status).toBe(400);
    });
  });
});