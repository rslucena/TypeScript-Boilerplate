import { FastifyHelmetOptions } from '@fastify/helmet'

export default <FastifyHelmetOptions>{
  xPoweredBy: false,
  xXssProtection: true,
  xDownloadOptions: true,
  originAgentCluster: false,
  xFrameOptions: { action: 'deny' },
  xDnsPrefetchControl: { allow: true },
  crossOriginEmbedderPolicy: { policy: 'credentialless' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: {
    policy: 'no-referrer',
  },
  xPermittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
}
