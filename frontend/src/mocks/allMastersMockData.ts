// Centralized mock data for All Masters (Basic, OFT/FLD, etc.)
// This consolidates the mock tables used in the legacy View* components
// so that `MasterView` and route-based pages can consume them dynamically.

export interface MasterMockRecord {
  id: number
  // Other fields are dynamic (zoneName, stateName, etc.) 
  [key: string]: any
}

// Basic Masters
const zones: MasterMockRecord[] = [
  { id: 1, zoneName: 'ICAR-ATARI-Patna' },
  { id: 2, zoneName: 'ICAR-ATARI-Kolkata' },
  { id: 3, zoneName: 'ICAR-ATARI-Ludhiana' },
]

const states: MasterMockRecord[] = [
  { id: 1, zoneName: 'ICAR-ATARI-Patna', stateName: 'Bihar' },
  { id: 2, zoneName: 'ICAR-ATARI-Patna', stateName: 'Jharkhand' },
  { id: 3, zoneName: 'ICAR-ATARI-Kolkata', stateName: 'West Bengal' },
  { id: 4, zoneName: 'ICAR-ATARI-Kolkata', stateName: 'Odisha' },
]

const organizations: MasterMockRecord[] = [
  {
    id: 1,
    stateName: 'Bihar',
    universityName: 'Bihar Agricultural University, Sabour',
  },
  {
    id: 2,
    stateName: 'Jharkhand',
    universityName: 'Birsa Agricultural University, Ranchi',
  },
  {
    id: 3,
    stateName: 'Bihar',
    universityName:
      'Dr. Rajendra Prasad Central Agricultural University (DRPCAU), Pusa',
  },
  {
    id: 4,
    stateName: 'Bihar',
    universityName:
      'Bihar Animal Sciences University (BASU), Patna',
  },
  {
    id: 5,
    stateName: 'West Bengal',
    universityName: 'Bidhan Chandra Krishi Viswavidyalaya, Nadia',
  },
]

const districts: MasterMockRecord[] = [
  {
    id: 1,
    zoneName: 'ICAR-ATARI-Patna',
    stateName: 'Bihar',
    districtName: 'Araria',
  },
  {
    id: 2,
    zoneName: 'ICAR-ATARI-Patna',
    stateName: 'Bihar',
    districtName: 'Arwal',
  },
  {
    id: 3,
    zoneName: 'ICAR-ATARI-Patna',
    stateName: 'Bihar',
    districtName: 'Aurangabad',
  },
  {
    id: 4,
    zoneName: 'ICAR-ATARI-Patna',
    stateName: 'Bihar',
    districtName: 'Banka',
  },
  {
    id: 5,
    zoneName: 'ICAR-ATARI-Patna',
    stateName: 'Jharkhand',
    districtName: 'Bokaro',
  },
]

// Registry keyed by route path so that `App.tsx` and other utilities
// can fetch mock data in a single place.
const allMastersMockRegistry: Record<string, MasterMockRecord[]> = {
  '/all-master/zones': zones,
  '/all-master/states': states,
  '/all-master/organizations': organizations,
  '/all-master/universities': organizations, // reuse for universities view
  '/all-master/districts': districts,
}

export const getAllMastersMockData = (path: string): MasterMockRecord[] => {
  return allMastersMockRegistry[path] ? [...allMastersMockRegistry[path]] : []
}

