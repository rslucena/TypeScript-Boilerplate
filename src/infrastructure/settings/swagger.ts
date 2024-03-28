import { SwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export const SettingOptions: SwaggerOptions = {
  swagger: {
    info: {
      title: String(process.env.APP_NAME),
      description: String(process.env.APP_DESCRIPTION),
      version: String(process.env.APP_VERSION),
    },
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
  transform: jsonSchemaTransform,
}

export const SettingOptionsUI: FastifySwaggerUiOptions = {
  routePrefix: '/documentation',
  theme: {
    title: String(process.env.APP_NAME),
    js: [
      {
        filename: 'swaggertheme.js',
        content:
          '( new MutationObserver( () => document.querySelectorAll(".try-out__btn" ).forEach( ( el ) => el.remove() ) ).observe( document.body, { childList: true, subtree: true } ) );' +
          '( new MutationObserver( () => document.querySelector( "#swagger-ui > section > div.topbar" ).remove()).observe( document.body, { childList: true, subtree: true } ) );' +
          '( new MutationObserver( () => document.querySelector( "div.scheme-container" ).remove()).observe( document.body, { childList: true, subtree: true } ) );',
      },
    ],
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
