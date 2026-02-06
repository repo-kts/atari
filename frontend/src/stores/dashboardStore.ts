import { create } from 'zustand'

export type Year = 2023 | 2024 | 2025 | 2026

export interface Vehicle {
    name: string
    status: string
    km: number
}

export interface StaffMember {
    id: string
    name: string
    kvk: string
    designation: string
    date: string
}

export interface Infrastructure {
    id: string
    kvk: string
    type: string
    completion: number
    status: string
}

export interface DashboardData {
    year: Year
    totalKVKs: number
    totalStaff: number
    vehicles: Vehicle[]
    infrastructure: Infrastructure[]
    staff: StaffMember[]
    oftCount: number
    fldCount: number
    infraPercentage: number
}

interface DashboardStore {
    data: DashboardData
    filteredData: DashboardData
    searchQuery: string
    userRole: 'admin' | 'guest'
    setYear: (year: Year) => void
    setSearchQuery: (query: string) => void
    setUserRole: (role: 'admin' | 'guest') => void
    filterData: () => void
}

// Mock data generator
const generateMockData = (year: Year): DashboardData => {
    const kvks = [
        'KVK Patna',
        'KVK Gaya',
        'KVK Bhagalpur',
        'KVK Muzaffarpur',
        'KVK Purnia',
    ]
    const designations = [
        'Scientist',
        'Technical Officer',
        'Programme Assistant',
        'Field Assistant',
    ]
    const vehicleTypes = ['Tractor', 'Car', 'Motorcycle', 'Van']
    const infraTypes = [
        'Office Building',
        'Laboratory',
        'Training Hall',
        'Storage',
    ]

    return {
        year,
        totalKVKs: kvks.length,
        totalStaff: 45 + Math.floor(Math.random() * 20),
        vehicles: vehicleTypes.map((type, i) => ({
            name: `${type} ${i + 1}`,
            status: ['Active', 'Under Maintenance', 'Active'][i % 3],
            km: 5000 + Math.floor(Math.random() * 10000),
        })),
        infrastructure: kvks.flatMap((kvk, kvkIndex) =>
            infraTypes.map((type, typeIndex) => ({
                id: `${kvkIndex}-${typeIndex}`,
                kvk,
                type,
                completion: 60 + Math.floor(Math.random() * 40),
                status: ['Completed', 'In Progress', 'Planned'][typeIndex % 3],
            }))
        ),
        staff: Array.from({ length: 15 }, (_, i) => ({
            id: `staff-${i}`,
            name: `Staff Member ${i + 1}`,
            kvk: kvks[i % kvks.length],
            designation: designations[i % designations.length],
            date: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString(),
        })),
        oftCount: 12 + Math.floor(Math.random() * 8),
        fldCount: 25 + Math.floor(Math.random() * 15),
        infraPercentage: 65 + Math.floor(Math.random() * 20),
    }
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    data: generateMockData(2026),
    filteredData: generateMockData(2026),
    searchQuery: '',
    userRole: 'admin', // Change to 'guest' to test guest view

    setYear: year => {
        const newData = generateMockData(year)
        set({ data: newData, filteredData: newData })
        get().filterData()
    },

    setSearchQuery: query => {
        set({ searchQuery: query })
        get().filterData()
    },

    setUserRole: role => {
        set({ userRole: role })
    },

    filterData: () => {
        const { data, searchQuery } = get()
        if (!searchQuery.trim()) {
            set({ filteredData: data })
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = {
            ...data,
            staff: data.staff.filter(
                s =>
                    s.name.toLowerCase().includes(query) ||
                    s.kvk.toLowerCase().includes(query) ||
                    s.designation.toLowerCase().includes(query)
            ),
            infrastructure: data.infrastructure.filter(
                i =>
                    i.kvk.toLowerCase().includes(query) ||
                    i.type.toLowerCase().includes(query)
            ),
            vehicles: data.vehicles.filter(
                v =>
                    v.name.toLowerCase().includes(query) ||
                    v.status.toLowerCase().includes(query)
            ),
        }

        set({ filteredData: filtered })
    },
}))
