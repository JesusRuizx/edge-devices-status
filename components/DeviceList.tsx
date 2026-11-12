import React, { useEffect, useState } from 'react'

type Device = any
type SortKey = 'serial' | 'state' | 'title' | 'rdVersion' | 'ip' | 'project' | 'country'
const PAGE_SIZE = 50

export default function DeviceList({ devices }: { devices: Device[] }) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'serial', direction: 'asc' })

  const getState = (device: Device) => device.cloud_status?.run_state || device.run_state || device.State || ''
  const getRdVersion = (device: Device) => device['RD Version'] || device.product_rd || device.deployed_products?.items?.find((product: Device) => product.name === 'RD')?.ver || ''
  const getSortValue = (device: Device, key: SortKey) => {
    switch (key) {
      case 'serial': return device.serial || ''
      case 'state': return getState(device)
      case 'title': return device.title || device.name || ''
      case 'rdVersion': return getRdVersion(device)
      case 'ip': return device.ip || ''
      case 'project': return device.project || device.project_ext_id || ''
      case 'country': return device.location?.country_code || ''
    }
  }

  const sortedDevices = [...devices].sort((left, right) => {
    const leftValue = getSortValue(left, sort.key)
    const rightValue = getSortValue(right, sort.key)
    const leftNumber = Number(leftValue)
    const rightNumber = Number(rightValue)
    const comparison = leftValue !== '' && rightValue !== '' && Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
      ? leftNumber - rightNumber
      : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' })
    return sort.direction === 'asc' ? comparison : -comparison
  })
  const pageCount = Math.max(1, Math.ceil(sortedDevices.length / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const visibleDevices = sortedDevices.slice(startIndex, startIndex + PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [devices, sort])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const getStateDotClass = (state: string) => {
    switch (state.toLowerCase()) {
      case 'suspect':
        return 'bg-orange-500'
      case 'online':
        return 'bg-green-500'
      case 'provisioned':
        return 'bg-purple-500'
      case 'unspecified':
      case 'unpecified':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const sortColumn = (key: SortKey) => {
    setSort((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const columnHeader = (key: SortKey, label: string) => (
    <th className="px-4 py-2 text-left text-sm font-medium text-white">
      <button
        type="button"
        onClick={() => sortColumn(key)}
        className="inline-flex items-center gap-1 text-white"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {sort.key === key && <span aria-hidden="true">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  )

  return (
    <div className="overflow-hidden rounded-md bg-black shadow">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            {columnHeader('serial', 'Serial')}
            {columnHeader('state', 'State')}
            {columnHeader('title', 'Title')}
            {columnHeader('rdVersion', 'RD Version')}
            {columnHeader('ip', 'IP')}
            {columnHeader('project', 'Project')}
            {columnHeader('country', 'Country')}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-black">
          {visibleDevices.map((d: Device) => (
            <tr key={d.serial} className="hover:bg-gray-800">
              <td className="px-4 py-3 text-sm text-white">{d.serial}</td>
              <td className="px-4 py-3 text-sm text-white">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${getStateDotClass(getState(d))}`} />
                  {getState(d) || '-'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-white">{d.title || d.name}</td>
              <td className="px-4 py-3 text-sm text-white">
                {getRdVersion(d) || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-white">{d.ip || '-'}</td>
              <td className="px-4 py-3 text-sm text-white">{d.project || d.project_ext_id}</td>
              <td className="px-4 py-3 text-sm text-white">{d.location?.country_code || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {devices.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 text-white">
          <span className="text-sm text-white">
            Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, devices.length)} of {devices.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page === 1}
              className="rounded-md border border-gray-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-white">Page {page} of {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page === pageCount}
              className="rounded-md border border-gray-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
