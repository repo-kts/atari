import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Search, X } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/hooks/useAlert'
import {
  useCreateModuleImage,
  useModuleImageCategories,
  useModuleImageKvks,
  useModuleImages,
} from '@/hooks/useModuleImages'
import { API_BASE_URL } from '@/config/api'

const PAGE_SIZE = 10

function formatDate(value?: string | null): string {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toISOString().slice(0, 10)
}

function buildPagination(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

function getFileUrl(path: string): string {
  try {
    return new URL(path, API_BASE_URL).toString()
  } catch {
    return path
  }
}

async function downloadImage(downloadUrl: string, fileName?: string | null) {
  try {
    const url = getFileUrl(downloadUrl)
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error('Download failed')
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName || 'image'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(blobUrl)
  } catch {
    // Fallback: open in new tab
    window.open(getFileUrl(downloadUrl), '_blank')
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) {
        reject(new Error('Failed to read image file'))
        return
      }
      resolve(result)
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

interface UploadImage {
  id: string
  file: File
  previewBase64: string
  caption: string
}

export const ModuleImages: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeConfig = getRouteConfig(location.pathname)
  const breadcrumbs = getBreadcrumbsForPath(location.pathname)
  const isCreateMode = location.pathname === '/module-images/create'
  const { user, hasPermission } = useAuth()
  const { alert, AlertDialog } = useAlert()

  const canAdd = hasPermission('ADD', 'module_images')
  const shouldShowKvkFilter = user?.role !== 'kvk_admin' && user?.role !== 'kvk_user'

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const currentYear = new Date().getFullYear()
  const [selectedReportingYear, setSelectedReportingYear] = useState<number>(currentYear)
  const [selectedKvkId, setSelectedKvkId] = useState<string>('')
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [appliedReportingYear, setAppliedReportingYear] = useState<number>(currentYear)
  const [appliedKvkId, setAppliedKvkId] = useState<number | undefined>(undefined)
  const [appliedModuleId, setAppliedModuleId] = useState<number | undefined>(undefined)

  // create form state
  const [createDate, setCreateDate] = useState('')
  const [createModuleId, setCreateModuleId] = useState('')
  const [uploadImages, setUploadImages] = useState<UploadImage[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: categories = [] } = useModuleImageCategories(true)
  const {
    data: kvkOptions = [],
    error: kvkOptionsError,
    isLoading: isKvkOptionsLoading,
  } = useModuleImageKvks(shouldShowKvkFilter)

  const {
    data: listResponse,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
  } = useModuleImages({
    page: currentPage,
    limit: PAGE_SIZE,
    reportingYear: appliedReportingYear,
    kvkId: appliedKvkId,
    moduleId: appliedModuleId,
    search: debouncedSearch || undefined,
  })

  const createMutation = useCreateModuleImage()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImagesArr: UploadImage[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        alert({ title: 'File Too Large', message: `File ${file.name} is larger than 5MB.`, variant: 'error' })
        continue
      }
      try {
        const b64 = await fileToDataUrl(file)
        newImagesArr.push({
          id: Math.random().toString(36).substring(7),
          file,
          previewBase64: b64,
          caption: '',
        })
      } catch (err) {
        console.error('Failed to read file', err)
      }
    }

    setUploadImages((prev) => [...prev, ...newImagesArr])
    e.target.value = ''
  }

  const removeUploadImage = (id: string) => {
    setUploadImages((prev) => prev.filter((img) => img.id !== id))
  }

  const updateUploadCaption = (id: string, caption: string) => {
    setUploadImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    )
  }

  const rows = listResponse?.data ?? []
  const meta = listResponse?.meta ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  }
  const paginationItems = useMemo(
    () => buildPagination(meta.page, meta.totalPages),
    [meta.page, meta.totalPages],
  )
  const startEntry = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const endEntry = meta.total === 0 ? 0 : Math.min(meta.page * meta.limit, meta.total)
  const isRefreshing = isListFetching && !isListLoading

  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, index) => currentYear - index),
    [currentYear],
  )

  const handleApplyFilter = () => {
    setAppliedReportingYear(selectedReportingYear)
    setAppliedModuleId(selectedModuleId ? Number(selectedModuleId) : undefined)
    setAppliedKvkId(selectedKvkId ? Number(selectedKvkId) : undefined)
    setCurrentPage(1)
  }

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canAdd) {
      alert({
        title: 'Access Denied',
        message: 'You do not have permission to add module images',
        variant: 'error',
      })
      return
    }

    if (!createDate) {
      alert({ title: 'Validation Error', message: 'Date is required', variant: 'error' })
      return
    }
    if (!createModuleId) {
      alert({ title: 'Validation Error', message: 'Category is required', variant: 'error' })
      return
    }
    if (uploadImages.length === 0) {
      alert({ title: 'Validation Error', message: 'At least one photograph is required', variant: 'error' })
      return
    }

    try {
      for (const img of uploadImages) {
        await createMutation.mutateAsync({
          imageDate: createDate,
          moduleId: Number(createModuleId),
          caption: img.caption.trim(),
          imageBase64: img.previewBase64,
          fileName: img.file.name,
        })
      }

      alert({
        title: 'Upload Successful',
        message: 'Photographs uploaded successfully',
        variant: 'success',
        autoClose: true,
      })
      navigate('/module-images')
    } catch (error) {
      alert({
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload photographs',
        variant: 'error',
      })
    }
  }

  if (isCreateMode) {
    return (
      <div className="bg-white rounded-2xl p-1">
        <div className="mb-6 flex items-center justify-between gap-4 px-6 pt-4">
          <div>
            {breadcrumbs.length > 0 && (
              <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/module-images')}
            className="px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
          >
            Back
          </button>
        </div>

        <Card className="bg-[#FAF9F6]">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-[#212121]">Add Photographs</h2>
            </div>

            {!canAdd ? (
              <div className="bg-white rounded-xl border border-red-200 p-4 text-red-700 text-sm">
                You do not have permission to add module images.
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="bg-white rounded-xl border border-[#E0E0E0] p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Date *</label>
                    <input
                      type="date"
                      value={createDate}
                      onChange={(e) => setCreateDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      max={new Date().toISOString().slice(0, 10)}
                      disabled={createMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Category *</label>
                    <select
                      value={createModuleId}
                      onChange={(e) => setCreateModuleId(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={createMutation.isPending}
                    >
                      <option value="">Select</option>
                      {categories.map((category) => (
                        <option key={category.moduleId} value={category.moduleId}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="border border-[#7D9E77] rounded-xl overflow-hidden mb-6">
                    <div className="p-4 bg-white border-b border-[#7D9E77]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-[15px] text-[#212121] bg-transparent cursor-pointer"
                        disabled={createMutation.isPending}
                      />
                    </div>
                    <div className="bg-[#F8F9FA] p-3 text-[14px] text-[#5c6873]">
                      Only images allowed. Uploading new files will be added to the list. Only the first image uploaded will appear in the table. (Max 5MB per file)
                    </div>
                  </div>

                  {uploadImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {uploadImages.map((img) => (
                        <div key={img.id} className="bg-white border text-center border-[#E0E0E0] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3 border border-[#E0E0E0]">
                            <img src={img.previewBase64} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeUploadImage(img.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Caption..."
                            value={img.caption}
                            onChange={(e) => updateUploadCaption(img.id, e.target.value)}
                            className="w-full text-sm font-semibold border-none bg-transparent focus:outline-none focus:ring-0 placeholder:text-[#bdbdbd] placeholder:font-bold text-[#424242]"
                            disabled={createMutation.isPending}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-8 py-2.5 bg-[#487749] text-white rounded-lg text-base font-semibold hover:bg-[#3d6540] transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <AlertDialog />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-1">
      <div className="mb-6 flex items-center gap-4 px-6 pt-4">
        <button
          onClick={() => {
            if (routeConfig?.parent) {
              navigate(routeConfig.parent)
            } else {
              navigate('/dashboard')
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
        )}
      </div>

      <Card className="bg-[#FAF9F6]">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-4xl font-semibold text-[#212121]">Category wise Photographs</h2>
            {canAdd && (
              <button
                type="button"
                onClick={() => navigate('/module-images/create')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Images
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 ${shouldShowKvkFilter ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 items-end mb-4`}>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Reporting Year</label>
              <select
                value={selectedReportingYear}
                onChange={(e) => setSelectedReportingYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {shouldShowKvkFilter && (
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">KVK</label>
                <select
                  value={selectedKvkId}
                  onChange={(e) => setSelectedKvkId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                >
                  <option value="">All</option>
                  {isKvkOptionsLoading && <option value="">Loading KVKs...</option>}
                  {kvkOptions.map((kvk) => (
                    <option key={kvk.kvkId} value={kvk.kvkId}>
                      {kvk.kvkName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Category</label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category.moduleId} value={category.moduleId}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-4 py-2.5 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#212121] mb-2">Search:</label>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search category, KVK, caption..."
                className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              />
            </div>
          </div>

          {listError && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {listError instanceof Error ? listError.message : 'Failed to load module images'}
            </div>
          )}
          {kvkOptionsError && shouldShowKvkFilter && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {kvkOptionsError instanceof Error ? kvkOptionsError.message : 'Failed to load KVK options'}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6EFE3] border-b border-[#D6E0D3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">S.No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">KVK Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Images</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Caption</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isListLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#757575]">
                        Loading module images...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#757575]">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.imageId} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F6FAF5]'}>
                        <td className="px-4 py-3 text-sm text-[#212121]">{startEntry + index}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.kvkName}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{formatDate(row.imageDate)}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.categoryLabel}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">
                          <img
                            src={getFileUrl(row.fileUrl)}
                            alt={row.caption || 'Module image'}
                            className="w-20 h-16 object-cover rounded border border-[#E0E0E0]"
                            loading="lazy"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.caption || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            type="button"
                            onClick={() => downloadImage(row.downloadUrl, row.fileName)}
                            className="text-[#536DFE] hover:underline cursor-pointer"
                          >
                            Download Image
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-4 border-t border-[#E0E0E0] bg-white">
              <div className="text-sm text-[#757575] mb-3">
                Showing {startEntry} to {endEntry} of {meta.total.toLocaleString('en-IN')} entries
                {isRefreshing && ' (updating...)'}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={meta.page <= 1}
                  className="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                >
                  Previous
                </button>

                {paginationItems.map((item, index) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-sm text-[#757575]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`px-3 py-1.5 text-sm border rounded-md ${item === meta.page
                          ? 'bg-[#7D9E77] text-white border-[#7D9E77]'
                          : 'border-[#E0E0E0] hover:bg-[#F5F5F5]'
                        }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setCurrentPage((page) => Math.min(meta.totalPages, page + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog />
    </div>
  )
}
