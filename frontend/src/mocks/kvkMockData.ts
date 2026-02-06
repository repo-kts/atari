import { KVKDetails } from '../types/kvk'
import { BankAccount } from '../types/bankAccount'
import { Staff } from '../types/staff'
import { TechnologyWeek } from '../types/technologyWeek'

export interface Vehicle {
    id: number
    kvk_id: number
    type: string
    model: string
    registration_no: string
    purchase_year: number
}

export interface Equipment {
    id: number
    kvk_id: number
    name: string
    category: string
    quantity: number
    condition: string
}

const mockKVKs: KVKDetails[] = [
    {
        id: 1,
        kvk_name: 'Demo KVK',
        mobile: '9876543210',
        email: 'demo@kvk.in',
        fax: '011-22223333',
        landline: '011-22224444',
        address: '123 Demo Street, City',
        org_name: 'Demo Org',
        org_mobile: '9999999999',
        org_landline: '011-11112222',
        org_fax: '011-11113333',
        org_email: 'org@demo.in',
        org_address: 'Org Address Demo',
        sanction_year: '2012',
        total_land: '25 Acres',
        state: { state_name: 'Delhi', zone: { zone_name: 'Zone IV' } } as any,
        district: { district_name: 'New Delhi' } as any,
        university: { university_name: 'Demo University' } as any,
        created_at: '',
        updated_at: '',
        state_id: 1,
        district_id: 1,
        uni_id: 1,
    },
]

const mockBankAccounts: BankAccount[] = [
    {
        id: 1,
        kvk_id: 1,
        user_id: 1,
        account_type: 'Savings',
        account_name: 'Demo KVK Savings',
        bank_name: 'Demo Bank',
        location: 'New Delhi',
        account_number: '1234567890',
        created_at: '',
        updated_at: '',
    },
    {
        id: 2,
        kvk_id: 1,
        user_id: 1,
        account_type: 'Current',
        account_name: 'Demo KVK Current',
        bank_name: 'Demo Bank',
        location: 'New Delhi',
        account_number: '9876543210',
        created_at: '',
        updated_at: '',
    },
]

const mockStaff: Staff[] = [
    {
        id: 1,
        kvk_id: 1,
        staff_name: 'Dr. Asha Sharma',
        post: { post_name: 'Senior Scientist' } as any,
        post_id: 1,
        position: 1,
        pay_scale: 'Level 12',
        pay_band: 'PB-3',
        date_of_joining: '2012-01-01',
        releaving_date: '',
        designation: 'Scientist',
        dob: '1975-01-01',
        alliances: '',
        specialization: 'Agronomy',
        cast_category: 'General',
        mobile: '9998887777',
        email: 'asha@kvk.in',
        discipline: 'Agronomy',
        job_type: 'Permanent',
        is_transferred: 0,
        created_at: '',
        updated_at: '',
    },
    {
        id: 2,
        kvk_id: 1,
        staff_name: 'Mr. Raj Verma',
        post: { post_name: 'Programme Assistant' } as any,
        post_id: 2,
        position: 2,
        pay_scale: 'Level 6',
        pay_band: 'PB-2',
        date_of_joining: '2018-05-05',
        releaving_date: '',
        designation: 'Assistant',
        dob: '1985-05-05',
        alliances: '',
        specialization: 'Horticulture',
        cast_category: 'OBC',
        mobile: '8887776666',
        email: 'raj@kvk.in',
        discipline: 'Horticulture',
        job_type: 'Contract',
        is_transferred: 1,
        created_at: '',
        updated_at: '',
    },
]

const mockVehicles: Vehicle[] = [
    { id: 1, kvk_id: 1, type: 'Jeep', model: 'Mahindra Bolero', registration_no: 'DL 01 AB 1234', purchase_year: 2018 },
    { id: 2, kvk_id: 1, type: 'Tractor', model: 'Swaraj 744', registration_no: 'DL 02 CD 5678', purchase_year: 2020 },
]

const mockEquipments: Equipment[] = [
    { id: 1, kvk_id: 1, name: 'Soil Testing Kit', category: 'Lab', quantity: 2, condition: 'Good' },
    { id: 2, kvk_id: 1, name: 'Power Tiller', category: 'Field', quantity: 1, condition: 'Excellent' },
    { id: 3, kvk_id: 1, name: 'Sprayer', category: 'Field', quantity: 5, condition: 'Good' },
]

