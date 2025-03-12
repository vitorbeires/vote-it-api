import express from 'express';
import { check } from 'express-validator';
import {
  createTopic,
  getTopics,
  getTopic,
  voteTopic,
} from '../controllers/topics';
import { getComments, addComment } from '../controllers/comments';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Obter todos os temas
 *     tags: [Temas]
 *     responses:
 *       200:
 *         description: Lista de temas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Número de temas
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Criar um novo tema
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Cria um novo tema para votação.
 *       
 *       **Requer autenticação:** Sim
 *       
 *       **Header de autenticação:**
 *       - Authorization: Bearer {token}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do tema
 *               description:
 *                 type: string
 *                 description: Descrição do tema
 *     responses:
 *       201:
 *         description: Tema criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
  .route('/')
  .get(getTopics)
  .post(
    [
      check('title', 'Título é obrigatório').not().isEmpty(),
      check('description', 'Descrição é obrigatória').not().isEmpty(),
    ],
  protect,
  createTopic
  );

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     summary: Obter um tema específico
 *     tags: [Temas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tema
 *     responses:
 *       200:
 *         description: Detalhes do tema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Tema não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id').get(getTopic);

/**
 * @swagger
 * /api/topics/{id}/vote:
 *   post:
 *     summary: Votar em um tema
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Registra um voto (positivo ou negativo) em um tema.
 *       
 *       **Requer autenticação:** Sim
 *       
 *       **Header de autenticação:**
 *       - Authorization: Bearer {token}
 *       
 *       Se o usuário já votou no tema, o voto anterior será substituído pelo novo.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 enum: [up, down]
 *                 description: Valor do voto (up ou down)
 *     responses:
 *       200:
 *         description: Voto registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tema não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/vote',
  [check('value', 'Valor do voto é obrigatório').not().isEmpty()],
  protect,
  voteTopic
);

/**
 * @swagger
 * /api/topics/{topicId}/comments:
 *   get:
 *     summary: Obter comentários de um tema
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tema
 *     responses:
 *       200:
 *         description: Lista de comentários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Número de comentários
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Adicionar um comentário a um tema
 *     tags: [Comentários]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Adiciona um comentário a um tema específico.
 *       
 *       **Requer autenticação:** Sim
 *       
 *       **Header de autenticação:**
 *       - Authorization: Bearer {token}
 *     parameters:
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Conteúdo do comentário
 *     responses:
 *       201:
 *         description: Comentário adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tema não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
  .route('/:topicId/comments')
  .get(getComments)
  .post(
    [check('content', 'Conteúdo é obrigatório').not().isEmpty()],
    protect,
    addComment
  );

export default router;