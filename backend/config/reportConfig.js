/**
 * Report Configuration
 * Defines the structure, sections, and data sources for KVK reports
 */

const reportConfig = {
    metadata: {
        name: 'KVK Comprehensive Report',
        version: '1.0.0',
        description: 'Comprehensive report containing all modules for KVK',
    },

    sections: [
        // --- ROOT CATEGORIES ---
        { id: '1', title: 'About KVK', description: 'KVK Profile and Staff details' },
        { id: '2', title: 'Achievements', description: 'KVK Achievements and Activities' },
        { id: '3', title: 'Projects', description: 'Special Projects and Programmes' },
        { id: '4', title: 'Performance Indicators', description: 'Impact and Infrastructure Performance' },
        { id: '5', title: 'Miscellaneous', description: 'Diseases and Other Programmes' },
        { id: '6', title: 'Digital Information', description: 'Mobile Apps and Web Portals' },
        { id: '7', title: 'Swachhta Bharat Abhiyaan', description: 'Cleanliness Activities' },
        { id: '8', title: 'Meetings', description: 'SAC and Other Meetings' },

        // --- CATEGORY 1: ABOUT KVK ---
        { id: '1.1', title: 'View KVKs', subsection: true, parentSectionId: '1' },
        { id: '1.1.1', title: 'View KVKs', subsection: true, parentSectionId: '1.1', dataSource: 'kvk', format: 'formatted-text', fields: [{ dbField: 'kvkName', displayName: 'KVK Name' }] },

        { id: '1.2', title: 'Basic Information', subsection: true, parentSectionId: '1' },
        { id: '1.2.1', title: 'Bank Account Details', subsection: true, parentSectionId: '1.2', dataSource: 'kvkBankAccounts', format: 'table', fields: [{ dbField: 'bankName', displayName: 'Bank' }] },
        { id: '1.2.2', title: 'Employee Details', subsection: true, parentSectionId: '1.2', dataSource: 'kvkEmployees', format: 'table', fields: [{ dbField: 'staffName', displayName: 'Name' }] },
        { id: '1.2.3', title: 'Staff Transferred', subsection: true, parentSectionId: '1.2', dataSource: 'kvkStaffTransferred', format: 'table', fields: [{ dbField: 'staffName', displayName: 'Name' }] },
        { id: '1.2.4', title: 'Infrastructure Details', subsection: true, parentSectionId: '1.2', dataSource: 'kvkInfrastructure', format: 'table', fields: [{ dbField: 'infraMaster.name', displayName: 'Infrastructure' }] },

        { id: '1.3', title: 'Vehicles', subsection: true, parentSectionId: '1' },
        { id: '1.3.1', title: 'View Vehicles', subsection: true, parentSectionId: '1.3', dataSource: 'kvkVehicles', format: 'table', fields: [{ dbField: 'vehicleName', displayName: 'Vehicle' }] },
        { id: '1.3.2', title: 'Vehicle Details', subsection: true, parentSectionId: '1.3', dataSource: 'kvkVehicles', format: 'grouped-table', fields: [{ dbField: 'vehicleName', displayName: 'Vehicle' }] },

        { id: '1.4', title: 'Equipments', subsection: true, parentSectionId: '1' },
        { id: '1.4.1', title: 'View Equipments', subsection: true, parentSectionId: '1.4', dataSource: 'kvkEquipments', format: 'table', fields: [{ dbField: 'equipmentName', displayName: 'Equipment' }] },
        { id: '1.4.2', title: 'Equipment Details', subsection: true, parentSectionId: '1.4', dataSource: 'kvkEquipments', format: 'grouped-table', fields: [{ dbField: 'equipmentName', displayName: 'Equipment' }] },

        { id: '1.5', title: 'Farm Implements', subsection: true, parentSectionId: '1' },
        { id: '1.5.1', title: 'Farm Implement Details', subsection: true, parentSectionId: '1.5', dataSource: 'kvkFarmImplements', format: 'table', fields: [{ dbField: 'implementName', displayName: 'Implement' }] },

        // --- CATEGORY 2: ACHIEVEMENTS ---
        { id: '2.1', title: 'Technical Achievement Summary', subsection: true, parentSectionId: '2' },
        { id: '2.1.1', title: 'Technical Achievement Summary', subsection: true, parentSectionId: '2.1', dataSource: 'achievementsTechnical', format: 'table', fields: [{ dbField: 'summary', displayName: 'Summary' }] },

        { id: '2.2', title: 'OFT & FLD', subsection: true, parentSectionId: '2' },
        { id: '2.2.1', title: 'OFT', subsection: true, parentSectionId: '2.2', dataSource: 'achievementsOft', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.2.2', title: 'FLD - View FLD', subsection: true, parentSectionId: '2.2', dataSource: 'achievementsFld', format: 'table', fields: [{ dbField: 'fldName', displayName: 'FLD Name' }] },
        { id: '2.2.3', title: 'Extension & Training activities under FLD', subsection: true, parentSectionId: '2.2', dataSource: 'achievementsFldExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.2.4', title: 'Technical Feedback on FLD', subsection: true, parentSectionId: '2.2', dataSource: 'achievementsFldTechnical', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '2.3', title: 'Training & Extension', subsection: true, parentSectionId: '2' },
        { id: '2.3.1', title: 'Trainings', subsection: true, parentSectionId: '2.3', dataSource: 'achievementsTrainings', format: 'table', fields: [{ dbField: 'titleOfTraining', displayName: 'Title' }] },
        { id: '2.3.2', title: 'Extension Activities', subsection: true, parentSectionId: '2.3', dataSource: 'achievementsExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.3.3', title: 'Other Extension Activities', subsection: true, parentSectionId: '2.3', dataSource: 'achievementsOtherExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.3.4', title: 'Technology Week', subsection: true, parentSectionId: '2.3', dataSource: 'achievementsTechWeek', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.3.5', title: 'Celebration Days', subsection: true, parentSectionId: '2.3', dataSource: 'achievementsCelebrationDays', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '2.4', title: 'Production & Supply', subsection: true, parentSectionId: '2' },
        { id: '2.4.1', title: 'Production and Supply', subsection: true, parentSectionId: '2.4', dataSource: 'achievementsProductionSupply', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '2.5', title: 'Soil and Water Testing', subsection: true, parentSectionId: '2' },
        { id: '2.5.1', title: 'Equipment Details', subsection: true, parentSectionId: '2.5', dataSource: 'achievementsSoilWater', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.5.2', title: 'Analysis Details', subsection: true, parentSectionId: '2.5', dataSource: 'achievementsSoilAnalysis', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '2.5.3', title: 'World Soil Day', subsection: true, parentSectionId: '2.5', dataSource: 'achievementsWorldSoilDay', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '2.6', title: 'Projects', subsection: true, parentSectionId: '2' },
        { id: '2.6.1', title: 'View All Projects', subsection: true, parentSectionId: '2.6', dataSource: 'achievementsProjects', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '2.7', title: 'Publications', subsection: true, parentSectionId: '2' },
        { id: '2.7.1', title: 'Publications', subsection: true, parentSectionId: '2.7', dataSource: 'achievementsPublications', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '2.8', title: 'Award and Recognition', subsection: true, parentSectionId: '2' },
        { id: '2.8.1', title: 'KVK Awards', subsection: true, parentSectionId: '2.8', dataSource: 'achievementsKvkAward', format: 'table', fields: [{ dbField: 'awardName', displayName: 'Name' }] },
        { id: '2.8.2', title: 'Scientist Awards', subsection: true, parentSectionId: '2.8', dataSource: 'achievementsScientistAward', format: 'table', fields: [{ dbField: 'awardName', displayName: 'Name' }] },
        { id: '2.8.3', title: 'Farmer Awards', subsection: true, parentSectionId: '2.8', dataSource: 'achievementsFarmerAward', format: 'table', fields: [{ dbField: 'awardName', displayName: 'Name' }] },

        { id: '2.9', title: 'Human Resources Development', subsection: true, parentSectionId: '2' },
        { id: '2.9.1', title: 'Human Resources Development', subsection: true, parentSectionId: '2.9', dataSource: 'achievementsHrd', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        // --- CATEGORY 3: PROJECTS ---
        { id: '3.1', title: 'SWM', subsection: true, parentSectionId: '3' },
        { id: '3.1.1', title: 'Soil Health Card', subsection: true, parentSectionId: '3.1', dataSource: 'projectSwmHealth', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.1.2', title: 'Extension Activity', subsection: true, parentSectionId: '3.1', dataSource: 'projectSwmExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.1.3', title: 'Budget Information', subsection: true, parentSectionId: '3.1', dataSource: 'projectSwmBudget', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.2', title: 'Climate Resilient Agriculture (CRA)', subsection: true, parentSectionId: '3' },
        { id: '3.2.1', title: 'CRA Form', subsection: true, parentSectionId: '3.2', dataSource: 'projectCraForm', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.2.2', title: 'Extension Activity', subsection: true, parentSectionId: '3.2', dataSource: 'projectCraExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.3', title: 'CBA/FLD/TCB', subsection: true, parentSectionId: '3' },
        { id: '3.3.1', title: 'CFLD (Pulses & Oilseeds)', subsection: true, parentSectionId: '3.3', dataSource: 'projectCfld', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.3.2', title: 'Skill Development', subsection: true, parentSectionId: '3.3', dataSource: 'projectTcbSkill', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.4', title: 'ARYA', subsection: true, parentSectionId: '3' },
        { id: '3.4.1', title: 'ARYA Details', subsection: true, parentSectionId: '3.4', dataSource: 'projectAryaDetails', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.4.2', title: 'ARYA Activity', subsection: true, parentSectionId: '3.4', dataSource: 'projectAryaActivity', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.5', title: 'NARI', subsection: true, parentSectionId: '3' },
        { id: '3.5.1', title: 'Nutrition Gardens', subsection: true, parentSectionId: '3.5', dataSource: 'projectNariNutriGarden', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.5.2', title: 'Bio fortified Crops', subsection: true, parentSectionId: '3.5', dataSource: 'projectNariBioFortified', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.5.3', title: 'Value Addition', subsection: true, parentSectionId: '3.5', dataSource: 'projectNariValueAddition', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.5.4', title: 'Training Programs', subsection: true, parentSectionId: '3.5', dataSource: 'projectNariTraining', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.5.5', title: 'Extension Activities', subsection: true, parentSectionId: '3.5', dataSource: 'projectNariExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.6', title: 'NICRA', subsection: true, parentSectionId: '3' },
        { id: '3.6.1', title: 'General Data', subsection: true, parentSectionId: '3.6', dataSource: 'projectNicraBasic', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.6.2', title: 'Extension Activity', subsection: true, parentSectionId: '3.6', dataSource: 'projectNicraExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.6.3', title: 'Previous Year Evaluation', subsection: true, parentSectionId: '3.6', dataSource: 'projectNicraEval', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.7', title: 'CSISA', subsection: true, parentSectionId: '3' },
        { id: '3.7.1', title: 'CSISA', subsection: true, parentSectionId: '3.7', dataSource: 'projectCsisa', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.8', title: 'TSP/SCSP', subsection: true, parentSectionId: '3' },
        { id: '3.8.1', title: 'Project Detail', subsection: true, parentSectionId: '3.8', dataSource: 'projectTspScsp', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.9', title: 'KIM', subsection: true, parentSectionId: '3' },
        { id: '3.9.1', title: 'Basic Information', subsection: true, parentSectionId: '3.9', dataSource: 'projectKimBasic', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.9.2', title: 'Events', subsection: true, parentSectionId: '3.9', dataSource: 'projectKimEvents', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.9.3', title: 'Training', subsection: true, parentSectionId: '3.9', dataSource: 'projectKimTraining', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.9.4', title: 'Extension Activity', subsection: true, parentSectionId: '3.9', dataSource: 'projectKimExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.10', title: 'Swachh Bharat', subsection: true, parentSectionId: '3' },
        { id: '3.10.1', title: 'Sewa Abhiyan', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaSewa', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.10.2', title: 'Resource Assessment', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaResource', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.10.3', title: 'Cleanliness Thinking', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaThinking', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.10.4', title: 'Swachhata Card', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaCard', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.10.5', title: 'Awareness Program', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaAwareness', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.10.6', title: 'Budget Details', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaBudget', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.10.7', title: 'Action Plans', subsection: true, parentSectionId: '3.10', dataSource: 'swachhtaAction', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.11', title: 'Natural Farming', subsection: true, parentSectionId: '3' },
        { id: '3.11.1', title: 'Natural Farm Information', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfInfo', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.11.2', title: 'Digital Information', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfDigital', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.11.3', title: 'Extension Activities', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfExtension', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.11.4', title: 'Business Training', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfBiz', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.11.5', title: 'Field Visit', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfField', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.11.6', title: 'Unit Visit', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfUnit', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.11.7', title: 'Output Assessment', subsection: true, parentSectionId: '3.11', dataSource: 'projectNfOutput', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.12', title: 'Agri Drone', subsection: true, parentSectionId: '3' },
        { id: '3.12.1', title: 'Agri Drone', subsection: true, parentSectionId: '3.12', dataSource: 'projectDroneInfo', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '3.12.2', title: 'Demonstration', subsection: true, parentSectionId: '3.12', dataSource: 'projectDroneDemo', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.13', title: 'Seed Hub Program', subsection: true, parentSectionId: '3' },
        { id: '3.13.1', title: 'Seed Hub Program', subsection: true, parentSectionId: '3.13', dataSource: 'projectSeedHub', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '3.14', title: 'Other Programs', subsection: true, parentSectionId: '3' },
        { id: '3.14.1', title: 'Other Programs', subsection: true, parentSectionId: '3.14', dataSource: 'projectOtherProgram', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        // --- CATEGORY 4: PERFORMANCE INDICATORS ---
        { id: '4.1', title: 'Impact', subsection: true, parentSectionId: '4' },
        { id: '4.1.1', title: 'Impact of KVK activities', subsection: true, parentSectionId: '4.1', dataSource: 'performanceImpactKvk', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.1.2', title: 'Entrepreneurship', subsection: true, parentSectionId: '4.1', dataSource: 'performanceImpactEnt', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.1.3', title: 'Success Stories', subsection: true, parentSectionId: '4.1', dataSource: 'performanceImpactSuccess', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '4.2', title: 'District and Village Performance', subsection: true, parentSectionId: '4' },
        { id: '4.2.1', title: 'District Level Data', subsection: true, parentSectionId: '4.2', dataSource: 'performanceDistrictLevel', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.2.2', title: 'Operational Area Details', subsection: true, parentSectionId: '4.2', dataSource: 'performanceOperationalArea', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.2.3', title: 'Village Adoption Programme', subsection: true, parentSectionId: '4.2', dataSource: 'performanceVillageAdoption', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.2.4', title: 'Priority Thrust Area', subsection: true, parentSectionId: '4.2', dataSource: 'performancePriorityThrust', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '4.3', title: 'Infrastructure Performance', subsection: true, parentSectionId: '4' },
        { id: '4.3.1', title: 'Demonstration Units', subsection: true, parentSectionId: '4.3', dataSource: 'performanceDemoUnits', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.3.2', title: 'Instructional Farm (crops)', subsection: true, parentSectionId: '4.3', dataSource: 'performanceFarmCrops', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.3.3', title: 'Production Units', subsection: true, parentSectionId: '4.3', dataSource: 'performanceProductionUnits', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.3.4', title: 'Instructional Farm (livestock)', subsection: true, parentSectionId: '4.3', dataSource: 'performanceFarmLivestock', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.3.5', title: 'Hostel Facilities', subsection: true, parentSectionId: '4.3', dataSource: 'performanceHostel', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.3.6', title: 'Staff Quarters', subsection: true, parentSectionId: '4.3', dataSource: 'performanceStaffQuarters', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.3.7', title: 'Rain Water Harvesting', subsection: true, parentSectionId: '4.3', dataSource: 'performanceRainWater', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '4.4', title: 'Financial Performance', subsection: true, parentSectionId: '4' },
        { id: '4.4.1', title: 'Budget Details', subsection: true, parentSectionId: '4.4', dataSource: 'performanceBudget', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.4.2', title: 'Project-wise Budget', subsection: true, parentSectionId: '4.4', dataSource: 'performanceProjectBudget', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.4.3', title: 'Revolving Fund Status', subsection: true, parentSectionId: '4.4', dataSource: 'performanceRevolvingFund', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.4.4', title: 'Revenue generation', subsection: true, parentSectionId: '4.4', dataSource: 'performanceRevenue', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '4.5', title: 'Linkages', subsection: true, parentSectionId: '4' },
        { id: '4.5.1', title: 'Functional Linkage', subsection: true, parentSectionId: '4.5', dataSource: 'performanceLinkage', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '4.5.2', title: 'Special Programmes', subsection: true, parentSectionId: '4.5', dataSource: 'performanceSpecial', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        // --- CATEGORY 5: MISCELLANEOUS ---
        { id: '5.1', title: 'Prevalent Diseases', subsection: true, parentSectionId: '5' },
        { id: '5.1.1', title: 'Prevalent diseases (Crops)', subsection: true, parentSectionId: '5.1', dataSource: 'miscDiseasesCrops', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '5.1.2', title: 'Prevalent diseases (Livestock/Fishery)', subsection: true, parentSectionId: '5.1', dataSource: 'miscDiseasesLivestock', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '5.2', title: 'Nehru Yuva Kendra', subsection: true, parentSectionId: '5' },
        { id: '5.2.1', title: 'Nehru Yuva Kendra', subsection: true, parentSectionId: '5.2', dataSource: 'miscNyk', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '5.3', title: 'PPV & FRA Sensitization', subsection: true, parentSectionId: '5' },
        { id: '5.3.1', title: 'Training & Awareness Program', subsection: true, parentSectionId: '5.3', dataSource: 'miscPpvFraTraining', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '5.3.2', title: 'Details of Plant Varieties', subsection: true, parentSectionId: '5.3', dataSource: 'miscPlantVarieties', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '5.4', title: 'RAWE/FET Programme', subsection: true, parentSectionId: '5' },
        { id: '5.4.1', title: 'RAWE/FET programme', subsection: true, parentSectionId: '5.4', dataSource: 'miscRaweFet', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        { id: '5.5', title: 'VIP Visitors', subsection: true, parentSectionId: '5' },
        { id: '5.5.1', title: 'VIP visitors', subsection: true, parentSectionId: '5.5', dataSource: 'miscVipVisitors', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        // --- CATEGORY 6: DIGITAL INFORMATION ---
        { id: '6.1', title: 'Digital Information', subsection: true, parentSectionId: '6' },
        { id: '6.1.1', title: 'Mobile App', subsection: true, parentSectionId: '6.1', dataSource: 'digitalMobileApp', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '6.1.2', title: 'Web Portal', subsection: true, parentSectionId: '6.1', dataSource: 'digitalWebPortal', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '6.1.3', title: 'Kisan Sarathi', subsection: true, parentSectionId: '6.1', dataSource: 'digitalKisanSarathi', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '6.1.4', title: 'Kisan Mobile Advisory', subsection: true, parentSectionId: '6.1', dataSource: 'digitalKisanMobile', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '6.1.5', title: 'Other channels', subsection: true, parentSectionId: '6.1', dataSource: 'digitalOtherChannels', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        // --- CATEGORY 7: SWACHHTA BHARAT ABHIYAAN ---
        { id: '7.1', title: 'Swachhta Bharat Abhiyaan', subsection: true, parentSectionId: '7' },
        { id: '7.1.1', title: 'Swachhta hi Sewa', subsection: true, parentSectionId: '7.1', dataSource: 'swachhtaSewa', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '7.1.2', title: 'Swachta Pakhwada', subsection: true, parentSectionId: '7.1', dataSource: 'swachhtaPakhwada', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '7.1.3', title: 'Budget expenditure', subsection: true, parentSectionId: '7.1', dataSource: 'swachhtaBudget', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },

        // --- CATEGORY 8: MEETINGS ---
        { id: '8.1', title: 'Meetings', subsection: true, parentSectionId: '8' },
        { id: '8.1.1', title: 'SAC Meetings', subsection: true, parentSectionId: '8.1', dataSource: 'meetingsSac', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
        { id: '8.1.2', title: 'Other meetings', subsection: true, parentSectionId: '8.1', dataSource: 'meetingsOther', format: 'table', fields: [{ dbField: 'title', displayName: 'Title' }] },
    ],
};

/**
 * Get section configuration by ID
 */
function getSectionConfig(sectionId) {
    return reportConfig.sections.find(s => s.id === sectionId);
}

/**
 * Get all sections
 */
function getAllSections() {
    return reportConfig.sections;
}

/**
 * Get sections by data source
 */
function getSectionsByDataSource(dataSource) {
    return reportConfig.sections.filter(s => s.dataSource === dataSource);
}

/**
 * Validate section IDs
 */
function validateSectionIds(sectionIds) {
    const validIds = reportConfig.sections.map(s => s.id);
    const invalidIds = sectionIds.filter(id => !validIds.includes(id));
    if (invalidIds.length > 0) {
        throw new Error(`Invalid section IDs: ${invalidIds.join(', ')}`);
    }
    return true;
}

module.exports = {
    reportConfig,
    getSectionConfig,
    getAllSections,
    getSectionsByDataSource,
    validateSectionIds,
};
