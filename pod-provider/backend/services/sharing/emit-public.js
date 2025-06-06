const path = require('path');
const urlJoin = require('url-join');
const { ActivitiesHandlerMixin, ACTIVITY_TYPES, OBJECT_TYPES, matchActivity } = require('@semapps/activitypub');
const { arrayOf } = require('@semapps/ldp');
const { MIME_TYPES } = require('@semapps/mime-types');
const CONFIG = require('../../config/config');

module.exports = {
  name: 'emit-public',
  mixins: [ActivitiesHandlerMixin],
  settings: {
    
  },
  priority: 10,
  actions: {
  },
  activities: {
    note: {
      match: {
        type: ACTIVITY_TYPES.NOTE
      }
    },
    async onEmit(ctx, activity, emitterUri) {
      // Send activity to RedPanda if the activity is public
      if (activity.to && arrayOf(activity.to).includes("https://www.w3.org/ns/activitystreams#Public" || "Public")) {
        const resourceUri = typeof activity.object === 'string' ? activity.object : activity.object.id;

        const resource = await ctx.call('ldp.resource.get', {
          resourceUri,
          accept: MIME_TYPES.JSON,
          webId: emitterUri
        });

        if (emitterUri !== resource['dc:creator']) {
          throw new Error('Only the creator has the right to share the object ' + resourceUri);
        }
        
        try {
          await ctx.call('rpos.uploadActivity', {
            ctx: ctx, resource: resource, emitterUri: emitterUri
          });
        } catch (e) {
          this.logger.warn(
            `Unable to upload activity to OpenSearch via RedPanda. Message: ${e.message}`
          );
        }
      }
    }
  }
}
