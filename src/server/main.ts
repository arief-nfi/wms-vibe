import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import ViteExpress from "vite-express";
import permissionRoutes from "./routes/system/permission";
import authRoutes from "./routes/auth/auth";
import roleRoutes from "./routes/system/role";
import tenantRoutes from "./routes/system/tenant";
import optionRoutes from "./routes/system/option";
import userRoutes from "./routes/system/user";
import departmentRoutes from "./routes/demo/department";
import masterRoutes from "./routes/master";
import intRoutes from "./routes/int";
import integrationRoutes from "./routes/integration";
import webhookEventRoutes from "./routes/webhook/event";
import { rateLimit } from "express-rate-limit";
import fileUpload from "express-fileupload";

const app = express();

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});
//app.use(limiter);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-api-key'],
  credentials: false
}));

// misc middleware
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // Specify OpenAPI version
    info: {
      title: "React Admin API",
      version: "1.0.0",
      description: "API documentation for react admin application",
    },
    servers: [
      {
        url: process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
          : "http://localhost:5000",
        description: process.env.REPLIT_DEV_DOMAIN 
          ? "Replit Development Server" 
          : "Local Development Server",
      },
    ],
    components: {
      schemas: {
        Partner: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the partner",
            },
            code: {
              type: "string",
              description: "Partner code (unique within tenant)",
              example: "PARTNER001",
            },
            name: {
              type: "string",
              description: "Partner company name",
              example: "Example Partner Corp",
            },
            picName: {
              type: "string",
              description: "Person in charge name",
              example: "John Smith",
            },
            picEmail: {
              type: "string",
              format: "email",
              description: "Person in charge email",
              example: "john.smith@example.com",
            },
            description: {
              type: "string",
              description: "Partner description",
              example: "Leading provider of logistics services",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              description: "Partner status",
            },
            tenantId: {
              type: "string",
              format: "uuid",
              description: "Tenant identifier",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        Webhook: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the webhook"
            },
            partnerId: {
              type: "string",
              format: "uuid",
              description: "Partner identifier"
            },
            tenantId: {
              type: "string",
              format: "uuid",
              description: "Tenant identifier"
            },
            eventType: {
              type: "string",
              maxLength: 100,
              description: "Type of event to trigger webhook",
              example: "user.created"
            },
            url: {
              type: "string",
              format: "uri",
              maxLength: 1000,
              description: "Webhook endpoint URL",
              example: "https://partner.example.com/webhooks/events"
            },
            isActive: {
              type: "boolean",
              description: "Whether the webhook is active",
              default: true
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp"
            }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key for partner authentication",
        },
      },
    },
  },
  // Path to your route files where JSDoc comments are located
  apis: [
    "./src/server/routes/auth/*.ts",
    "./src/server/routes/system/*.ts",
    "./src/server/routes/demo/*.ts",
    "./src/server/routes/master/*.ts",
    "./src/server/routes/int/*.ts",
    "./src/server/routes/integration/**/*.ts",
    "./src/server/routes/webhook/*.ts",
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// auth routes
app.use("/api/auth", authRoutes);

// system routes
app.use("/api/system/permission", permissionRoutes);
app.use("/api/system/role", roleRoutes);
app.use("/api/system/tenant", tenantRoutes);
app.use("/api/system/option", optionRoutes);
app.use("/api/system/user", userRoutes);

// demo routes
app.use("/api/demo/department", departmentRoutes);

// master routes
app.use("/api/master", masterRoutes);

// integration routes (external API)
app.use("/int", intRoutes);

// integration management routes (internal API)
app.use("/api/integration", integrationRoutes);

// Webhook event routes
app.use("/api/webhook-events", webhookEventRoutes);

ViteExpress.listen(app, 5000, () =>
  console.log("Server is listening on port 5000..."),
);
