import fs from 'fs'
import path from 'path'
import type { GetServerSideProps } from 'next'
import React, { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import DeviceList from '../components/DeviceList'

type Device = any

function normalizeExcelDevice(row: Record<string, any>) {
  const country = row.Country || row.Location || ''
  const osVersion = row['OS Version'] || (row.OS ? String(row.OS).replace(/^EVE\s+/, '') : '')

  return {
    ...row,
    serial: row.serial || row.Serial || '',
    title: row.title || row.Title || '',
    name: row.name || row.Name || '',
    project: row.project || row.Project || '',
    conn_mode: row.conn_mode || row['Conn Mode'] || '',
    ip: row.ip || row.IP || '',
    rig: row.rig || { code: row.Rig || '' },
    location: row.location || { country_code: country },
    cloud_status: row.cloud_status || { run_state: row.State || '' },
    hypervisor: row.hypervisor || { os_version: osVersion }
  }
}

export default function Home({ devices }: { devices: Device[] }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('All')
  const [project, setProject] = useState('All')
  const [state, setState] = useState('All')

  const countries = useMemo(() => {
    const s = new Set<string>()
    devices.forEach((d: Device) => s.add(d.location?.country_code || ''))
    return ['All', ...Array.from(s).filter(Boolean).sort()]
  }, [devices])

  const projects = useMemo(() => {
    const s = new Set<string>()
    devices.forEach((d: Device) => s.add(d.project || d.project_ext_id || ''))
    return ['All', ...Array.from(s).filter(Boolean).sort()]
  }, [devices])

  const states = useMemo(() => {
    const s = new Set<string>()
    devices.forEach((d: Device) => s.add(d.cloud_status?.run_state || ''))
    return ['All', ...Array.from(s).filter(Boolean).sort()]
  }, [devices])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const isList = q.includes(',')
    const tokens = isList
      ? q
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    return devices.filter((d: Device) => {
      if (country !== 'All' && (d.location?.country_code || '') !== country) return false
      if (project !== 'All' && (d.project || d.project_ext_id || '') !== project) return false
      if (state !== 'All' && (d.cloud_status?.run_state || '') !== state) return false
      if (!q) return true

      // If query is a comma-separated list, match serial against any token (exact or substring)
      if (isList) {
        const serial = (d.serial || '').toLowerCase()
        return tokens.some((t) => serial === t || serial.includes(t))
      }

      return (
        (d.serial || '').toLowerCase().includes(q) ||
        (d.name || '').toLowerCase().includes(q) ||
        (d.title || '').toLowerCase().includes(q) ||
        (d.ip || '').toLowerCase().includes(q) ||
        (d.rig?.code || '').toLowerCase().includes(q)
      )
    })
  }, [devices, query, country, project, state])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Edge Devices Dashboard</h1>
        <p className="text-sm text-white">Overview of devices from the repository references.</p>
      </header>

      <section className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search serial, name, title, IP, or rig"
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-400"
        />

        <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white">
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={project} onChange={(e) => setProject(e.target.value)} className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white">
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white">
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      <section className="mb-6">
        <label className="inline-flex items-center space-x-2">
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Import JSON
          </button>
          <button
            onClick={() => document.getElementById('excel-file-input')?.click()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Import Excel
          </button>
          <button
            onClick={() => {
              try {
                const headers = ['serial', 'title', 'project', 'country', 'ip', 'state', 'os_version', 'conn_mode', 'rig_code']
                const lines = [headers.join(',')]
                filtered.forEach((d: Device) => {
                  const row = [
                    d.serial || '',
                    d.title || d.name || '',
                    d.project || d.project_ext_id || '',
                    d.location?.country_code || '',
                    d.ip || '',
                    d.cloud_status?.run_state || '',
                    d.hypervisor?.os_version || '',
                    d.conn_mode || '',
                    d.rig?.code || ''
                  ].map((v) => {
                    const s = String(v).replace(/"/g, '""')
                    return '"' + s + '"'
                  })
                  lines.push(row.join(','))
                })
                const csv = lines.join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'edge-devices-export.csv'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              } catch (err) {
                alert('Export failed: ' + String(err))
              }
            }}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export to Excel (CSV)
          </button>
          <input
            id="file-input"
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              if (!confirm('Replace current `edge-devices-status.json` with the selected file?')) return
              try {
                const txt = await f.text()
                const parsed = JSON.parse(txt) // validate
                const res = await fetch('/api/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(parsed)
                })
                if (!res.ok) throw new Error(await res.text())
                alert('Import successful — reloading page')
                window.location.reload()
              } catch (err: any) {
                alert('Import failed: ' + (err?.message || String(err)))
              }
            }}
          />
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              if (!confirm('Replace current `edge-devices-status.json` with the first worksheet from the selected Excel file?')) return

              try {
                const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
                const sheetName = workbook.SheetNames.includes('Devices')
                  ? 'Devices'
                  : workbook.SheetNames[0]
                const deviceSheet = workbook.Sheets[sheetName]
                const detailRows = workbook.Sheets['Device Details']
                  ? XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets['Device Details'], { defval: '' })
                  : []
                const detailsBySerial = new Map(
                  detailRows.map((row) => [row.Serial || row.serial, row])
                )
                const devices = deviceSheet
                  ? XLSX.utils
                      .sheet_to_json<Record<string, any>>(deviceSheet, { defval: '' })
                      .map((row) => normalizeExcelDevice({
                        ...(detailsBySerial.get(row.Serial || row.serial) || {}),
                        ...row
                      }))
                  : []

                if (!devices.length) throw new Error('The selected worksheet does not contain any data rows')

                const res = await fetch('/api/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ devices })
                })
                if (!res.ok) throw new Error(await res.text())
                alert('Excel import successful - reloading page')
                window.location.reload()
              } catch (err: any) {
                alert('Excel import failed: ' + (err?.message || String(err)))
              }
            }}
          />
          <span className="text-sm text-white">Upload JSON or Excel to replace the references data.</span>
        </label>
      </section>

      <DeviceList devices={filtered} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const p = path.join(process.cwd(), 'data', '190826_edge_Devices.json')
  let devices = []
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    devices = data.devices || []
  } catch (e) {
    console.error('Failed to read devices:', e)
  }
  return { props: { devices } }
}
