#!/bin/bash
# Initialize new instance of OpenSearch

# Bring in the functions from ./rpos-utils
. ./rpos-utils.sh

# Upload the public index template
os_create_index_template public.activity ../config/opensearch/default-index-template.json

