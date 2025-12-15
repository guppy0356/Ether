import { Hono } from 'hono'
import { renderer } from './renderer'
import { authMiddleware } from './middleware/auth'
import tasks from './routes/tasks'

const app = new Hono()

app.use(renderer)
app.use('/tasks', authMiddleware)
app.use('/tasks/*', authMiddleware)

app.route('/tasks', tasks)

export default app
