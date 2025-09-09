import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/db';
import { integrationInbound, partner } from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Extend Request interface to include partner info
declare global {
  namespace Express {
    interface Request {
      partner?: {
        id: string;
        code: string;
        name: string;
        picName: string;
        picEmail: string;
        description?: string;
        status: string;
        tenantId: string;
        createdAt: string;
        updatedAt: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using inbound API keys
 * Validates the API key and attaches partner info to the request
 */
export async function integrationApiKeyMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    // Extract API key from header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || typeof apiKey !== 'string') {
      res.status(401).json({ 
        success: false, 
        message: 'API key required in x-api-key header' 
      });
      return;
    }

    // Find the API key record in integration_inbound table
    const keyRecords = await db
      .select()
      .from(integrationInbound)
      .where(eq(integrationInbound.apiKey, apiKey))
      .limit(1);

    if (!keyRecords.length) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid API key' 
      });
      return;
    }

    const keyRecord = keyRecords[0];

    // Check if API key is active
    if (keyRecord.status !== 'active') {
      res.status(401).json({ 
        success: false, 
        message: 'API key is inactive' 
      });
      return;
    }

    // Get associated partner info
    const partnerRecords = await db
      .select()
      .from(partner)
      .where(eq(partner.id, keyRecord.partnerId))
      .limit(1);

    if (!partnerRecords.length) {
      res.status(401).json({ 
        success: false, 
        message: 'Partner not found or access denied' 
      });
      return;
    }

    const partnerRecord = partnerRecords[0];

    // Check if partner is active
    if (partnerRecord.status !== 'active') {
      res.status(401).json({ 
        success: false, 
        message: 'Partner account is inactive' 
      });
      return;
    }

    // Attach partner info to request for use in route handlers
    req.partner = {
      id: partnerRecord.id,
      code: partnerRecord.code,
      name: partnerRecord.name,
      picName: partnerRecord.picName,
      picEmail: partnerRecord.picEmail,
      description: partnerRecord.description || undefined,
      status: partnerRecord.status,
      tenantId: partnerRecord.tenantId,
      createdAt: partnerRecord.createdAt.toISOString(),
      updatedAt: partnerRecord.updatedAt.toISOString(),
    };

    next();
  } catch (error) {
    console.error('Error in integrationApiKeyMiddleware:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication' 
    });
  }
}