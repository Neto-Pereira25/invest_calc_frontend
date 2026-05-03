import { api } from '../lib/api';
import type { SimulationRequest, SimulationResponse } from '../types/compoundInterestSimulation';

export async function simulate(data: SimulationRequest): Promise<SimulationResponse> {
    const response = await api.post('/compound-interest-simulator', data);
    return response.data.data;
}