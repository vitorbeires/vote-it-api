import request from 'supertest';
import { app } from './testServer';
import User from '../models/User';

// Prefixo "01-" para garantir que este teste seja executado primeiro

describe('Autenticação', () => {
  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário e retornar um token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuário Teste',
          email: 'teste@example.com',
          password: 'senha123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();

      // Verificar se o usuário foi criado no banco de dados
      const user = await User.findOne({ email: 'teste@example.com' });
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Usuário Teste');
    });
  });
});