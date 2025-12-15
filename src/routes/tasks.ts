import { Hono } from 'hono'
import { createDb } from '../db'
import { tasks } from '../db/schema'
import { eq, desc, and } from 'drizzle-orm'

const app = new Hono()

app.get('/', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.userId as string
  const db = createDb()

  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt))

  return c.json(result)
})

app.post('/', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.userId as string
  const body = await c.req.json<{ content: string }>()
  const db = createDb()

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      content: body.content,
    })
    .returning()

  return c.json(task, 201)
})

app.delete('/:id', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.userId as string
  const id = c.req.param('id')
  const db = createDb()

  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning()

  if (!deleted) {
    return c.json({ error: 'Task not found' }, 404)
  }

  return c.json({ message: 'Task deleted', id })
})

export default app
