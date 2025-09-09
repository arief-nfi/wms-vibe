import { Router } from 'express';
import partnerRoutes from './partner';
import integrationInboundRoutes from './integrationInbound';

const masterRoutes = Router();

// Register master routes
masterRoutes.use('/partner', partnerRoutes);
masterRoutes.use('/integration-inbound', integrationInboundRoutes);

export default masterRoutes;