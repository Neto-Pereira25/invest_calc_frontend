import { api } from './api';
import type {
    ReverseSimulationRequest,
    ReverseSimulationResponse,
} from '../types/reverseSimulation';

interface ApiResponse<T> {
    data: T;
    message: string;
}

export const reverseSimulationService = {
    simulate: async (
        request: ReverseSimulationRequest
    ): Promise<ReverseSimulationResponse> => {
        const response = await api.post<ApiResponse<ReverseSimulationResponse>>(
            '/reverse-simulation',
            request
        );
        return response.data.data;
    },
};
