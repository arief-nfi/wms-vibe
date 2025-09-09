import axios from 'axios';
import { 
  IntegrationInbound, 
  IntegrationInboundFormData, 
  IntegrationInboundListResponse, 
  IntegrationInboundResponse, 
  IntegrationInboundQueryParams 
} from '@client/schemas/integrationInboundSchema';

const BASE_URL = '/api/master/integration-inbound';

export const integrationInboundApi = {
  // Get all integration inbound API keys with pagination and filtering
  getIntegrationInbounds: async (params: IntegrationInboundQueryParams = {}): Promise<IntegrationInboundListResponse> => {
    const response = await axios.get<IntegrationInboundListResponse>(BASE_URL, { params });
    return response.data;
  },

  // Get integration inbound API key by ID
  getIntegrationInbound: async (id: string): Promise<IntegrationInboundResponse> => {
    const response = await axios.get<IntegrationInboundResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new integration inbound API key
  createIntegrationInbound: async (data: IntegrationInboundFormData): Promise<IntegrationInboundResponse> => {
    const response = await axios.post<IntegrationInboundResponse>(BASE_URL, data);
    return response.data;
  },

  // Update integration inbound API key
  updateIntegrationInbound: async (id: string, data: IntegrationInboundFormData): Promise<IntegrationInboundResponse> => {
    const response = await axios.put<IntegrationInboundResponse>(`${BASE_URL}/${id}`, { ...data, id });
    return response.data;
  },

  // Delete integration inbound API key
  deleteIntegrationInbound: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};