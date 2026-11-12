import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const body = req.body
    // validate basic structure
    if (!body || typeof body !== 'object') {
      return res.status(400).send('Invalid JSON body')
    }

    const outPath = path.join(process.cwd(), 'data', '190826_edge_Devices.json')
    fs.writeFileSync(outPath, JSON.stringify(body, null, 2), 'utf8')
    return res.status(200).json({ ok: true, path: outPath })
  } catch (e: any) {
    console.error('Import failed:', e)
    return res.status(500).send(String(e?.message || e))
  }
}
