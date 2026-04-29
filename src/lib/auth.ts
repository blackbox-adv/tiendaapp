import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('[AUTH] FATAL: JWT_SECRET environment variable is not set. Server cannot start securely.')
}
const JWT_EXPIRES_IN = '7d'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JwtPayload): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not configured')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload | null {
  if (!JWT_SECRET) return null
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// Helper to extract token from Authorization header
export function getTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}

// Middleware helper - call at start of every protected API route
// Returns { user, error, status }
export function authenticateRequest(request: Request): { user: JwtPayload; error: null } | { user: null; error: string; status: number } {
  const token = getTokenFromHeader(request)
  if (!token) {
    return { user: null, error: 'Token de autenticación requerido', status: 401 }
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    return { user: null, error: 'Token inválido o expirado', status: 401 }
  }
  
  return { user: payload, error: null }
}

// Role-based authorization
export function requireRole(user: JwtPayload, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}
