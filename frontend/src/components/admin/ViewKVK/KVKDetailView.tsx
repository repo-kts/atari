import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { localStorageService } from '../../../utils/localStorageService'
import { KVKDetails } from '../../../types/kvk'
import { BankAccount } from '../../../types/bankAccount'
import { Staff } from '../../../types/staff'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { ArrowLeft, Building2, CreditCard, Users } from 'lucide-react'
import { KVKInfoTab } from './KVKInfoTab'
import { BankAccountsTab } from './BankAccountsTab'
import { EmployeesTab } from './EmployeesTab'

export const KVKDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [kvk, setKvk] = useState<KVKDetails | null>(null)
    const [activeTab, setActiveTab] = useState<'info' | 'bank' | 'employees'>('info')

    useEffect(() => {
        if (id) {
            const kvks = localStorageService.getKVKDetails(parseInt(id))
            if (kvks.length > 0) {
                setKvk(kvks[0])
            }
        }
    }, [id])

    if (!kvk) {
        return (
            <div className="p-6">
                <p className="text-[#757575]">KVK not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/admin/kvk')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-emerald-700">
                                {kvk.kvk_name}
                            </h2>
                            <p className="text-[#757575] mt-1">
                                {kvk.state?.state_name} • {kvk.district?.district_name}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-[#E0E0E0]">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                activeTab === 'info'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-[#757575] hover:text-emerald-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                KVK Information
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('bank')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                activeTab === 'bank'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-[#757575] hover:text-emerald-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Bank Accounts
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                activeTab === 'employees'
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-[#757575] hover:text-emerald-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Employees
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Content */}
            {activeTab === 'info' && <KVKInfoTab kvk={kvk} />}
            {activeTab === 'bank' && <BankAccountsTab kvkId={kvk.id} />}
            {activeTab === 'employees' && <EmployeesTab kvkId={kvk.id} />}
        </div>
    )
}
