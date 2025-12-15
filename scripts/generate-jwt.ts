import { sign } from 'hono/jwt'
import env from '../src/env'

const userId = process.argv[2]

if (!userId) {
  console.error('Usage: npx tsx scripts/generate-jwt.ts <userId>')
  process.exit(1)
}

const payload = {
  userId,
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
}

const token = await sign(payload, env.JWT_SECRET)
console.log(token)
