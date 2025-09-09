import axios, { AxiosResponse } from 'axios';
import { 
  Webhook, 
  WebhookListResponse, 
  WebhookResponse, 
  WebhookFormData, 
  WebhookEditFormData,
  WebhookQueryParams 
} from '../../schemas/webhookSchema';

const WEBHOOK_BASE_URL = '/api/integration/outbound/webhook';

export const webhookApi = {
  // Get all webhooks with pagination and filtering
  getAll: async (params?: WebhookQueryParams): Promise<WebhookListResponse> => {
    const response: AxiosResponse<WebhookListResponse> = await axios.get(WEBHOOK_BASE_URL, {
      params,
    });
    return response.data;
  },

  // Get webhook by ID
  getById: async (id: string): Promise<WebhookResponse> => {
    const response: AxiosResponse<WebhookResponse> = await axios.get(`${WEBHOOK_BASE_URL}/${id}`);
    return response.data;
  },

  // Create new webhook
  create: async (data: WebhookFormData): Promise<WebhookResponse> => {
    const response: AxiosResponse<WebhookResponse> = await axios.post(WEBHOOK_BASE_URL, data);
    return response.data;
  },

  // Update webhook
  update: async (id: string, data: WebhookEditFormData): Promise<WebhookResponse> => {
    const response: AxiosResponse<WebhookResponse> = await axios.put(`${WEBHOOK_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete webhook
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response: AxiosResponse<{ success: boolean; message: string }> = await axios.delete(`${WEBHOOK_BASE_URL}/${id}`);
    return response.data;
  },
};