// Vehicle list view mock (general list)
export const mockVehicleList = [
    { id: 1, kvk_name: 'KVK Nawada', vehicle_name: 'Motor Cycle- (Glamour)', registration_no: 'BR27D9385', year: 2024, total_cost: 43931, total_run: 30650, status: 'Working' },
    { id: 2, kvk_name: 'KVK Jamui', vehicle_name: 'Jeep', registration_no: 'BR46C 3028', year: 2025, total_cost: 192020, total_run: 295295, status: 'Functional' },
    { id: 3, kvk_name: 'KVK Saharsa', vehicle_name: 'Tractor', registration_no: 'BR', year: 2025, total_cost: 382000, total_run: 1600, status: 'Good' },
    { id: 4, kvk_name: 'KVK Dhanbad', vehicle_name: 'Tractor With Trolley', registration_no: 'JH01N3777', year: 2025, total_cost: 386544, total_run: 2246, status: 'Working' },
]

// Vehicle detail view mock (richer fields)
export const mockVehicleDetails = [
    { id: 1, year: 2024, kvk_name: 'KVK Nawada', vehicle_name: 'Motor Cycle- (Glamour)', registration_no: 'BR27D9385', total_run: 43931, status: 'Working' },
    { id: 2, year: 2024, kvk_name: 'KVK Nawada', vehicle_name: 'Motor Cycle- (I-Smart)', registration_no: 'BR27B9384', total_run: 27931, status: 'Working' },
    { id: 3, year: 2024, kvk_name: 'KVK Nawada', vehicle_name: 'Bolero', registration_no: 'BR27W2620', total_run: 320019, status: 'Condemned' },
    { id: 4, year: 2025, kvk_name: 'KVK Jamui', vehicle_name: 'Jeep', registration_no: 'BR46C 3028', total_run: 192020, status: 'Functional' },
    { id: 5, year: 2025, kvk_name: 'KVK Saharsa', vehicle_name: 'Motorcycle', registration_no: 'BR 19H1220', total_run: 18893, status: 'Good' },
    { id: 6, year: 2025, kvk_name: 'KVK Saharsa', vehicle_name: 'Bolero', registration_no: 'BR 19P0640', total_run: 160406, status: 'Good' },
    { id: 7, year: 2025, kvk_name: 'KVK Saharsa', vehicle_name: 'Tractor', registration_no: 'BR', total_run: 1600, status: 'Good' },
    { id: 8, year: 2025, kvk_name: 'KVK Saharsa', vehicle_name: 'Motorcycle', registration_no: 'BR 19H1220', total_run: 12603, status: 'Good' },
    { id: 9, year: 2025, kvk_name: 'KVK Dhanbad', vehicle_name: 'Tractor With Trolley', registration_no: 'JH01N3777', total_run: 0, status: 'Working' },
    { id: 10, year: 2025, kvk_name: 'KVK Dhanbad', vehicle_name: 'Tata Sumo', registration_no: 'JH01P9791', total_run: 0, status: 'Condemned' },
]

// Equipment list view mock (general list)
export const mockEquipmentList = [
    { id: 1, kvk_name: 'KVK Araria', equipment_name: 'Carrot Juicer/Vegetable Juicer', year: 2012, total_cost: 21000, status: 'Not working', source_of_fund: 'ICAR' },
    { id: 2, kvk_name: 'KVK Giridih', equipment_name: 'Laminar Airflow', year: 2025, total_cost: 59871, status: 'Working', source_of_fund: 'ICAR' },
    { id: 3, kvk_name: 'KVK Koderma', equipment_name: 'Up base pH Meter model 362 systronics', year: 2025, total_cost: 0, status: 'Working', source_of_fund: 'ICAR' },
    { id: 4, kvk_name: 'KVK Koderma', equipment_name: 'Digital flame photometer model 130', year: 2025, total_cost: 0, status: 'Working', source_of_fund: 'ICAR' },
]

