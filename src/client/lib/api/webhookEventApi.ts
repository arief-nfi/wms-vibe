import axios from 'axios';
import { 
  WebhookEvent, 
  WebhookEventFormData, 
  WebhookEventListResponse, 
  WebhookEventResponse,
  WebhookEventDeleteResponse
} from '@client/schemas/webhookEventSchema';

const BASE_URL = '/api/webhook-events';

export const webhookEventApi = {
  /**
   * Get paginated list of webhook events
   */
  getEvents: async (params?: {
    page?: number;
    perPage?: number;
    isActive?: boolean;
    name?: string;
  }): Promise<WebhookEventListResponse> => {
    const response = await axios.get<WebhookEventListResponse>(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get webhook event by ID
   */
  getEvent: async (id: string): Promise<WebhookEventResponse> => {
    const response = await axios.get<WebhookEventResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new webhook event
   */
  createEvent: async (data: WebhookEventFormData): Promise<WebhookEventResponse> => {
    const response = await axios.post<WebhookEventResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update existing webhook event
   */
  updateEvent: async (id: string, data: WebhookEventFormData): Promise<WebhookEventResponse> => {
    const response = await axios.put<WebhookEventResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete webhook event
   */
  deleteEvent: async (id: string): Promise<WebhookEventDeleteResponse> => {
    const response = await axios.delete<WebhookEventDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get all active event names (for dropdown usage)
   */
  getActiveEventNames: async (): Promise<string[]> => {
    const response = await webhookEventApi.getEvents({ isActive: true, perPage: 100 });
    return response.data.map(event => event.name);
  },
};