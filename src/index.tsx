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

/**
 * Ref (ブランチのポインタ) を更新する
 * git push の最後に呼ばれる
 * PUT /refs/heads/main -> Body: "abc1234..."
 */
app.put('/refs/*', async (c) => {
  // パスの先頭の "/" を取ってキーにする (例: "refs/heads/main")
  const key = c.req.path.replace(/^\//, '')
  const hash = await c.req.text()

  console.log(`Updating ref: ${key} -> ${hash}`)
  await c.env.packfiles.put(key, hash)

  return c.text('OK')
})

/**
 * Ref を取得する
 * git pull (list) のときに呼ばれる
 * GET /refs/heads/main -> Body: "abc1234..."
 */
app.get('/refs/*', async (c) => {
  const key = c.req.path.replace(/^\//, '')
  const obj = await c.env.packfiles.get(key)

  if (!obj) {
    return c.text('Not Found', 404)
  }
  return new Response(obj.body)
})

/**
 * マニフェスト取得 (Clone/Pull 用)
 * 現在の Refs 一覧と、存在する全 Packfile のリストを返す
 */
app.get('/manifest', async (c) => {
  // 1. Refs (ブランチ) を列挙
  const refsList = await c.env.packfiles.list({ prefix: 'refs/' })
  const refs: Record<string, string> = {}

  // 各Refの中身（ハッシュ）を読み出す
  // ※ 本来は並列化すべきですが、PoCなので直列で書きます
  for (const obj of refsList.objects) {
    const file = await c.env.packfiles.get(obj.key)
    if (file) {
      const hash = await file.text()
      // "refs/heads/main" のようなキーでハッシュを格納
      refs[obj.key] = hash.trim()
    }
  }

  // 2. Packfiles (データ) を列挙
  const packsList = await c.env.packfiles.list({ prefix: 'objects/pack/' })
  const packs = packsList.objects.map(o => o.key)

  return c.json({ refs, packs })
})

export default app