// Equipment detail view mock (richer fields)
export const mockEquipmentDetails = [
    { id: 1, year: 2025, kvk_name: 'KVK Koderma', equipment_name: 'Up base pH Meter model 362 systronics', source_of_fund: '0', status: 'working' },
    { id: 2, year: 2025, kvk_name: 'KVK Koderma', equipment_name: 'Visccal spectrophotometer systronicmodle 167', source_of_fund: '0', status: 'WORKING' },
    { id: 3, year: 2025, kvk_name: 'KVK Koderma', equipment_name: 'Digital flame photometer model 130 with Na K Filter', source_of_fund: '0', status: 'WORKING' },
    { id: 4, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'Balance (Digital) 1pc', source_of_fund: '0', status: 'Working' },
    { id: 5, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'Bod incubator, ‘SANCO’ 1pc', source_of_fund: '0', status: 'Working' },
    { id: 6, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'Laminar Airflow ‘SANCO’ 1pc', source_of_fund: '0', status: 'Working' },
    { id: 7, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'Autoclave SANCO’ 1pc', source_of_fund: '0', status: 'Working' },
    { id: 8, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'Hygrometer (0–99%) 10pc', source_of_fund: '0', status: 'Working' },
    { id: 9, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'Thermometer 10–1100C 10pc', source_of_fund: '0', status: 'Working' },
    { id: 10, year: 2025, kvk_name: 'KVK Giridih', equipment_name: 'U V chamber 1pc', source_of_fund: '0', status: 'Working' },
]

// Infrastructure list view mock
export const mockInfrastructureList = [
    { id: 1, kvk_name: 'KVK Araria', infrastructure: 'Admin Building', not_started: 'No', plinth: 'Yes', lintel: 'Yes', roof: 'Yes', total_completed: 'Yes', plinth_area: '26423', under_use: 'Yes' },
    { id: 2, kvk_name: 'KVK Araria', infrastructure: 'Farmers Hostel', not_started: 'No', plinth: 'Yes', lintel: 'Yes', roof: 'Yes', total_completed: 'Yes', plinth_area: '25620', under_use: 'Yes' },
    { id: 3, kvk_name: 'KVK Arwal', infrastructure: 'Staff Quarters', not_started: 'Yes', plinth: 'No', lintel: 'No', roof: 'No', total_completed: 'No', plinth_area: '0', under_use: 'No' },
    { id: 4, kvk_name: 'KVK Arwal', infrastructure: 'Farm godown', not_started: 'No', plinth: 'No', lintel: 'No', roof: 'No', total_completed: 'Yes', plinth_area: '0', under_use: 'Yes' },
]

export const mockTechnologyWeek: TechnologyWeek[] = [
    {
        id: 1,
        kvk_id: 1,
        kvk_name: 'Demo KVK',
        reporting_year: '2026',
        start_date: '2024-05-15',
        end_date: '2024-05-22',
        type_of_activity: 'Celebration of Technology Week 2024',
        no_of_activities: 7,
        related_technology: 'Crop Protection, Organic Farming',
        no_of_participants: 250
    },
    {
        id: 2,
        kvk_id: 2,
        kvk_name: 'KVK Nawada',
        reporting_year: '2026',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        type_of_activity: 'Technology Demonstration Week',
        no_of_activities: 5,
        related_technology: 'Drip Irrigation, Hydroponics',
        no_of_participants: 180
    }
]

export const getMockKVKs = () => mockKVKs
export const getMockKVKById = (id: number) => mockKVKs.find(k => k.id === id) || null
export const getMockBankAccounts = (kvkId: number) => mockBankAccounts.filter(acc => acc.kvk_id === kvkId)
export const getMockStaff = (kvkId: number) => mockStaff.filter(s => s.kvk_id === kvkId)
export const getMockVehicles = (kvkId: number) => mockVehicles.filter(v => v.kvk_id === kvkId)
export const getMockEquipments = (kvkId: number) => mockEquipments.filter(e => e.kvk_id === kvkId)
export const getMockVehicleList = () => mockVehicleList
export const getMockVehicleDetails = () => mockVehicleDetails
export const getMockEquipmentList = () => mockEquipmentList
export const getMockEquipmentDetails = () => mockEquipmentDetails
export const getMockInfrastructureList = () => mockInfrastructureList
export const getMockTechnologyWeek = () => mockTechnologyWeek
