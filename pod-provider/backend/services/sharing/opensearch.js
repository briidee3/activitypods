const ApiGatewayService = require('moleculer-web');
const { Errors: E } = require('moleculer-web');
const WebSocketMixin = require('../mixins/websocket');
const { Client } = require('@opensearch-project/opensearch');
const CONFIG = require('../../config/config');

// OpenSearch configuration. More info: https://docs.opensearch.org/docs/latest/clients/javascript/index/
const opensearchAddress = CONFIG.OS_HTTP_API_BASE_URL;
const indexName = CONFIG.OS_PUBLIC_INDEX;

module.exports = {
  mixins: [ApiGatewayService, WebSocketMixin],
  settings: {
    httpServerTimeout: 300000,
    baseUrl: CONFIG.BASE_URL,
    port: CONFIG.PORT,
    cors: {
      origin: '*',
      methods: ['GET'],
      exposedHeaders: '*'
    },
    routes: [
      {
        name: 'outstream',
        path: '/public',
        aliases: {
          'GET /': 'opensearch.getRecent',
          'GET /:search_after': 'opensearch.getRecentBetween'
        }
      },
      {
        name: 'tags',
        path: '/tags',
        aliases: {
          'GET /': 'opensearch.getTags',
          'GET /:search_after': 'opensearch.getTags',
          'GET /:id': 'opensearch.getTag',
          'GET /:id:search_after': 'opensearch.getTag'
        }
      }
    ]
  },
  started() {
    // Set up client for getting from OpenSearch
    this.client = new Client({
      node: opensearchAddress,
      
      // for use with the security plugin
      /*
        // Disabled for initial testing
        ssl: {
        ca: fs.readFileSync(ca_certs_path),
      },*/
    });
  },
  // TODO: Add functionality for getting from other OpenSearch instances 
  // TODO: Add functionality for getting from other protocols via a RedPanda translation pipeline (rather than fetching from OpenSearch)
  actions: {
    getRecent(ctx, search_after = null) {
      if (search_after) {

      } else {

      }
    },
    getTags(ctx, search_after = null) {
      // Get N tags with the most posts in OpenSearch
      if (search_after) {
        
      } else {

      }
    },
    getTag(ctx, id, search_after = null) {
      // Get recent posts from a given tag
      if (search_after) {

      } else {

      }
    }
  },
  methods: {
    async authenticate(ctx, route, req, res) {
      if (req.headers.signature) {
        return ctx.call('signature.authenticate', { route, req, res });
      }
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = await ctx.call('auth.jwt.decodeToken', { token });
        if (payload?.azp) {
          // This is a OIDC provider-generated ID token
          return ctx.call('solid-oidc.authenticate', { route, req, res });
        }
        // Otherwise it is a custom JWT token (used by ActivityPods frontend) or a capability URL
        return ctx.call('auth.authenticate', { route, req, res });
      }

      ctx.meta.webId = 'anon';
      return null;
    },
    async authorize(ctx, route, req, res) {
      if (req.headers.signature) {
        return ctx.call('signature.authorize', { route, req, res });
      }
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = await ctx.call('auth.jwt.decodeToken', { token });
        if (payload.azp) {
          // This is a OIDC provider-generated ID token
          return ctx.call('solid-oidc.authorize', { route, req, res });
        }
        // Otherwise it is a custom JWT token (used by ActivityPods frontend)
        return ctx.call('auth.authorize', { route, req, res });
      }
      ctx.meta.webId = 'anon';
      throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
    },
    // Overwrite optimization method to put catchAll routes at the end
    // See https://github.com/moleculerjs/moleculer-web/issues/335
    optimizeRouteOrder() {
      this.routes.sort(a => (a.opts.catchAll ? 1 : -1));
      this.aliases.sort(a => (a.route.opts.catchAll ? 1 : -1));
    }
  }
};
