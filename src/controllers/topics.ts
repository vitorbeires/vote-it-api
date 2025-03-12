import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Topic from '../models/Topic';

// @desc    Criar um novo tema
// @route   POST /api/topics
// @access  Private
export const createTopic = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description } = req.body;

    const topic = await Topic.create({
      title,
      description,
      user: req.user!.id,
    });

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};

// @desc    Obter todos os temas
// @route   GET /api/topics
// @access  Public
export const getTopics = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find().populate('user', 'name');

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};

// @desc    Obter um tema específico
// @route   GET /api/topics/:id
// @access  Public
export const getTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('user', 'name');

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Tema não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};

// @desc    Votar em um tema
// @route   POST /api/topics/:id/vote
// @access  Private
export const voteTopic = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { value } = req.body; // 'up' ou 'down'

    if (value !== 'up' && value !== 'down') {
      return res.status(400).json({
        success: false,
        error: 'O valor do voto deve ser "up" ou "down"',
      });
    }

    let topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Tema não encontrado',
      });
    }

    // Verificar se o usuário já votou neste tema
    const voteIndex = topic.votes.findIndex(
      (vote) => vote.user.toString() === req.user!.id
    );

    // Se o usuário já votou, remova o voto anterior
    if (voteIndex !== -1) {
      topic.votes.splice(voteIndex, 1);
    }

    // Adicionar o novo voto
    topic.votes.push({
      user: req.user!.id,
      value,
    });

    await topic.save();

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro no servidor',
    });
  }
};