import { jwt } from 'hono/jwt'
import env from '../env'

export const authMiddleware = jwt({
  secret: env.JWT_SECRET,
})
