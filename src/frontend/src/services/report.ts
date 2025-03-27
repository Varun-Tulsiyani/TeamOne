import api from "./api";

export interface IReport {
    created_at: string;
    user_id: number;
    scan_url: string;
    attack_type: string;
    cnn_model: string;
    target_class: number;
    execution_time: string;
    iterations: number;
    mitigations: string;
}

export const getReport = async (): Promise<IReport> => {
    try {
        const response = await api.get(`/report`);
        const report: IReport = response.data;
        if (!report) throw new Error("No reports found");
        return report;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || error.message);
    }
};

export const getAllReports = async (): Promise<IReport[]> => {
    try {
        const response = await api.get(`/report/all`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || error.message);
    }
};

export const emailReport = async (email: string) => {
    try {
        const response = await api.post(`/email`, { email });
        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
