import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Readerboard API',
        version: '1.0.0',
        description: 'API documentation for Readerboard - A competitive reading tracker',
        contact: {
          name: 'Readerboard Team',
          email: 'api@readerboard.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://readerboard.vercel.app',
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          SessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'next-auth.session-token',
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              email: { type: 'string', example: 'user@example.com' },
              name: { type: 'string', example: 'John Doe' },
              username: { type: 'string', example: 'johndoe' },
              avatar: { type: 'string', example: '/avatars/user.png' },
              pagesRead: { type: 'number', example: 1250 },
              booksCompleted: { type: 'number', example: 5 },
              joinDate: { type: 'string', format: 'date-time' },
              lastActive: { type: 'string', format: 'date-time' },
            },
          },
          Book: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
              title: { type: 'string', example: 'The Great Gatsby' },
              author: { type: 'string', example: 'F. Scott Fitzgerald' },
              totalPages: { type: 'number', example: 180 },
              fileUrl: { type: 'string', example: '/uploads/book.pdf' },
              fileType: { type: 'string', enum: ['pdf', 'epub'], example: 'pdf' },
              thumbnail: { type: 'string', example: '/thumbnails/book.jpg' },
              uploadedBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
              isPublic: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          Progress: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              userId: { type: 'string' },
              bookId: { type: 'string' },
              currentPage: { type: 'number', example: 45 },
              pagesRead: { type: 'number', example: 45 },
              visitedPages: { type: 'array', items: { type: 'number' }, example: [1, 2, 3, 45] },
              startDate: { type: 'string', format: 'date-time' },
              lastReadDate: { type: 'string', format: 'date-time' },
              completed: { type: 'boolean', example: false },
              readingTime: { type: 'number', example: 120 },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Error message' },
              code: { type: 'string', example: 'INVALID_REQUEST' },
            },
          },
        },
      },
      security: [{ SessionAuth: [] }],
    },
  });

  return spec;
};