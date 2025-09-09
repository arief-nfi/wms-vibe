import { Router } from 'express';
import { integrationApiKeyMiddleware } from '../../middleware/integrationApiKeyMiddleware';

const intPartnerRoutes = Router();

/**
 * @swagger
 * /int/partner:
 *   get:
 *     tags:
 *       - Integration
 *     summary: Get partner info by inbound API key
 *     description: Returns partner information for the authenticated API key. This endpoint is used by external partners to retrieve their own information using their assigned API key.
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Inbound API key assigned to the partner
 *         example: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yzA567bcd890eFg123HiJ456"
 *     responses:
 *       200:
 *         description: Partner information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *             example:
 *               success: true
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 code: "PARTNER001"
 *                 name: "Example Partner Corp"
 *                 picName: "John Smith"
 *                 picEmail: "john.smith@example.com"
 *                 description: "Leading provider of logistics services"
 *                 status: "active"
 *                 tenantId: "550e8400-e29b-41d4-a716-446655440001"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *             examples:
 *               missing_key:
 *                 summary: Missing API key
 *                 value:
 *                   success: false
 *                   message: "API key required in x-api-key header"
 *               invalid_key:
 *                 summary: Invalid API key
 *                 value:
 *                   success: false
 *                   message: "Invalid API key"
 *               inactive_key:
 *                 summary: Inactive API key
 *                 value:
 *                   success: false
 *                   message: "API key is inactive"
 *               inactive_partner:
 *                 summary: Inactive partner
 *                 value:
 *                   success: false
 *                   message: "Partner account is inactive"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error during authentication"
 *     security:
 *       - ApiKeyAuth: []
 */
intPartnerRoutes.get('/', integrationApiKeyMiddleware, async (req, res) => {
  try {
    // Partner info is already attached to req.partner by the middleware
    // Return the partner information
    res.json({ 
      success: true, 
      data: req.partner 
    });
  } catch (error) {
    console.error('Error in /int/partner route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default intPartnerRoutes;