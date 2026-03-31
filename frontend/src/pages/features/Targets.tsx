import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Search, MoreHorizontal } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/hooks/useAlert'
import {
  useTargets,
  useTargetTypes,
  useTargetKvks,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
} from '@/hooks/useTargets'
import { TargetRow } from '@/services/targetsApi'
import { apiClient } from '@/services/api'

const PAGE_SIZE = 10

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

interface SeasonRecord {
  seasonId: number
  seasonName: string
}

interface CropTypeRecord {
  typeId: number
  typeName: string
}

interface CfldCropRecord {
  cfldId: number
  CropName: string
}

export const Targets: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeConfig = getRouteConfig(location.pathname)
  const breadcrumbs = getBreadcrumbsForPath(location.pathname)
  const isCreateMode = location.pathname === '/targets/create'
  const { user, hasPermission } = useAuth()
  const { alert, AlertDialog } = useAlert()

  const canAdd = hasPermission('ADD', 'targets')
  const canEdit = hasPermission('EDIT', 'targets')
  const canDelete = hasPermission('DELETE', 'targets')
  const shouldShowKvkFilter = user?.role !== 'kvk_admin' && user?.role !== 'kvk_user'

  // list state
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const currentYear = new Date().getFullYear()
  const [selectedReportingYear, setSelectedReportingYear] = useState<string>('')
  const [selectedKvkId, setSelectedKvkId] = useState<string>('')
  const [selectedTypeName, setSelectedTypeName] = useState<string>('')
  const [appliedReportingYear, setAppliedReportingYear] = useState<number | undefined>(undefined)
  const [appliedKvkId, setAppliedKvkId] = useState<number | undefined>(undefined)
  const [appliedTypeName, setAppliedTypeName] = useState<string | undefined>(undefined)
  const [openActionId, setOpenActionId] = useState<number | null>(null)

  // form state
  const [editingTarget, setEditingTarget] = useState<TargetRow | null>(null)
  const [formReportingYear, setFormReportingYear] = useState<string>('')
  const [formKvkId, setFormKvkId] = useState<string>('')
  const [formTypeName, setFormTypeName] = useState<string>('')
  const [formTarget, setFormTarget] = useState<string>('')
  const [formFarmerTarget, setFormFarmerTarget] = useState<string>('')
  const [formSeason, setFormSeason] = useState<string>('')
  const [formCropName, setFormCropName] = useState<string>('')
  const [formAreaTarget, setFormAreaTarget] = useState<string>('')

  // CFLD dropdown data
  const [seasons, setSeasons] = useState<SeasonRecord[]>([])
  const [cropTypes, setCropTypes] = useState<CropTypeRecord[]>([])
  const [cfldCrops, setCfldCrops] = useState<CfldCropRecord[]>([])
  const [isCropsLoading, setIsCropsLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: typeOptions = [] } = useTargetTypes(true)
  const {
    data: kvkOptions = [],
    isLoading: isKvkOptionsLoading,
  } = useTargetKvks(shouldShowKvkFilter)

  const {
    data: listResponse,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
  } = useTargets({
    page: currentPage,
    limit: PAGE_SIZE,
    reportingYear: appliedReportingYear,
    kvkId: appliedKvkId,
    typeName: appliedTypeName,
    search: debouncedSearch || undefined,
  })

  const createMutation = useCreateTarget()
  const updateMutation = useUpdateTarget()
  const deleteMutation = useDeleteTarget()

  const rows = listResponse?.data ?? []
  const meta = listResponse?.meta ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 }
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

  const selectedTypeConfig = useMemo(
    () => formTypeName ? typeOptions.find((t) => t.typeName === formTypeName) : null,
    [typeOptions, formTypeName],
  )
  const showFarmerTarget = !formTypeName || (selectedTypeConfig != null && selectedTypeConfig.hasFarmerTarget)

  // fetch seasons and crop types for CFLD dropdowns
  useEffect(() => {
    if (!selectedTypeConfig?.isCfld) return
    let cancelled = false

    const fetchData = async () => {
      try {
        const [seasonsRes, cropTypesRes] = await Promise.all([
          apiClient.get<SeasonRecord[] | { data: SeasonRecord[] }>('/admin/masters/seasons'),
          apiClient.get<CropTypeRecord[] | { data: CropTypeRecord[] }>('/admin/masters/crop-types'),
        ])
        if (!cancelled) {
          const sList = Array.isArray(seasonsRes) ? seasonsRes : (seasonsRes as { data: SeasonRecord[] }).data || []
          const ctList = Array.isArray(cropTypesRes) ? cropTypesRes : (cropTypesRes as { data: CropTypeRecord[] }).data || []
          setSeasons(sList)
          setCropTypes(ctList)
        }
      } catch {
        // silently fail — dropdowns will be empty
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [selectedTypeConfig?.isCfld])

  // fetch CFLD crops when season changes
  useEffect(() => {
    if (!selectedTypeConfig?.isCfld || !formSeason) {
      setCfldCrops([])
      return
    }

    const seasonRecord = seasons.find((s) => s.seasonName === formSeason)
    const cfldTypeName = formTypeName === 'CFLD Pulses' ? 'Pulses' : 'Oilseed'
    const cropTypeRecord = cropTypes.find((ct) => ct.typeName === cfldTypeName)

    if (!seasonRecord || !cropTypeRecord) {
      setCfldCrops([])
      return
    }

    let cancelled = false
    setIsCropsLoading(true)

    const fetchCrops = async () => {
      try {
        const res = await apiClient.get<{ data: CfldCropRecord[] }>(
          `/admin/masters/cfld/crops/season/${seasonRecord.seasonId}/type/${cropTypeRecord.typeId}`,
        )
        if (!cancelled) {
          setCfldCrops(Array.isArray(res) ? res : res.data || [])
        }
      } catch {
        if (!cancelled) setCfldCrops([])
      } finally {
        if (!cancelled) setIsCropsLoading(false)
      }
    }

    fetchCrops()
    return () => { cancelled = true }
  }, [selectedTypeConfig?.isCfld, formSeason, formTypeName, seasons, cropTypes])

  const handleApplyFilter = () => {
    setAppliedReportingYear(selectedReportingYear ? Number(selectedReportingYear) : undefined)
    setAppliedKvkId(selectedKvkId ? Number(selectedKvkId) : undefined)
    setAppliedTypeName(selectedTypeName || undefined)
    setCurrentPage(1)
  }

  const resetForm = () => {
    setFormReportingYear('')
    setFormKvkId('')
    setFormTypeName('')
    setFormTarget('')
    setFormFarmerTarget('')
    setFormSeason('')
    setFormCropName('')
    setFormAreaTarget('')
    setEditingTarget(null)
  }

  const handleStartEdit = (row: TargetRow) => {
    setEditingTarget(row)
    setFormReportingYear(String(row.reportingYear))
    setFormKvkId(String(row.kvkId))
    setFormTypeName(row.typeName)
    setFormTarget(String(row.target))
    setFormFarmerTarget(row.farmerTarget != null ? String(row.farmerTarget) : '')
    setFormSeason(row.season || '')
    setFormCropName(row.cropName || '')
    setFormAreaTarget(row.areaTarget != null ? String(row.areaTarget) : '')
    setOpenActionId(null)
    navigate('/targets/create')
  }

  const handleDelete = async (targetId: number) => {
    try {
      await deleteMutation.mutateAsync(targetId)
      alert({
        title: 'Deleted',
        message: 'Target deleted successfully',
        variant: 'success',
        autoClose: true,
      })
    } catch (error) {
      alert({
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Failed to delete target',
        variant: 'error',
      })
    }
    setOpenActionId(null)
  }

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formReportingYear) {
      alert({ title: 'Validation Error', message: 'Reporting Year is required', variant: 'error' })
      return
    }
    if (!formTypeName) {
      alert({ title: 'Validation Error', message: 'Type is required', variant: 'error' })
      return
    }
    if (!formTarget) {
      alert({ title: 'Validation Error', message: 'Target is required', variant: 'error' })
      return
    }
    if (shouldShowKvkFilter && !editingTarget && !formKvkId) {
      alert({ title: 'Validation Error', message: 'KVK is required', variant: 'error' })
      return
    }

    if (showFarmerTarget && !formFarmerTarget) {
      alert({ title: 'Validation Error', message: 'Farmer Target is required', variant: 'error' })
      return
    }

    if (selectedTypeConfig?.isCfld) {
      if (!formSeason) {
        alert({ title: 'Validation Error', message: 'Season is required', variant: 'error' })
        return
      }
      if (!formCropName) {
        alert({ title: 'Validation Error', message: 'Crop is required', variant: 'error' })
        return
      }
      if (!formAreaTarget) {
        alert({ title: 'Validation Error', message: 'Area Target is required', variant: 'error' })
        return
      }
    }

    const payload = {
      reportingYear: Number(formReportingYear),
      typeName: formTypeName,
      target: Number(formTarget),
      ...(shouldShowKvkFilter && !editingTarget ? { kvkId: Number(formKvkId) } : {}),
      ...(showFarmerTarget ? { farmerTarget: Number(formFarmerTarget) } : {}),
      ...(selectedTypeConfig?.isCfld
        ? {
            season: formSeason,
            cropName: formCropName,
            areaTarget: Number(formAreaTarget),
          }
        : {}),
    }

    try {
      if (editingTarget) {
        await updateMutation.mutateAsync({ targetId: editingTarget.targetId, ...payload })
        alert({
          title: 'Updated',
          message: 'Target updated successfully',
          variant: 'success',
          autoClose: true,
        })
      } else {
        await createMutation.mutateAsync(payload)
        alert({
          title: 'Created',
          message: 'Target created successfully',
          variant: 'success',
          autoClose: true,
        })
      }
      resetForm()
      navigate('/targets')
    } catch (error) {
      alert({
        title: editingTarget ? 'Update Failed' : 'Create Failed',
        message: error instanceof Error ? error.message : 'Operation failed',
        variant: 'error',
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // close action menu on outside click
  useEffect(() => {
    if (openActionId === null) return
    const handler = () => setOpenActionId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openActionId])

  // CREATE / EDIT MODE
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
            onClick={() => { resetForm(); navigate('/targets') }}
            className="px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
          >
            Back
          </button>
        </div>

        <Card className="bg-[#FAF9F6]">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-[#212121]">
                {editingTarget ? 'Edit Target' : 'Add Targets'}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              {/* Row 1: Reporting Year + KVK (super admin only) */}
              {shouldShowKvkFilter && !editingTarget && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Reporting Year *</label>
                    <select
                      value={formReportingYear}
                      onChange={(e) => setFormReportingYear(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    >
                      <option value="">Select</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">KVK *</label>
                    <select
                      value={formKvkId}
                      onChange={(e) => setFormKvkId(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    >
                      <option value="">Please Select</option>
                      {isKvkOptionsLoading && <option value="">Loading KVKs...</option>}
                      {kvkOptions.map((kvk) => (
                        <option key={kvk.kvkId} value={kvk.kvkId}>{kvk.kvkName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Row 1 (KVK users): Reporting Year + Type */}
              {!(shouldShowKvkFilter && !editingTarget) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Reporting Year *</label>
                    <select
                      value={formReportingYear}
                      onChange={(e) => setFormReportingYear(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    >
                      <option value="">Select</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Type *</label>
                    <select
                      value={formTypeName}
                      onChange={(e) => {
                        setFormTypeName(e.target.value)
                        setFormFarmerTarget('')
                        setFormSeason('')
                        setFormCropName('')
                        setFormAreaTarget('')
                      }}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    >
                      <option value="">Select</option>
                      {typeOptions.map((opt) => (
                        <option key={opt.typeName} value={opt.typeName}>{opt.typeName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Row 2 (super admin): Type only */}
              {shouldShowKvkFilter && !editingTarget && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Type *</label>
                    <select
                      value={formTypeName}
                      onChange={(e) => {
                        setFormTypeName(e.target.value)
                        setFormFarmerTarget('')
                        setFormSeason('')
                        setFormCropName('')
                        setFormAreaTarget('')
                      }}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    >
                      <option value="">Select</option>
                      {typeOptions.map((opt) => (
                        <option key={opt.typeName} value={opt.typeName}>{opt.typeName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* CFLD: Season + Crops */}
              {selectedTypeConfig?.isCfld && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Season *</label>
                    <select
                      value={formSeason}
                      onChange={(e) => {
                        setFormSeason(e.target.value)
                        setFormCropName('')
                      }}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    >
                      <option value="">Select</option>
                      {seasons.map((s) => (
                        <option key={s.seasonId} value={s.seasonName}>{s.seasonName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Crops *</label>
                    <select
                      value={formCropName}
                      onChange={(e) => setFormCropName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending || isCropsLoading}
                    >
                      <option value="">Select Anyone</option>
                      {cfldCrops.map((crop) => (
                        <option key={crop.cfldId} value={crop.CropName}>{crop.CropName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Last row: Target + secondary field */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Target *</label>
                  <input
                    type="number"
                    min="0"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                    disabled={isPending}
                  />
                </div>

                {showFarmerTarget && (
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Farmer Target *</label>
                    <input
                      type="number"
                      min="0"
                      value={formFarmerTarget}
                      onChange={(e) => setFormFarmerTarget(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    />
                  </div>
                )}

                {selectedTypeConfig?.isCfld && (
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">Area Target *</label>
                    <input
                      type="number"
                      min="0"
                      value={formAreaTarget}
                      onChange={(e) => setFormAreaTarget(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                      disabled={isPending}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-2.5 bg-[#487749] text-white rounded-lg text-base font-semibold hover:bg-[#3d6540] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <AlertDialog />
      </div>
    )
  }

  // LIST MODE
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
            <h2 className="text-4xl font-semibold text-[#212121]">View Targets</h2>
            {canAdd && (
              <button
                type="button"
                onClick={() => { resetForm(); navigate('/targets/create') }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Targets
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 ${shouldShowKvkFilter ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 items-end mb-4`}>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Reporting Year</label>
              <select
                value={selectedReportingYear}
                onChange={(e) => setSelectedReportingYear(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                <option value="">All</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
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
                    <option key={kvk.kvkId} value={kvk.kvkId}>{kvk.kvkName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Type</label>
              <select
                value={selectedTypeName}
                onChange={(e) => setSelectedTypeName(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                <option value="">All</option>
                {typeOptions.map((opt) => (
                  <option key={opt.typeName} value={opt.typeName}>{opt.typeName}</option>
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
                placeholder="Search type, KVK, crop..."
                className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              />
            </div>
          </div>

          {listError && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {listError instanceof Error ? listError.message : 'Failed to load targets'}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E0E0E0]">
            <div className="overflow-visible">
              <table className="w-full">
                <thead className="bg-[#E6EFE3] border-b border-[#D6E0D3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">S.No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Reporting Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">KVK Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Target</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Crop</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Farmer Target</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Area Target</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isListLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-[#757575]">
                        Loading targets...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-[#757575]">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.targetId} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F6FAF5]'}>
                        <td className="px-4 py-3 text-sm text-[#212121]">{startEntry + index}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.reportingYear}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.kvkName}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.typeName}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.target}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.cropName || '\u2013'}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.farmerTarget ?? 0}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{row.areaTarget ?? 0}</td>
                        <td className="px-4 py-3 text-sm relative">
                          {(canEdit || canDelete) && (
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenActionId(openActionId === row.targetId ? null : row.targetId)
                                }}
                                className="p-1.5 rounded-md bg-[#64B5F6] text-white hover:bg-[#42A5F5] transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {openActionId === row.targetId && (
                                <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-[#E0E0E0] z-10">
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(row)}
                                      className="w-full px-3 py-2 text-left text-sm text-[#212121] hover:bg-[#F5F5F5]"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(row.targetId)}
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
                      className={`px-3 py-1.5 text-sm border rounded-md ${
                        item === meta.page
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
