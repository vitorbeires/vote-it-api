import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface DecodedToken {
  id: string;
}

// Estendendo a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obter token do header
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar se o token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota',
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as DecodedToken;

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota',
    });
  }
};