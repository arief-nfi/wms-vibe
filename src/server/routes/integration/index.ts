import { Router } from 'express';
import webhookRoutes from './outbound/webhook';

/**
 * Integration Routes
 * 
 * This module organizes all integration-related routes including:
 * - Outbound: Webhook management for sending events to partners
 * - Future: Additional integration endpoints can be added here
 */
const integrationRoutes = Router();

// Webhook management endpoints (outbound integration)
integrationRoutes.use('/outbound/webhook', webhookRoutes);

export default integrationRoutes;