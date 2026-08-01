import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'BankOS Identity Service API',
      version: '1.0.0',
      description: 'API documentation for the BankOS Identity Service',
      contact: {
        name: 'BankOS Enterprise Architecture',
      },
    },
    servers: [
      {
        url: '/api/v1/auth',
        description: 'Authentication API',
      },
      {
        url: '/',
        description: 'Root API (Health & Metrics)',
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT (RS256)',
          description: 'Enter your JWT in the format: Bearer <token>',
        },
      },
      schemas: {
        RegisterUserRequest: {
          type: 'object',
          required: ['email', 'passwordRaw'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            passwordRaw: { type: 'string', format: 'password', example: 'StrongP@ssw0rd!' },
          },
        },
        RegisterUserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'passwordRaw'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            passwordRaw: { type: 'string', format: 'password', example: 'StrongP@ssw0rd!' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPasswordRaw'],
          properties: {
            token: { type: 'string' },
            newPasswordRaw: { type: 'string', format: 'password', example: 'NewStr0ngP@ssw0rd!' },
          },
        },
        SendVerificationEmailRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          },
        },
        VerifyEmailRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
        CanonicalSuccessResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object', description: 'Optional data payload' },
          },
        },
        CanonicalErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'string', example: 'BAD_REQUEST' },
                message: { type: 'string', example: 'Error details' },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid request payload' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication and Identity Operations' },
      { name: 'Health', description: 'Service Health and Readiness' },
    ],
    paths: {
      '/.well-known/jwks.json': {
        get: {
          tags: ['OpenID Connect / JWKS'],
          summary: 'JSON Web Key Set (JWKS)',
          description: 'Returns the active public keys used to verify JWTs issued by the Identity Service. Designed to be cached by API Gateways.',
          responses: {
            '200': {
              description: 'Successfully returned the JWKS',
              headers: {
                'Cache-Control': {
                  schema: { type: 'string' },
                  description: 'Cache control directives',
                },
                ETag: {
                  schema: { type: 'string' },
                  description: 'Entity tag for the JWKS content',
                },
              },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['keys'],
                    properties: {
                      keys: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['kid', 'kty', 'alg', 'use', 'n', 'e'],
                          properties: {
                            kid: { type: 'string', description: 'Key ID' },
                            kty: { type: 'string', description: 'Key Type (e.g., RSA)' },
                            alg: { type: 'string', description: 'Algorithm (e.g., RS256)' },
                            use: { type: 'string', description: 'Public Key Use (e.g., sig)' },
                            n: { type: 'string', description: 'RSA Modulus (Base64URL)' },
                            e: { type: 'string', description: 'RSA Public Exponent (Base64URL)' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          operationId: 'registerUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterUserRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'User successfully registered',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/CanonicalSuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/RegisterUserResponse' }
                        }
                      }
                    ]
                  },
                },
              },
            },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '409': { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          operationId: 'loginUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successfully logged in',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/CanonicalSuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/LoginResponse' }
                        }
                      }
                    ]
                  },
                },
              },
            },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '401': { description: 'Invalid Credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '403': { description: 'User Locked', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '429': { description: 'Too Many Requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          operationId: 'refreshToken',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tokens successfully refreshed',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/CanonicalSuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/RefreshTokenResponse' }
                        }
                      }
                    ]
                  },
                },
              },
            },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '401': { description: 'Invalid or Expired Refresh Token', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '404': { description: 'Session Not Found', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout user',
          operationId: 'logoutUser',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogoutRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Successfully logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalSuccessResponse' } } } },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request password reset',
          operationId: 'forgotPassword',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Reset link dispatched', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalSuccessResponse' } } } },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '429': { description: 'Too Many Requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password',
          operationId: 'resetPassword',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Password reset successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalSuccessResponse' } } } },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '401': { description: 'Invalid or Expired Token', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/send-verification': {
        post: {
          tags: ['Auth'],
          summary: 'Send email verification link',
          operationId: 'sendVerificationEmail',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SendVerificationEmailRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Verification email sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalSuccessResponse' } } } },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '429': { description: 'Too Many Requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/verify-email': {
        post: {
          tags: ['Auth'],
          summary: 'Verify user email',
          operationId: 'verifyEmail',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifyEmailRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Email successfully verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalSuccessResponse' } } } },
            '400': { description: 'Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '404': { description: 'User or Token Not Found', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
            '500': { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/CanonicalErrorResponse' } } } },
          },
        },
      },
      '/health/live': {
        get: {
          tags: ['Health'],
          summary: 'Liveness Probe',
          operationId: 'livenessProbe',
          responses: {
            '200': {
              description: 'Service is alive',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      uptime: { type: 'number' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/health/ready': {
        get: {
          tags: ['Health'],
          summary: 'Readiness Probe',
          operationId: 'readinessProbe',
          responses: {
            '200': {
              description: 'Service is ready',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      checks: { type: 'object' }
                    }
                  }
                }
              }
            },
            '503': {
              description: 'Service Unavailable'
            }
          }
        }
      },
      '/metrics': {
        get: {
          tags: ['Health'],
          summary: 'Prometheus Metrics',
          operationId: 'getMetrics',
          responses: {
            '200': {
              description: 'Prometheus formatted metrics',
              content: {
                'text/plain': {
                  schema: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
  },
  apis: [], // Defined inline above
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
