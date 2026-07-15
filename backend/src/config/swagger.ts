import path from 'node:path';
import { fileURLToPath } from 'node:url';

import swaggerJsdoc from 'swagger-jsdoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ticketStatusEnum = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];
const ticketPriorityEnum = ['Low', 'Medium', 'High', 'Critical'];
const sortEnum = ['newest', 'oldest', 'priority'];

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Support Ticket Management API',
      version: '1.0.0',
      description:
        'REST API for internal support ticket management with comments, search, and status workflow.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development',
      },
    ],
    tags: [
      { name: 'Health', description: 'Service health' },
      { name: 'Users', description: 'Seeded user directory' },
      { name: 'Tickets', description: 'Ticket CRUD, search, and status workflow' },
      { name: 'Comments', description: 'Ticket comments' },
    ],
    components: {
      schemas: {
        ApiErrorDetail: {
          type: 'object',
          required: ['field', 'message'],
          properties: {
            field: { type: 'string', example: 'title' },
            message: { type: 'string', example: 'Title is required' },
          },
        },
        ApiError: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: {
              type: 'string',
              example: 'VALIDATION_ERROR',
              enum: [
                'VALIDATION_ERROR',
                'INVALID_STATUS_TRANSITION',
                'INVALID_OBJECT_ID',
                'USER_NOT_FOUND',
                'TICKET_NOT_FOUND',
                'NOT_FOUND',
                'INTERNAL_ERROR',
              ],
            },
            message: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: { $ref: '#/components/schemas/ApiErrorDetail' },
            },
          },
        },
        ApiErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', enum: [false] },
            error: { $ref: '#/components/schemas/ApiError' },
          },
        },
        HealthResponse: {
          type: 'object',
          required: ['status', 'timestamp', 'uptime'],
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'integer', example: 120 },
          },
        },
        User: {
          type: 'object',
          required: ['_id', 'name', 'email', 'role'],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Alice Johnson' },
            email: { type: 'string', format: 'email', example: 'alice@company.com' },
            role: { type: 'string', enum: ['employee', 'admin'] },
          },
        },
        Ticket: {
          type: 'object',
          required: [
            '_id',
            'title',
            'description',
            'priority',
            'status',
            'assignedTo',
            'createdBy',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'VPN connection issue' },
            description: {
              type: 'string',
              example: 'Unable to connect to corporate VPN from home office.',
            },
            priority: { type: 'string', enum: ticketPriorityEnum },
            status: { type: 'string', enum: ticketStatusEnum },
            assignedTo: {
              type: 'string',
              nullable: true,
              example: '507f1f77bcf86cd799439012',
            },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          required: ['_id', 'ticketId', 'message', 'createdBy', 'createdAt'],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            ticketId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            message: { type: 'string', example: 'Checked the printer queue.' },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          required: ['page', 'limit', 'total', 'totalPages'],
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        PaginatedTickets: {
          type: 'object',
          required: ['items', 'pagination'],
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Ticket' },
            },
            pagination: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
        TicketDetail: {
          type: 'object',
          required: ['ticket', 'comments', 'allowedTransitions'],
          properties: {
            ticket: { $ref: '#/components/schemas/Ticket' },
            comments: {
              type: 'array',
              items: { $ref: '#/components/schemas/Comment' },
            },
            allowedTransitions: {
              type: 'array',
              items: { type: 'string', enum: ticketStatusEnum },
              example: ['In Progress', 'Cancelled'],
            },
          },
        },
        CreateTicketRequest: {
          type: 'object',
          required: ['title', 'description', 'priority', 'createdBy'],
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 200 },
            description: { type: 'string', minLength: 10, maxLength: 5000 },
            priority: { type: 'string', enum: ticketPriorityEnum },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            assignedTo: {
              type: 'string',
              nullable: true,
              example: '507f1f77bcf86cd799439012',
            },
          },
        },
        UpdateTicketRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 200 },
            description: { type: 'string', minLength: 10, maxLength: 5000 },
            priority: { type: 'string', enum: ticketPriorityEnum },
            status: { type: 'string', enum: ticketStatusEnum },
            assignedTo: { type: 'string', nullable: true },
          },
        },
        PatchTicketStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ticketStatusEnum },
          },
        },
        CreateCommentRequest: {
          type: 'object',
          required: ['message', 'createdBy'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 2000 },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      },
      parameters: {
        TicketId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
          description: 'Ticket ObjectId',
        },
        Page: {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        Limit: {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        StatusFilter: {
          name: 'status',
          in: 'query',
          schema: {
            type: 'array',
            items: { type: 'string', enum: ticketStatusEnum },
          },
          style: 'form',
          explode: true,
        },
        PriorityFilter: {
          name: 'priority',
          in: 'query',
          schema: {
            type: 'array',
            items: { type: 'string', enum: ticketPriorityEnum },
          },
          style: 'form',
          explode: true,
        },
        AssignedToFilter: {
          name: 'assignedTo',
          in: 'query',
          schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
        },
        Sort: {
          name: 'sort',
          in: 'query',
          schema: { type: 'string', enum: sortEnum, default: 'newest' },
        },
        SearchQuery: {
          name: 'q',
          in: 'query',
          schema: { type: 'string', maxLength: 256 },
          description: 'Keyword search across ticket title, description, and comments',
        },
      },
      responses: {
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../docs/openapi.paths.ts')],
});

export const documentedPathCount = Object.keys(
  (swaggerSpec as { paths?: Record<string, unknown> }).paths ?? {},
).length;

export const documentedOperationCount = Object.values(
  (swaggerSpec as { paths?: Record<string, Record<string, unknown>> }).paths ?? {},
).reduce((count, pathItem) => count + Object.keys(pathItem).length, 0);
