import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MockAI-Interview Premium API Documentation',
      version: '1.0.0',
      description: 'API specifications for MockAI-Interview - Premium Job Support Platform integrated with AI.',
      contact: {
        name: 'NhaPhuong',
        email: 'support@mockai-interview.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập mã JWT token của bạn (không cần gõ chữ Bearer ở trước).',
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './backend/src/routes/*.js',
    './routes/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📝 Swagger UI is enabled on http://localhost:5000/api-docs');
};
