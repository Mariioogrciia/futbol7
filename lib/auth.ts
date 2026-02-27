import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

export interface TokenPayload {
  userId: string;
  email: string;
  rol: 'admin' | 'equipo' | 'espectador';
}

export function createToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
