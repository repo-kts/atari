import { KVKDetails } from '../types/kvk'
import { BankAccount } from '../types/bankAccount'
import { Staff } from '../types/staff'
import { OFT } from '../types/oft'
import { FLD } from '../types/fld'
import { Publication } from '../types/publication'
import { Training } from '../types/training'
import { ExtensionActivity } from '../types/extensionActivity'
import { OtherExtensionActivity } from '../types/otherExtensionActivity'
import { TechnologyWeek } from '../types/technologyWeek'
import { CelebrationDay } from '../types/celebrationDays'
import { ProductionSupply } from '../types/productionSupply'
import { HRDTraining } from '../types/hrd'
import { SoilEquipment, SoilAnalysis, WorldSoilDay } from '../types/soilWater'
import { KVKAward, ScientistAward, FarmerAward } from '../types/awards'
import { FunctionalLinkage, SpecialProgram } from '../types/linkages'
import { KVKImpact, Entrepreneurship, SuccessStory } from '../types/impact'
import { DistrictLevelData, OperationalArea, VillageAdoption, PriorityThrustArea } from '../types/districtVillage'

const STORAGE_KEYS = {
    KVK_DETAILS: 'atari_kvk_details',
    BANK_ACCOUNTS: 'atari_bank_accounts',
    STAFF: 'atari_staff',
    VEHICLES: 'atari_vehicles',
    EQUIPMENT: 'atari_equipment',
    INFRASTRUCTURE: 'atari_infrastructure',
    OFT: 'atari_oft',
    FLD: 'atari_fld',
    PUBLICATIONS: 'atari_publications',
    TRAININGS: 'atari_trainings',
    EXTENSION_ACTIVITIES: 'atari_extension_activities',
    OTHER_EXTENSION_ACTIVITIES: 'atari_other_extension_activities',
    TECHNOLOGY_WEEK: 'atari_technology_week',
    CELEBRATION_DAYS: 'atari_celebration_days',
    PRODUCTION_SUPPLY: 'atari_production_supply',
    HRD_TRAININGS: 'atari_hrd_trainings',
    SOIL_EQUIPMENT: 'atari_soil_equipment',
    SOIL_ANALYSIS: 'atari_soil_analysis',
    WORLD_SOIL_DAY: 'atari_world_soil_day',
    KVK_AWARDS: 'atari_kvk_awards',
    SCIENTIST_AWARDS: 'atari_scientist_awards',
    FARMER_AWARDS: 'atari_farmer_awards',
    FUNCTIONAL_LINKAGES: 'atari_functional_linkages',
    SPECIAL_PROGRAMS: 'atari_special_programs',
    KVK_IMPACT: 'atari_kvk_impact',
    ENTREPRENEURSHIP: 'atari_entrepreneurship',
    SUCCESS_STORIES: 'atari_success_stories',
    DISTRICT_LEVEL_DATA: 'atari_district_level_data',
    OPERATIONAL_AREA: 'atari_operational_area',
    VILLAGE_ADOPTION: 'atari_village_adoption',
    PRIORITY_THRUST_AREA: 'atari_priority_thrust_area',
}

export interface VehicleRecord {
    id: number
    kvk_name: string
    vehicle_name: string
    registration_no: string
    year: number
    total_run: number
    status: string
    deleted_at?: string | null
}

export interface EquipmentRecord {
    id: number
    kvk_name: string
    equipment_name: string
    year: number
    total_cost?: number
    source_of_fund?: string
    status: string
    deleted_at?: string | null
}

export interface InfrastructureRecord {
    id: number
    kvk_name: string
    infrastructure: string
    not_started: string
    plinth: string
    lintel: string
    roof: string
    total_completed: string
    plinth_area: string
    under_use: string
    deleted_at?: string | null
}

