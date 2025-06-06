#!/bin/bash

# Simple script for testing functionality of RedPanda pipeline + OpenSearch DBMS

# Set time to be used for variables involving it
TIME=$(timedatectl show | grep RTCTime | sed 's/\(.*\) \([0-9].*\) \([0-9][0-9]:[0-9][0-9]\)\(.*\)/\2_\3/')

# Redpanda
REDPANDA_BROKERS="localhost:19092"
REDPANDA_PUBLIC_TOPIC="activities"

# OpenSearch
OPENSEARCH_HTTP_API_BASE_URL="http://localhost:9200"
OPENSEARCH_PUBLIC_INDEX_NAME="public-posts"

# OpenSearch test post outline
OPENSEARCH_PUB_POST_OUTLINE='{
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Note",
    "id": "http%3A%2F%2Fexample.com%2FactivityUri",
    "actor": "http%3A%2F%2Fexample.com%2FactorUri",
    "content": "This is a %3Ca%20href%3D%22%2Ftags%2Ftest%22%20class%3D%22hashtag-link%22%3Etest%3C%2Fa%3E post",
    "tag": {
        "type": "Hashtag",
        "id": "%2Ftags%2Ftest"
    },
    "published": '"$time"',
    "updateTime": '"$time"'
}'

# RedPanda test post outline
REDPANDA_PUB_POST_OUTLINE='{
    "topic": '"$OPENSEARCH_PUBLIC_INDEX_NAME"',
    "data": [{
        '"$OPENSEARCH_PUB_POST_OUTLINE"',
        "action": "index"
    }]
}'


# Test uploading a post directly to the OpenSearch DBMS endpoint
opensearch_pub_upload_direct() {
    
}

# Create an index template in the locally referenced OpenSearch instance with name to give it and path to template JSON file as params
os_create_index_template() {
    tmplt=$(cat $2)
    
    if [[ $tmplt == *"No such file or directory" ]]; then
        echo -e "rpos-utils.sh: Template $2 not found. Exiting..."
        exit -1
    fi

    response=$(curl -X PUT $tmplt "$OPENSEARCH_HTTP_API_BASE_URL/_index_template/$1")

    echo -e "Response:\n$response"
}
