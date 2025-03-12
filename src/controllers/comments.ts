import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Comment from '../models/Comment';
import Topic from '../models/Topic';

// @desc    Adicionar um comentário a um tema
// @route   POST /api/topics/:topicId/comments
// @access  Private
export const addComment = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const { topicId } = req.params;

    // Verificar se o tema existe
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Tema não encontrado',
      });
    }

    const comment = await Comment.create({
      content,
      user: req.user!.id,
      topic: topicId,
    });

    await comment.populate('user', 'name');

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};

// @desc    Adicionar uma resposta a um comentário
// @route   POST /api/comments/:commentId/replies
// @access  Private
export const addReply = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const { commentId } = req.params;

    // Verificar se o comentário pai existe
    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Comentário não encontrado',
      });
    }

    const reply = await Comment.create({
      content,
      user: req.user!.id,
      topic: parentComment.topic,
      parentComment: commentId,
    });

    await reply.populate('user', 'name');

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};

// @desc    Obter comentários de um tema
// @route   GET /api/topics/:topicId/comments
// @access  Public
export const getComments = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    // Obter comentários de nível superior (sem parentComment)
    const comments = await Comment.find({
      topic: topicId,
      parentComment: { $exists: false },
    })
  .populate('user', 'name')
  .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};

// @desc    Obter respostas de um comentário
// @route   GET /api/comments/:commentId/replies
// @access  Public
export const getReplies = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({
      parentComment: commentId,
    })
  .populate('user', 'name')
  .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};