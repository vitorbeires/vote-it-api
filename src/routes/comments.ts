import express from 'express';
import { check } from 'express-validator';
import { addReply, getReplies } from '../controllers/comments';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   get:
 *     summary: Obter respostas de um comentário
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Lista de respostas
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
 *                   description: Número de respostas
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
 *     summary: Adicionar uma resposta a um comentário
 *     tags: [Comentários]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Adiciona uma resposta a um comentário existente.
 *       
 *       **Requer autenticação:** Sim
 *       
 *       **Header de autenticação:**
 *       - Authorization: Bearer {token}
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do comentário
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
 *                 description: Conteúdo da resposta
 *     responses:
 *       201:
 *         description: Resposta adicionada com sucesso
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
 *         description: Comentário não encontrado
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
  .route('/:commentId/replies')
  .get(getReplies)
  .post(
    [check('content', 'Conteúdo é obrigatório').not().isEmpty()],
    protect,
    addReply
  );

export default router;