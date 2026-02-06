export interface HRDTraining {
    id: number;
    kvk_id: number;
    kvk_name: string;
    reporting_year: string;
    staff: string;      // Name of the staff member attending
    course: string;     // Title of the course/program
    start_date: string; // ISO date string (YYYY-MM-DD)
    end_date: string;   // ISO date string (YYYY-MM-DD)
    organizer: string;  // Who organized the training
    created_at?: string;
    updated_at?: string;
}
