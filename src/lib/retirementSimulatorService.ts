import { api } from './api';
import type {
  RetirementSimulatorRequest,
  RetirementSimulatorResponse,
} from '../types/retirementSimulator';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const retirementSimulatorService = {
  simulate: async (
    request: RetirementSimulatorRequest
  ): Promise<RetirementSimulatorResponse> => {
    const response = await api.post<ApiResponse<RetirementSimulatorResponse>>(
      '/retirement-simulator',
      request
    );
    return response.data.data;
  },
};
