import { api } from '../lib/api';
import type {
    CompareScenariosRequest,
    ScenarioComparisonResult,
} from '../types/scenarioComparison';

export async function compareScenarios(
    data: CompareScenariosRequest
): Promise<ScenarioComparisonResult[]> {
    const response = await api.post('/simulations/compare', data);
    return response.data.data;
}
