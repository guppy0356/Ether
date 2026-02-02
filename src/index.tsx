import { Hono } from 'hono'

// R2 のバインディング型定義
// wrangler.json の binding: "packfiles" に合わせる
type Bindings = {
  packfiles: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * アップロード用エンドポイント
 * usage: curl -X PUT --data-binary @file.pack https://.../upload/objects/pack/file.pack
 */
app.put('/upload/*', async (c) => {
  // URLのパスから先頭の /upload/ を削ってキー名にする
  // 例: "/upload/objects/pack/xxx.pack" -> "objects/pack/xxx.pack"
  const key = c.req.path.replace(/^\/upload\//, '')

  console.log(`[Start Upload] Key: ${key}`)

  const body = c.req.raw.body
  if (!body) {
    return c.json({ success: false, error: 'No body provided' }, 400)
  }

  try {
    // c.req.raw.body (ReadableStream) をそのまま R2 に流し込む
    await c.env.packfiles.put(key, body)

    return c.json({
      success: true,
      savedAs: key,
      message: 'File received and stored in R2'
    })
  } catch (err) {
    console.error(err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

/**
 * ダウンロード検証用エンドポイント
 * usage: curl -o file.pack https://.../file/objects/pack/file.pack
 */
app.get('/file/*', async (c) => {
  const key = c.req.path.replace(/^\/file\//, '')

  const object = await c.env.packfiles.get(key)

  if (!object) {
    return c.text('Not Found in R2', 404)
  }

  return new Response(object.body)
})

export default app
