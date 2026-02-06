import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { localStorageService } from '../../../utils/localStorageService'
import { KVKDetails } from '../../../types/kvk'
import { RouteWrapper } from '../../common/RouteWrapper'
import { TabNavigation } from '../../common/TabNavigation'
import { Card, CardContent } from '../../ui/Card'
import { KVKInfoTab } from './KVKInfoTab'
import { BankAccountsTab } from './BankAccountsTab'
import { EmployeesTab } from './EmployeesTab'
import { Building2, CreditCard, Users, Truck, Wrench } from 'lucide-react'
import { VehiclesTab } from './VehiclesTab'
import { EquipmentsTab } from './EquipmentsTab'
import { getMockKVKById } from '../../../mocks/kvkMockData'

export const KVKDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const [kvk, setKvk] = useState<KVKDetails | null>(null)
    const [activeTab, setActiveTab] = useState<'info' | 'bank' | 'employees' | 'vehicles' | 'equipments'>('info')

    useEffect(() => {
        if (id) {
            const kvks = localStorageService.getKVKDetails(parseInt(id))
            if (kvks.length > 0) {
                setKvk(kvks[0])
            } else {
                const mock = getMockKVKById(parseInt(id))
                if (mock) setKvk(mock)
            }
        }
    }, [id])

    // Determine active tab from URL or default
    useEffect(() => {
        if (location.pathname.includes('/bank')) {
            setActiveTab('bank')
        } else if (location.pathname.includes('/employees')) {
            setActiveTab('employees')
        } else if (location.pathname.includes('/vehicles')) {
            setActiveTab('vehicles')
        } else if (location.pathname.includes('/equipments')) {
            setActiveTab('equipments')
        } else {
            setActiveTab('info')
        }
    }, [location.pathname])

    if (!kvk) {
        return (
            <RouteWrapper>
            <div className="p-6">
                <p className="text-[#757575]">KVK not found</p>
            </div>
            </RouteWrapper>
        )
    }

    const tabs = [
        { label: 'KVK Information', path: `/forms/about-kvk/view-kvks/${id}`, icon: <Building2 className="w-4 h-4" /> },
        { label: 'Bank Accounts', path: `/forms/about-kvk/view-kvks/${id}/bank`, icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Employees', path: `/forms/about-kvk/view-kvks/${id}/employees`, icon: <Users className="w-4 h-4" /> },
        { label: 'Vehicles', path: `/forms/about-kvk/view-kvks/${id}/vehicles`, icon: <Truck className="w-4 h-4" /> },
        { label: 'Equipments', path: `/forms/about-kvk/view-kvks/${id}/equipments`, icon: <Wrench className="w-4 h-4" /> },
    ]

    return (
        <RouteWrapper showBreadcrumbs={true} showTabs={false} showBack={true}>
        <div className="space-y-6">
                {/* Header */}
            <Card>
                <CardContent className="p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-[#487749]">
                                {kvk.kvk_name}
                            </h2>
                            <p className="text-[#757575] mt-1">
                                {kvk.state?.state_name} • {kvk.district?.district_name}
                            </p>
                    </div>

                    {/* Tabs */}
                        <TabNavigation
                            tabs={tabs.map(t => ({ label: t.label, path: t.path }))}
                            currentPath={location.pathname}
                        />
                </CardContent>
            </Card>

            {/* Tab Content */}
            {activeTab === 'info' && <KVKInfoTab kvk={kvk} />}
            {activeTab === 'bank' && <BankAccountsTab kvkId={kvk.id} />}
            {activeTab === 'employees' && <EmployeesTab kvkId={kvk.id} />}
            {activeTab === 'vehicles' && <VehiclesTab kvkId={kvk.id} />}
            {activeTab === 'equipments' && <EquipmentsTab kvkId={kvk.id} />}
        </div>
        </RouteWrapper>
    )
}
