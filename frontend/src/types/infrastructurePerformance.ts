export interface DemonstrationUnit {
    id: number;
    kvk_name: string; // KVK Name
    demo_unit_name: string; // Name of Demo Unit
    year_of_estt: string; // Year of estt.
    area: string; // Area(Sq. mt)
    reporting_year: string;
}

export interface InstructionalFarmCrop {
    id: number;
    kvk_name: string;
    crop_name: string; // Name Of the Crop
    area: string; // Area(ha)
    reporting_year: string;
}

export interface ProductionUnit {
    id: number;
    kvk_name: string;
    product_name: string; // Name of the Product
    quantity: string; // Qty
    reporting_year: string;
}

export interface InstructionalFarmLivestock {
    id: number;
    kvk_name: string;
    animal_name: string; // Name of the Animal/Bird/Aquatics
    species_breed: string; // Species / Breed / Variety
    type_of_produce: string; // Type of Produce
    reporting_year: string;
}

export interface HostelFacility {
    id: number;
    kvk_name: string;
    months: string; // Months
    trainees_stayed: string; // No. of Trainees Stayed
    trainee_days: string; // Trainee Days(Days Stayed)
    reporting_year: string;
}

export interface StaffQuarter {
    id: number;
    kvk_name: string;
    no_of_quarters: string; // No.of Staff Quarters
    date_of_completion: string; // Date of completion
    remark: string; // Remark
    reporting_year: string;
}

export interface RainWaterHarvesting {
    id: number;
    kvk_name: string;
    training_programmes: string; // No of training programme conducted
    demonstrations: string; // No. of demonstrations
    plant_material: string; // No. of plant material produced
    farmers_visit: string; // Visit by the farmers (No.)
    officials_visit: string; // Visit by the officials (No.)
    reporting_year: string;
}
