import fs from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const p = path.join(process.cwd(), 'references', 'edge-devices-status.json')
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: 'failed to read data' })
  }
}
