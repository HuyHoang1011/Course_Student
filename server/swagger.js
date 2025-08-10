const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Student Management API',
      version: '1.0.0',
      description: 'API documentation for Course Student Management System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['student', 'instructor', 'admin'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Course: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Course ID'
            },
            title: {
              type: 'string',
              description: 'Course title'
            },
            description: {
              type: 'string',
              description: 'Course description'
            },
            instructorId: {
              type: 'string',
              description: 'Instructor ID'
            },
            introductionContent: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['video', 'image', 'text']
                  },
                  url: {
                    type: 'string'
                  },
                  title: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  }
                }
              }
            },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  order: {
                    type: 'number'
                  },
                  lessons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string'
                        },
                        description: {
                          type: 'string'
                        },
                        type: {
                          type: 'string',
                          enum: ['video', 'pdf', 'slide', 'text']
                        },
                        url: {
                          type: 'string'
                        },
                        duration: {
                          type: 'number'
                        },
                        order: {
                          type: 'number'
                        }
                      }
                    }
                  }
                }
              }
            },
            imageIntroduction: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'draft']
            },
            adminNote: {
              type: 'string'
            },
            reviewedAt: {
              type: 'string',
              format: 'date-time'
            },
            reviewedBy: {
              type: 'string'
            }
          }
        },
        Quiz: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            courseId: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: {
                    type: 'string'
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  correctAnswer: {
                    type: 'number'
                  }
                }
              }
            },
            timeLimit: {
              type: 'number'
            },
            passingScore: {
              type: 'number'
            }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            studentId: {
              type: 'string'
            },
            courseId: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'completed']
            },
            enrolledAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Certificate: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            studentId: {
              type: 'string'
            },
            courseId: {
              type: 'string'
            },
            issuedAt: {
              type: 'string',
              format: 'date-time'
            },
            certificateNumber: {
              type: 'string'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['student', 'instructor', 'admin']
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 