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
          'GET /:max_id:since_id': 'opensearch.getRecentBetween'
        }
      },
      {
        name: 'tags',
        path: '/tags',
        aliases: {
          'GET /': 'opensearch.getTags',
          'GET /:id': 'opensearch.getTag'
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
  actions: {
    getRecent(ctx) {
      // Get the id of the most recent post in OpenSearch
      this.client.

      this.getRecentBetween(Date.now(),  - CONFIG.STREAM_REFRESH_LIMIT);
    },
    getRecentBetween(ctx, max_id, since_id) {
      // Get public posts from OpenSearch. More info: https://docs.opensearch.org/docs/latest/api-reference/search-apis/search/

    },
    getTags(ctx) {
      // Get N tags with the most posts in OpenSearch
    },
    getTag(ctx, id) {
      // Get recent posts from a given tag
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