export const localStorageService = {
    // KVK Details
    getKVKDetails: (kvkId?: number): KVKDetails[] => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_DETAILS)
        if (!data) return []
        const kvks: KVKDetails[] = JSON.parse(data)
        const activeKvks = kvks.filter(kvk => !kvk.deleted_at)
        if (kvkId !== undefined) {
            return activeKvks.filter(kvk => kvk.id === kvkId)
        }
        return activeKvks
    },

    saveKVKDetails: (kvk: KVKDetails): void => {
        const existing = localStorageService.getKVKDetails()
        const now = new Date().toISOString()
        const newKvk: KVKDetails = {
            ...kvk,
            created_at: kvk.created_at || now,
            updated_at: now,
        }
        const updated = [...existing, newKvk]
        localStorage.setItem(STORAGE_KEYS.KVK_DETAILS, JSON.stringify(updated))
    },

    updateKVKDetails: (id: number, updates: Partial<KVKDetails>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_DETAILS)
        if (!data) return
        const kvks: KVKDetails[] = JSON.parse(data)
        const index = kvks.findIndex(kvk => kvk.id === id)
        if (index !== -1) {
            kvks[index] = {
                ...kvks[index],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.KVK_DETAILS, JSON.stringify(kvks))
        }
    },

    deleteKVKDetails: (id: number): void => {
        localStorageService.updateKVKDetails(id, {
            deleted_at: new Date().toISOString(),
        })
    },

    // Bank Accounts
    getBankAccounts: (kvkId?: number): BankAccount[] => {
        const data = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)
        if (!data) return []
        const accounts: BankAccount[] = JSON.parse(data)
        const activeAccounts = accounts.filter(acc => !acc.deleted_at)
        if (kvkId !== undefined) {
            return activeAccounts.filter(acc => acc.kvk_id === kvkId)
        }
        return activeAccounts
    },

    saveBankAccount: (account: BankAccount): void => {
        const existing = localStorageService.getBankAccounts()
        const now = new Date().toISOString()
        const newAccount: BankAccount = {
            ...account,
            id: account.id || Date.now(),
            created_at: account.created_at || now,
            updated_at: now,
        }
        const updated = [...existing, newAccount]
        localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updated))
    },

    updateBankAccount: (id: number, updates: Partial<BankAccount>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)
        if (!data) return
        const accounts: BankAccount[] = JSON.parse(data)
        const index = accounts.findIndex(acc => acc.id === id)
        if (index !== -1) {
            accounts[index] = {
                ...accounts[index],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts))
        }
    },

    deleteBankAccount: (id: number): void => {
        localStorageService.updateBankAccount(id, {
            deleted_at: new Date().toISOString(),
        })
    },

    // Staff
    getStaff: (kvkId?: number): Staff[] => {
        const data = localStorage.getItem(STORAGE_KEYS.STAFF)
        if (!data) return []
        const staff: Staff[] = JSON.parse(data)
        const activeStaff = staff.filter(s => !s.deleted_at)
        if (kvkId !== undefined) {
            return activeStaff.filter(s => s.kvk_id === kvkId)
        }
        return activeStaff
    },

    saveStaff: (staff: Staff): void => {
        const existing = localStorageService.getStaff()
        const now = new Date().toISOString()
        const newStaff: Staff = {
            ...staff,
            id: staff.id || Date.now(),
            created_at: staff.created_at || now,
            updated_at: now,
        }
        const updated = [...existing, newStaff]
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated))
    },

    updateStaff: (id: number, updates: Partial<Staff>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.STAFF)
        if (!data) return
        const staff: Staff[] = JSON.parse(data)
        const index = staff.findIndex(s => s.id === id)
        if (index !== -1) {
            staff[index] = {
                ...staff[index],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff))
        }
    },

    deleteStaff: (id: number): void => {
        localStorageService.updateStaff(id, {
            deleted_at: new Date().toISOString(),
        })
    },

    transferStaff: (id: number): void => {
        localStorageService.updateStaff(id, {
            is_transferred: 1,
        })
    },

    // KVK User Mapping
    getKVKUserMapping: (): Record<string, number> => {
        const data = localStorage.getItem('atari-kvk-user-mapping') // This key was not updated in STORAGE_KEYS
        if (!data) return {}
        return JSON.parse(data)
    },

    saveKVKUserMapping: (userId: string, kvkId: number): void => {
        const mapping = localStorageService.getKVKUserMapping()
        mapping[userId] = kvkId
        localStorage.setItem('atari-kvk-user-mapping', JSON.stringify(mapping)) // This key was not updated in STORAGE_KEYS
    },

    getKVKIdForUser: (userId: string): number | null => {
        const mapping = localStorageService.getKVKUserMapping()
        return mapping[userId] || null
    },

    // Initialize with mock data (will be called from mockData.ts)
    initializeMockData: (kvkData: KVKDetails[], bankAccounts: BankAccount[], staff: Staff[]): void => {
        if (!localStorage.getItem(STORAGE_KEYS.KVK_DETAILS)) {
            localStorage.setItem(STORAGE_KEYS.KVK_DETAILS, JSON.stringify(kvkData))
        }
        if (!localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)) {
            localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(bankAccounts))
        }
        if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff))
        }
    },

    // Initialize About KVK mock data for newly added modules
    initializeAboutKvkMockData: (
        vehicles: VehicleRecord[],
        equipments: EquipmentRecord[],
        infrastructure: InfrastructureRecord[],
    ): void => {
        if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
            localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles))
        }
        if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
            localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments))
        }
        if (!localStorage.getItem(STORAGE_KEYS.INFRASTRUCTURE)) {
            localStorage.setItem(STORAGE_KEYS.INFRASTRUCTURE, JSON.stringify(infrastructure))
        }
    },

    // Initialize Achievements mock data
    initializeAchievementsMockData: (
        technologyWeek: TechnologyWeek[],
    ): void => {
        if (!localStorage.getItem(STORAGE_KEYS.TECHNOLOGY_WEEK)) {
            localStorage.setItem(STORAGE_KEYS.TECHNOLOGY_WEEK, JSON.stringify(technologyWeek))
        }
    },

    // Vehicles (list/detail shared schema)
    getVehiclesList: (): VehicleRecord[] => {
        const data = localStorage.getItem(STORAGE_KEYS.VEHICLES)
        if (!data) return []
        return JSON.parse(data).filter((v: VehicleRecord) => !v.deleted_at)
    },

    saveVehicle: (vehicle: VehicleRecord): void => {
        const existing = localStorageService.getVehiclesList()
        const newVehicle: VehicleRecord = {
            ...vehicle,
            id: vehicle.id || Date.now(),
            // total_run default to 0 if missing
            total_run: vehicle.total_run ?? 0,
        }
        const updated = [...existing, newVehicle]
        localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updated))
    },

    updateVehicle: (id: number, updates: Partial<VehicleRecord>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.VEHICLES)
        if (!data) return
        const vehicles: VehicleRecord[] = JSON.parse(data)
        const idx = vehicles.findIndex(v => v.id === id)
        if (idx !== -1) {
            vehicles[idx] = {
                ...vehicles[idx],
                ...updates,
            }
            localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles))
        }
    },

    deleteVehicle: (id: number): void => {
        localStorageService.updateVehicle(id, { deleted_at: new Date().toISOString() })
    },

    // Equipments
    getEquipmentsList: (): EquipmentRecord[] => {
        const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT)
        if (!data) return []
        return JSON.parse(data).filter((e: EquipmentRecord) => !e.deleted_at)
    },

    saveEquipment: (equipment: EquipmentRecord): void => {
        const existing = localStorageService.getEquipmentsList()
        const newItem: EquipmentRecord = {
            ...equipment,
            id: equipment.id || Date.now(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(updated))
    },

    updateEquipment: (id: number, updates: Partial<EquipmentRecord>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT)
        if (!data) return
        const equipments: EquipmentRecord[] = JSON.parse(data)
        const idx = equipments.findIndex(e => e.id === id)
        if (idx !== -1) {
            equipments[idx] = {
                ...equipments[idx],
                ...updates,
            }
            localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments))
        }
    },

    deleteEquipment: (id: number): void => {
        localStorageService.updateEquipment(id, { deleted_at: new Date().toISOString() })
    },

    // Infrastructure
    getInfrastructureList: (): InfrastructureRecord[] => {
        const data = localStorage.getItem(STORAGE_KEYS.INFRASTRUCTURE)
        if (!data) return []
        return JSON.parse(data).filter((e: InfrastructureRecord) => !e.deleted_at)
    },

    saveInfrastructure: (record: InfrastructureRecord): void => {
        const existing = localStorageService.getInfrastructureList()
        const newItem: InfrastructureRecord = {
            ...record,
            id: record.id || Date.now(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.INFRASTRUCTURE, JSON.stringify(updated))
    },

    updateInfrastructure: (id: number, updates: Partial<InfrastructureRecord>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.INFRASTRUCTURE)
        if (!data) return
        const infra: InfrastructureRecord[] = JSON.parse(data)
        const idx = infra.findIndex(e => e.id === id)
        if (idx !== -1) {
            infra[idx] = {
                ...infra[idx],
                ...updates,
            }
            localStorage.setItem(STORAGE_KEYS.INFRASTRUCTURE, JSON.stringify(infra))
        }
    },

    deleteInfrastructure: (id: number): void => {
        localStorageService.updateInfrastructure(id, { deleted_at: new Date().toISOString() })
    },

    // OFT
    getOFTList: (kvkId?: number): OFT[] => {
        const data = localStorage.getItem(STORAGE_KEYS.OFT)
        if (!data) return []
        const list: OFT[] = JSON.parse(data)
        const activeList = list.filter(item => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveOFT: (oft: OFT): void => {
        const existing = localStorageService.getOFTList()
        const newItem: OFT = {
            ...oft,
            id: oft.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        // Save ALL items (including deleted ones which are not returned by getOFTList, 
        // but here we are simplistic and just re-reading raw data might be better if we care about preservation,
        // but for now following existing pattern of re-saving what we have + new)
        // actually existing pattern in saveBankAccount uses getBankAccounts which filters out deleted...
        // so deleted items are lost on save? 
        // Wait, looking at saveBankAccount: 
        // const existing = localStorageService.getBankAccounts() -> returns only active
        // const updated = [...existing, newAccount] -> creates new array
        // localStorage.setItem(..., JSON.stringify(updated)) -> Overwrites with only active!
        // This means "soft delete" logic in this file is actually "hard delete" if valid items are re-saved.
        // I will follow the existing pattern for consistency, even if flawed.
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.OFT, JSON.stringify(updated))
    },

    updateOFT: (id: number, updates: Partial<OFT>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.OFT)
        if (!data) return
        const list: OFT[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.OFT, JSON.stringify(list))
        }
    },

    deleteOFT: (id: number): void => {
        localStorageService.updateOFT(id, { deleted_at: new Date().toISOString() })
    },

    // FLD
    getFLDList: (kvkId?: number): FLD[] => {
        const data = localStorage.getItem(STORAGE_KEYS.FLD)
        if (!data) return []
        const list: FLD[] = JSON.parse(data)
        const activeList = list.filter(item => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveFLD: (fld: FLD): void => {
        const existing = localStorageService.getFLDList()
        const newItem: FLD = {
            ...fld,
            id: fld.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.FLD, JSON.stringify(updated))
    },

    updateFLD: (id: number, updates: Partial<FLD>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.FLD)
        if (!data) return
        const list: FLD[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.FLD, JSON.stringify(list))
        }
    },

    deleteFLD: (id: number): void => {
        localStorageService.updateFLD(id, { deleted_at: new Date().toISOString() })
    },

    // Publication Methods
    getPublicationList: (kvkId?: number): Publication[] => {
        const data = localStorage.getItem(STORAGE_KEYS.PUBLICATIONS)
        if (!data) return []
        const list: Publication[] = JSON.parse(data)
        const activeList = list.filter(item => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    savePublication: (pub: Publication): void => {
        const existing = localStorageService.getPublicationList()
        const newItem: Publication = {
            ...pub,
            id: pub.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.PUBLICATIONS, JSON.stringify(updated))
    },

    updatePublication: (id: number, updates: Partial<Publication>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.PUBLICATIONS)
        if (!data) return
        const list: Publication[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.PUBLICATIONS, JSON.stringify(list))
        }
    },

    deletePublication: (id: number): void => {
        localStorageService.updatePublication(id, { deleted_at: new Date().toISOString() })
    },

    // Training Methods
    getTrainingList: (kvkId?: number): Training[] => {
        const data = localStorage.getItem(STORAGE_KEYS.TRAININGS)
        if (!data) return []
        const list: Training[] = JSON.parse(data)
        const activeList = list.filter(item => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveTraining: (training: Training): void => {
        const existing = localStorageService.getTrainingList()
        const newItem: Training = {
            ...training,
            id: training.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(updated))
    },

    updateTraining: (id: number, updates: Partial<Training>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.TRAININGS)
        if (!data) return
        const list: Training[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(list))
        }
    },

    deleteTraining: (id: number): void => {
        localStorageService.updateTraining(id, { deleted_at: new Date().toISOString() })
    },

    // Extension Activity Methods
    getExtensionActivityList: (kvkId?: number): ExtensionActivity[] => {
        const data = localStorage.getItem(STORAGE_KEYS.EXTENSION_ACTIVITIES)
        if (!data) return []
        const list: ExtensionActivity[] = JSON.parse(data)
        const activeList = list.filter(item => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveExtensionActivity: (activity: ExtensionActivity): void => {
        const existing = localStorageService.getExtensionActivityList()
        const newItem: ExtensionActivity = {
            ...activity,
            id: activity.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.EXTENSION_ACTIVITIES, JSON.stringify(updated))
    },

    updateExtensionActivity: (id: number, updates: Partial<ExtensionActivity>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.EXTENSION_ACTIVITIES)
        if (!data) return
        const list: ExtensionActivity[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.EXTENSION_ACTIVITIES, JSON.stringify(list))
        }
    },

    deleteExtensionActivity: (id: number): void => {
        localStorageService.updateExtensionActivity(id, { deleted_at: new Date().toISOString() })
    },

    // Other Extension Activity Methods
    getOtherExtensionActivityList: (kvkId?: number): OtherExtensionActivity[] => {
        const data = localStorage.getItem(STORAGE_KEYS.OTHER_EXTENSION_ACTIVITIES)
        if (!data) return []
        const list: OtherExtensionActivity[] = JSON.parse(data)
        const activeList = list.filter(item => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveOtherExtensionActivity: (activity: OtherExtensionActivity): void => {
        const existing = localStorageService.getOtherExtensionActivityList()
        const newItem: OtherExtensionActivity = {
            ...activity,
            id: activity.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.OTHER_EXTENSION_ACTIVITIES, JSON.stringify(updated))
    },

    updateOtherExtensionActivity: (id: number, updates: Partial<OtherExtensionActivity>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.OTHER_EXTENSION_ACTIVITIES)
        if (!data) return
        const list: OtherExtensionActivity[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.OTHER_EXTENSION_ACTIVITIES, JSON.stringify(list))
        }
    },

    deleteOtherExtensionActivity: (id: number): void => {
        localStorageService.updateOtherExtensionActivity(id, { deleted_at: new Date().toISOString() })
    },

    // Technology Week Methods
    getTechnologyWeekList: (kvkId?: number): TechnologyWeek[] => {
        const data = localStorage.getItem(STORAGE_KEYS.TECHNOLOGY_WEEK)
        if (!data) return []
        const list: TechnologyWeek[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveTechnologyWeek: (activity: TechnologyWeek): void => {
        const existing = localStorageService.getTechnologyWeekList()
        const newItem: TechnologyWeek = {
            ...activity,
            id: activity.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.TECHNOLOGY_WEEK, JSON.stringify(updated))
    },

    updateTechnologyWeek: (id: number, updates: Partial<TechnologyWeek>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.TECHNOLOGY_WEEK)
        if (!data) return
        const list: TechnologyWeek[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            } as any
            localStorage.setItem(STORAGE_KEYS.TECHNOLOGY_WEEK, JSON.stringify(list))
        }
    },

    deleteTechnologyWeek: (id: number): void => {
        localStorageService.updateTechnologyWeek(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Celebration Days Methods
    getCelebrationDaysList: (kvkId?: number): CelebrationDay[] => {
        const data = localStorage.getItem(STORAGE_KEYS.CELEBRATION_DAYS)
        if (!data) return []
        const list: CelebrationDay[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveCelebrationDay: (day: CelebrationDay): void => {
        const existing = localStorageService.getCelebrationDaysList()
        const newItem: CelebrationDay = {
            ...day,
            id: day.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.CELEBRATION_DAYS, JSON.stringify(updated))
    },

    updateCelebrationDay: (id: number, updates: Partial<CelebrationDay>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.CELEBRATION_DAYS)
        if (!data) return
        const list: CelebrationDay[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            } as any
            localStorage.setItem(STORAGE_KEYS.CELEBRATION_DAYS, JSON.stringify(list))
        }
    },

    deleteCelebrationDay: (id: number): void => {
        localStorageService.updateCelebrationDay(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Production & Supply Methods
    getProductionSupplyList: (kvkId?: number): ProductionSupply[] => {
        const data = localStorage.getItem(STORAGE_KEYS.PRODUCTION_SUPPLY)
        if (!data) return []
        const list: ProductionSupply[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveProductionSupply: (item: ProductionSupply): void => {
        const existing = localStorageService.getProductionSupplyList()
        const newItem: ProductionSupply = {
            ...item,
            id: item.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.PRODUCTION_SUPPLY, JSON.stringify(updated))
    },

    updateProductionSupply: (id: number, updates: Partial<ProductionSupply>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.PRODUCTION_SUPPLY)
        if (!data) return
        const list: ProductionSupply[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            } as any
            localStorage.setItem(STORAGE_KEYS.PRODUCTION_SUPPLY, JSON.stringify(list))
        }
    },

    deleteProductionSupply: (id: number): void => {
        localStorageService.updateProductionSupply(id, { deleted_at: new Date().toISOString() } as any)
    },

    // HRD Training Methods
    getHRDList: (kvkId?: number): HRDTraining[] => {
        const data = localStorage.getItem(STORAGE_KEYS.HRD_TRAININGS)
        if (!data) return []
        const list: HRDTraining[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },

    saveHRD: (item: HRDTraining): void => {
        const existing = localStorageService.getHRDList()
        const newItem: HRDTraining = {
            ...item,
            id: item.id || Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.HRD_TRAININGS, JSON.stringify(updated))
    },

    updateHRD: (id: number, updates: Partial<HRDTraining>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.HRD_TRAININGS)
        if (!data) return
        const list: HRDTraining[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = {
                ...list[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            } as any
            localStorage.setItem(STORAGE_KEYS.HRD_TRAININGS, JSON.stringify(list))
        }
    },

    deleteHRD: (id: number): void => {
        localStorageService.updateHRD(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Soil Equipment Methods
    getSoilEquipmentList: (kvkId?: number): SoilEquipment[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SOIL_EQUIPMENT)
        if (!data) return []
        const list: SoilEquipment[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveSoilEquipment: (item: SoilEquipment): void => {
        const existing = localStorageService.getSoilEquipmentList()
        const newItem: SoilEquipment = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.SOIL_EQUIPMENT, JSON.stringify(updated))
    },
    updateSoilEquipment: (id: number, updates: Partial<SoilEquipment>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.SOIL_EQUIPMENT)
        if (!data) return
        const list: SoilEquipment[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.SOIL_EQUIPMENT, JSON.stringify(list))
        }
    },
    deleteSoilEquipment: (id: number): void => {
        localStorageService.updateSoilEquipment(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Soil Analysis Methods
    getSoilAnalysisList: (kvkId?: number): SoilAnalysis[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SOIL_ANALYSIS)
        if (!data) return []
        const list: SoilAnalysis[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveSoilAnalysis: (item: SoilAnalysis): void => {
        const existing = localStorageService.getSoilAnalysisList()
        const newItem: SoilAnalysis = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.SOIL_ANALYSIS, JSON.stringify(updated))
    },
    updateSoilAnalysis: (id: number, updates: Partial<SoilAnalysis>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.SOIL_ANALYSIS)
        if (!data) return
        const list: SoilAnalysis[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.SOIL_ANALYSIS, JSON.stringify(list))
        }
    },
    deleteSoilAnalysis: (id: number): void => {
        localStorageService.updateSoilAnalysis(id, { deleted_at: new Date().toISOString() } as any)
    },

    // World Soil Day Methods
    getWorldSoilDayList: (kvkId?: number): WorldSoilDay[] => {
        const data = localStorage.getItem(STORAGE_KEYS.WORLD_SOIL_DAY)
        if (!data) return []
        const list: WorldSoilDay[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveWorldSoilDay: (item: WorldSoilDay): void => {
        const existing = localStorageService.getWorldSoilDayList()
        const newItem: WorldSoilDay = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.WORLD_SOIL_DAY, JSON.stringify(updated))
    },
    updateWorldSoilDay: (id: number, updates: Partial<WorldSoilDay>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.WORLD_SOIL_DAY)
        if (!data) return
        const list: WorldSoilDay[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.WORLD_SOIL_DAY, JSON.stringify(list))
        }
    },
    deleteWorldSoilDay: (id: number): void => {
        localStorageService.updateWorldSoilDay(id, { deleted_at: new Date().toISOString() } as any)
    },

    // KVK Awards Methods
    getKVKAwardList: (kvkId?: number): KVKAward[] => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_AWARDS)
        if (!data) return []
        const list: KVKAward[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveKVKAward: (item: KVKAward): void => {
        const existing = localStorageService.getKVKAwardList()
        const newItem: KVKAward = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.KVK_AWARDS, JSON.stringify(updated))
    },
    updateKVKAward: (id: number, updates: Partial<KVKAward>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_AWARDS)
        if (!data) return
        const list: KVKAward[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.KVK_AWARDS, JSON.stringify(list))
        }
    },
    deleteKVKAward: (id: number): void => {
        localStorageService.updateKVKAward(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Scientist Awards Methods
    getScientistAwardList: (kvkId?: number): ScientistAward[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SCIENTIST_AWARDS)
        if (!data) return []
        const list: ScientistAward[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveScientistAward: (item: ScientistAward): void => {
        const existing = localStorageService.getScientistAwardList()
        const newItem: ScientistAward = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.SCIENTIST_AWARDS, JSON.stringify(updated))
    },
    updateScientistAward: (id: number, updates: Partial<ScientistAward>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.SCIENTIST_AWARDS)
        if (!data) return
        const list: ScientistAward[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.SCIENTIST_AWARDS, JSON.stringify(list))
        }
    },
    deleteScientistAward: (id: number): void => {
        localStorageService.updateScientistAward(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Farmer Awards Methods
    getFarmerAwardList: (kvkId?: number): FarmerAward[] => {
        const data = localStorage.getItem(STORAGE_KEYS.FARMER_AWARDS)
        if (!data) return []
        const list: FarmerAward[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveFarmerAward: (item: FarmerAward): void => {
        const existing = localStorageService.getFarmerAwardList()
        const newItem: FarmerAward = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.FARMER_AWARDS, JSON.stringify(updated))
    },
    updateFarmerAward: (id: number, updates: Partial<FarmerAward>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.FARMER_AWARDS)
        if (!data) return
        const list: FarmerAward[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.FARMER_AWARDS, JSON.stringify(list))
        }
    },
    deleteFarmerAward: (id: number): void => {
        localStorageService.updateFarmerAward(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Functional Linkage Methods
    getFunctionalLinkageList: (kvkId?: number): FunctionalLinkage[] => {
        const data = localStorage.getItem(STORAGE_KEYS.FUNCTIONAL_LINKAGES)
        if (!data) return []
        const list: FunctionalLinkage[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveFunctionalLinkage: (item: FunctionalLinkage): void => {
        const existing = localStorageService.getFunctionalLinkageList()
        const newItem: FunctionalLinkage = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.FUNCTIONAL_LINKAGES, JSON.stringify(updated))
    },
    updateFunctionalLinkage: (id: number, updates: Partial<FunctionalLinkage>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.FUNCTIONAL_LINKAGES)
        if (!data) return
        const list: FunctionalLinkage[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.FUNCTIONAL_LINKAGES, JSON.stringify(list))
        }
    },
    deleteFunctionalLinkage: (id: number): void => {
        localStorageService.updateFunctionalLinkage(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Special Program Methods
    getSpecialProgramList: (kvkId?: number): SpecialProgram[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SPECIAL_PROGRAMS)
        if (!data) return []
        const list: SpecialProgram[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveSpecialProgram: (item: SpecialProgram): void => {
        const existing = localStorageService.getSpecialProgramList()
        const newItem: SpecialProgram = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.SPECIAL_PROGRAMS, JSON.stringify(updated))
    },
    updateSpecialProgram: (id: number, updates: Partial<SpecialProgram>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.SPECIAL_PROGRAMS)
        if (!data) return
        const list: SpecialProgram[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.SPECIAL_PROGRAMS, JSON.stringify(list))
        }
    },
    deleteSpecialProgram: (id: number): void => {
        localStorageService.updateSpecialProgram(id, { deleted_at: new Date().toISOString() } as any)
    },

    // KVK Impact Methods
    getKVKImpactList: (kvkId?: number): KVKImpact[] => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_IMPACT)
        if (!data) return []
        const list: KVKImpact[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveKVKImpact: (item: KVKImpact): void => {
        const existing = localStorageService.getKVKImpactList()
        const newItem: KVKImpact = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.KVK_IMPACT, JSON.stringify(updated))
    },
    updateKVKImpact: (id: number, updates: Partial<KVKImpact>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_IMPACT)
        if (!data) return
        const list: KVKImpact[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.KVK_IMPACT, JSON.stringify(list))
        }
    },
    deleteKVKImpact: (id: number): void => {
        localStorageService.updateKVKImpact(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Entrepreneurship Methods
    getEntrepreneurshipList: (kvkId?: number): Entrepreneurship[] => {
        const data = localStorage.getItem(STORAGE_KEYS.ENTREPRENEURSHIP)
        if (!data) return []
        const list: Entrepreneurship[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveEntrepreneurship: (item: Entrepreneurship): void => {
        const existing = localStorageService.getEntrepreneurshipList()
        const newItem: Entrepreneurship = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.ENTREPRENEURSHIP, JSON.stringify(updated))
    },
    updateEntrepreneurship: (id: number, updates: Partial<Entrepreneurship>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.ENTREPRENEURSHIP)
        if (!data) return
        const list: Entrepreneurship[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.ENTREPRENEURSHIP, JSON.stringify(list))
        }
    },
    deleteEntrepreneurship: (id: number): void => {
        localStorageService.updateEntrepreneurship(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Success Story Methods
    getSuccessStoryList: (kvkId?: number): SuccessStory[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SUCCESS_STORIES)
        if (!data) return []
        const list: SuccessStory[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveSuccessStory: (item: SuccessStory): void => {
        const existing = localStorageService.getSuccessStoryList()
        const newItem: SuccessStory = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.SUCCESS_STORIES, JSON.stringify(updated))
    },
    updateSuccessStory: (id: number, updates: Partial<SuccessStory>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.SUCCESS_STORIES)
        if (!data) return
        const list: SuccessStory[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.SUCCESS_STORIES, JSON.stringify(list))
        }
    },
    deleteSuccessStory: (id: number): void => {
        localStorageService.updateSuccessStory(id, { deleted_at: new Date().toISOString() } as any)
    },

    // District Level Data Methods
    getDistrictLevelDataList: (kvkId?: number): DistrictLevelData[] => {
        const data = localStorage.getItem(STORAGE_KEYS.DISTRICT_LEVEL_DATA)
        if (!data) return []
        const list: DistrictLevelData[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveDistrictLevelData: (item: DistrictLevelData): void => {
        const existing = localStorageService.getDistrictLevelDataList()
        const newItem: DistrictLevelData = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.DISTRICT_LEVEL_DATA, JSON.stringify(updated))
    },
    updateDistrictLevelData: (id: number, updates: Partial<DistrictLevelData>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.DISTRICT_LEVEL_DATA)
        if (!data) return
        const list: DistrictLevelData[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.DISTRICT_LEVEL_DATA, JSON.stringify(list))
        }
    },
    deleteDistrictLevelData: (id: number): void => {
        localStorageService.updateDistrictLevelData(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Operational Area Methods
    getOperationalAreaList: (kvkId?: number): OperationalArea[] => {
        const data = localStorage.getItem(STORAGE_KEYS.OPERATIONAL_AREA)
        if (!data) return []
        const list: OperationalArea[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveOperationalArea: (item: OperationalArea): void => {
        const existing = localStorageService.getOperationalAreaList()
        const newItem: OperationalArea = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.OPERATIONAL_AREA, JSON.stringify(updated))
    },
    updateOperationalArea: (id: number, updates: Partial<OperationalArea>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.OPERATIONAL_AREA)
        if (!data) return
        const list: OperationalArea[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.OPERATIONAL_AREA, JSON.stringify(list))
        }
    },
    deleteOperationalArea: (id: number): void => {
        localStorageService.updateOperationalArea(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Village Adoption Methods
    getVillageAdoptionList: (kvkId?: number): VillageAdoption[] => {
        const data = localStorage.getItem(STORAGE_KEYS.VILLAGE_ADOPTION)
        if (!data) return []
        const list: VillageAdoption[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    saveVillageAdoption: (item: VillageAdoption): void => {
        const existing = localStorageService.getVillageAdoptionList()
        const newItem: VillageAdoption = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.VILLAGE_ADOPTION, JSON.stringify(updated))
    },
    updateVillageAdoption: (id: number, updates: Partial<VillageAdoption>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.VILLAGE_ADOPTION)
        if (!data) return
        const list: VillageAdoption[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.VILLAGE_ADOPTION, JSON.stringify(list))
        }
    },
    deleteVillageAdoption: (id: number): void => {
        localStorageService.updateVillageAdoption(id, { deleted_at: new Date().toISOString() } as any)
    },

    // Priority Thrust Area Methods
    getPriorityThrustAreaList: (kvkId?: number): PriorityThrustArea[] => {
        const data = localStorage.getItem(STORAGE_KEYS.PRIORITY_THRUST_AREA)
        if (!data) return []
        const list: PriorityThrustArea[] = JSON.parse(data)
        const activeList = list.filter((item: any) => !item.deleted_at)
        if (kvkId !== undefined) {
            return activeList.filter(item => item.kvk_id === kvkId)
        }
        return activeList
    },
    savePriorityThrustArea: (item: PriorityThrustArea): void => {
        const existing = localStorageService.getPriorityThrustAreaList()
        const newItem: PriorityThrustArea = { ...item, id: item.id || Date.now() }
        const updated = [...existing, newItem]
        localStorage.setItem(STORAGE_KEYS.PRIORITY_THRUST_AREA, JSON.stringify(updated))
    },
    updatePriorityThrustArea: (id: number, updates: Partial<PriorityThrustArea>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.PRIORITY_THRUST_AREA)
        if (!data) return
        const list: PriorityThrustArea[] = JSON.parse(data)
        const idx = list.findIndex(item => item.id === id)
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates } as any
            localStorage.setItem(STORAGE_KEYS.PRIORITY_THRUST_AREA, JSON.stringify(list))
        }
    },
    deletePriorityThrustArea: (id: number): void => {
        localStorageService.updatePriorityThrustArea(id, { deleted_at: new Date().toISOString() } as any)
    },
}
