
# Redpanda/Opensearch

## How to use:

### Initialization:
- If running separately from the rest of Memory, simply `cd` into this directory and run `docker compose up -d`.

### Redpanda
- Redpanda Console should be available at `http://localhost:8080/`, by which you should be able to monitor some of the basic aspects of Redpanda

### Opensearch
- The Opensearch dashboard should be accessible at `http://localhost:5601/`. To see posts catalogued thus far, go to the menu in the top left and select "Discover" from the menu that comes up on the left.
#### Testing:
- You can use `cURL` requests to test both Redpanda and Opensearch functionalities. Further details have been presently omitted, and may be found in their respective documentation.


## Notes:

### Redpanda general
- STATUS:
    - Need to fix HTTP API and subsequently finish integration of Redpanda Connect [Streams](https://docs.redpanda.com/redpanda-connect/guides/streams_mode/about/) mode.
- Some info pertaining to [general setup of a self-managed Redpanda Connect setup](https://docs.redpanda.com/current/get-started/quick-start/) as used here
- Using [Redpanda Streams API](https://docs.redpanda.com/redpanda-connect/guides/streams_mode/streams_api/) for handling multiple pipelines at once
    - E.g. for handling upstream (upload to database on post) and downstream (download from database for timeline) at same time

### `docker-compose.yml`
- RPK: 
    - [Redpanda RPK commands reference](https://docs.redpanda.com/current/reference/rpk/)
    - There are several additions to the `command` section which are intended to help with the initial setup of the public timeline ("activities") index

### Miscellaneous:
- `./config/mastodon-compat/` is currently unused, and contains some (untested) outlines for Mastodon related schemas. The future intent for these are to be used in the production of a Redpanda Connect pipeline for streaming of data between Memory instances and Mastodon instances while concurrently converting the data between the different formats (e.g. converting Memory formatted posts to Mastodon formatted posts, and vice versa).
- `./docker-compose-default.yml` is the default docker compose file for setting up a Redpanda Connect pipeline, and is only kept temporarily for troubleshooting purposes.

### Troubleshooting:
- If you're ever having trouble with running the docker containers, then try the following:
    - Prior to restarting, ensure all docker containers are down and removed with `docker compose down`.
    - If that doesn't help, then ensure none of the docker containers are still around with `docker compose ps` and `docker ps`. If the latter shows a container, first stop it with `docker stop <container_name>`, then remove it with `docker rm <container_name>`.
    - If all else fails, then run the containers with `docker compose up` instead of `docker compose up -d`, and check the logs for errors.


## TODO:
- [ ] Get Redpanda Connect Streams working properly
    - [ ] Fix HTTP API
- [ ] Verification of adherence to the schema in the Redpanda pipeline, and respond accordingly to the client if otherwise
- [ ] OAuth 2 integration
- [ ] Proper SASL setup
- [ ] Integrate SSL wherever possible (e.g. [HTTPS](https://docs.redpanda.com/redpanda-connect/components/http/about/) w/ Redpanda)
- [ ] Set up proper [Redpanda Console security](https://docs.redpanda.com/current/console/config/security/)
- [ ] Implement [proper security](https://docs.redpanda.com/current/manage/security/) checks for things
    - Example: Management of Redpanda Streams API
        - Unless there's already a better/intended method of locking this down, we may want to set things up so that only authenticated requests (possibly only from local server as well) may [update the streams endpoints](https://docs.redpanda.com/redpanda-connect/guides/streams_mode/using_rest_api/) (or just locking them down altogether when in production and using [configs](https://docs.redpanda.com/redpanda-connect/guides/streams_mode/using_config_files/) instead)
    - Example: Have things opened on a whitelist, so as to prevent potential attackers from leveraging oversights such as overlooked open endpoints 
- [ ] Set up `sqlite` buffer in stream configs
- [ ] Set up and test [monitoring](https://docs.redpanda.com/redpanda-connect/guides/monitoring/) tools
- [ ] Set up [Redpanda tune](https://docs.redpanda.com/current/reference/rpk/rpk-redpanda/rpk-redpanda-tune/) for tuning/optimizing for user's system

