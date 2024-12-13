import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Add user to request for use in route handlers
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: `Authentication failed: ${JSON.stringify(error)}` });
  }
};
