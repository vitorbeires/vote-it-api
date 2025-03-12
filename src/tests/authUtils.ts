import request from 'supertest';
import { app } from './testServer';

// Função para registrar um usuário e obter o token
export const registerUserAndGetToken = async (
  name: string = 'Usuário Teste',
  email: string = 'teste@example.com',
  password: string = 'senha123'
): Promise<{ token: string; userId: string }> => {
  // Registrar o usuário
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name,
      email,
      password,
    });

  const token = registerResponse.body.token;

  // Obter o ID do usuário
  const userResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  const userId = userResponse.body.data._id;

  return { token, userId };
};