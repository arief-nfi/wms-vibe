import axios from 'axios';
import { 
  Partner, 
  PartnerFormData, 
  PartnerListResponse, 
  PartnerResponse, 
  PartnerQueryParams 
} from '@client/schemas/partnerSchema';

const BASE_URL = '/api/master/partner';

export const partnerApi = {
  // Get all partners with pagination and filtering
  getPartners: async (params: PartnerQueryParams = {}): Promise<PartnerListResponse> => {
    const response = await axios.get<PartnerListResponse>(BASE_URL, { params });
    return response.data;
  },

  // Get partner by ID
  getPartner: async (id: string): Promise<PartnerResponse> => {
    const response = await axios.get<PartnerResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new partner
  createPartner: async (data: PartnerFormData): Promise<PartnerResponse> => {
    const response = await axios.post<PartnerResponse>(BASE_URL, data);
    return response.data;
  },

  // Update partner
  updatePartner: async (id: string, data: PartnerFormData): Promise<PartnerResponse> => {
    const response = await axios.put<PartnerResponse>(`${BASE_URL}/${id}`, { ...data, id });
    return response.data;
  },

  // Delete partner
  deletePartner: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};