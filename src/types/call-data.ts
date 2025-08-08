export interface CallData {
    Caller_agent_ID: string;
    Call_ID: string;
    "Saloon Name": string;
    Status: string;
    "Need AI-Agent ? (Yes/No)": boolean;
    "Appointment Booked (Yes/No)": boolean;
    "Call summary": string;
    "Call Transcript": string;
    "Call Recording": string; // it's a URL
    "Phone Number": string;
}
