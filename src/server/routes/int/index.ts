import { Router } from 'express';
import intPartnerRoutes from './partner';

/**
 * Integration API Routes
 * 
 * These routes are used by external partners to access their information
 * using API key authentication. All routes under /int require a valid
 * x-api-key header for authentication.
 */
const intRoutes = Router();

// Partner information endpoint
intRoutes.use('/partner', intPartnerRoutes);

export default intRoutes;