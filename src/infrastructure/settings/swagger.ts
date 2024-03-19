import { SwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export const SettingOptions: SwaggerOptions = {
  openapi: {
    info: {
      title: String(process.env.APP_NAME),
      description: String(process.env.APP_DESCRIPTION),
      version: String(process.env.APP_VERSION),
    },
  },
  transform: jsonSchemaTransform,
}

export const SettingOptionsUI: FastifySwaggerUiOptions = {
  routePrefix: '/documentation',
  theme: {
    title: String(process.env.APP_TITLE),
  },
  uiConfig: {
    docExpansion: 'list',
    displayRequestDuration: true,
    persistAuthorization: true,
    deepLinking: false,
    showExtensions: false,
  },
  staticCSP: false,
  transformSpecificationClone: false,
}
