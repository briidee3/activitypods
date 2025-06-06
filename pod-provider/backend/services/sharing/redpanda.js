const { OBJECT_TYPES } = require('@semapps/activitypub');
const { Kafka } = require('kafkajs');
const CONFIG = require('../../config/config');

// RedPanda configuration
const rpClientId = CONFIG.RP_CLIENT_ID;
const rpBrokers = CONFIG.RP_BROKERS;
const rpTopics = {
  // Uploading posts to OpenSearch database
  "upstream": CONFIG.RP_TOPIC_PUBLIC_EMIT,
  // Downloading posts (e.g. replies) to OpenSearch database
  "downstream": "",
  // Getting posts from other instances
  "instream": "",
  // Retrieving public posts from OpenSearch for sending to other instances
  "outstream": "",
  // Translation between specifications/protocols
  "translate": "",
}

// OpenSearch configuration
//const opensearchAddress = CONFIG.OS_HTTP_API_BASE_URL;
//const indexName = CONFIG.OS_PUBLIC_INDEX;

module.exports = {
  name: 'rpos',
  settings: {
    type: OBJECT_TYPES.NOTE
  },
  started() {
    // Set up producer for sending to RedPanda
    this.rp = new Kafka({
      clientId: rpClientId,
      brokers: rpBrokers
    });
    this.rpProducer = this.rp.producer();
  },
  methods: {
    // Automatically create post in OpenSearch on activity emission
    async uploadActivity(ctx, resource, emitterUri) {
      try {
        //const date = new Date();
        const activityUri = encodeURIComponent(resource.id || resource['@id']);

        console.log(resource);

        // Format the post for uploading
        const date = new Date();
        const post = {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          id: activityUri,
          actor: encodeURIComponent(emitterUri),
          tag: resource.tag,
          published: date.toISOString(),
          updateTime: Date.now()
        };
          /*
          "inReplyTo": "actorUri of other actor",
          "replies": {
            "type": "Collection",
            "totalItems": 1,
            "items": [
              {
                "type": "Note",
                "content": "Example text",
                "inReplyTo": "actorUri example"
              }
            ]
          },
          "contentMap": {
            "en": "English text",
            "es": "Espanol texto"
          },
          "mediaType": "text/markdown",
          "name": "A note",
        };*/


        // Initialize connection with RedPanda
        this.rpProducer.connect();

        // Send to RedPanda, get response.
        // Note: The stringification below, as well as the formatting of the below, is derived from examples from the redpanda-labs repo of redpanda-data on GitHub.
        const response = await this.rpProducer.send({
            topic: rpTopics["upstream"],
            data: [{
              value: JSON.stringify({
                post,
                action: "index"
              })
            }]
        });

        await this.rpProducer.disconnect();

        return response;
      }
      catch (error) {
        console.error("Error creating database reference to post in `public-posts.service`:\n\t", error);
        return error;
      }
    },
  }
}
