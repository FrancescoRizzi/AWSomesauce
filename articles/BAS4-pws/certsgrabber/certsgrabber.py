#!/usr/bin/env python

import os
import requests
import json

import boto3
from boto3.session import Session
import botocore

SOURCE_URI = "https://login.microsoftonline.com/common/discovery/v2.0/keys"

# Simplest form of logging using the standard logging module:
# ============================================================
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


# Top-Level Handler:
# ============================================================
def lambda_handler(event, context):
    logger.info("CertsGrabber Triggered.")

    # Check Configuration before wasting time
    # ========================================================

    # DESTINATION_BUCKET: required
    dest_bucket = os.environ.get('DESTINATION_BUCKET', None)
    if not dest_bucket:
        logger.error("Missing Required 'DESTINATION_BUCKET' Environmental Variable.")
        raise ValueError("Missing/blank 'DESTINATION_BUCKET'")
    logger.info("Destination Bucket: '{0!s}'.".format(dest_bucket))

    # SOURCE_URI: presumed (hardcoded)
    logger.info("Source URI: '{0!s}'.".format(SOURCE_URI))

    # ========================================================

    g = Grabber()
    keys = g.GrabKeysFrom(SOURCE_URI)
    logger.info("Retrieved {0!s} Keys.".format(len(keys)))

    saved = []

    if keys:
        writer = BucketWriter()
        for (index, k) in enumerate(keys):
            logger.info("Saving Key #{0!s}/{1!s}.".format(index, len(keys)))
            saved_kid = writer.SaveKey(k, dest_bucket)
            if saved_kid:
                logging.info("Saved Key #{0!s}/{1!s}: kid: {2!s}.".format(index, len(keys), saved_kid))
                saved.append(saved_kid)
            else:
                logging.warn("Key #{0!s}/{1!s} was NOT saved.".format(index, len(keys)))
    else:
        logger.warn("No Keys retrieved from Source URI.")

    logger.info("CertsGrabber Completed ({0!s} keys saved).".format(len(saved)))
    return {}


# Grabber:
# ============================================================
class Grabber(object):

    def __init__(self):
        pass

    def GrabKeysFrom(self, source_uri):
        logger.info("Requesting GET '{0!s}'.".format(source_uri))
        response = requests.get(source_uri)
        logger.info("Received Response with Status '{0!s}'.".format(response.status_code))
        response.raise_for_status()

        response_json = response.json()
        logger.info("Parsed Response JSON.")

        keys = response_json.get('keys', None)
        if keys:
            logger.info("Retrieved {0!s} key(s).".format(len(keys)))
        else:
            logger.warn("No 'keys' property found in Response.")
        return keys


# BucketWriter:
# ============================================================
class BucketWriter(object):

    def __init__(self):
        self._session = None
        self._client = None

    def SaveKey(self, key, dest_bucket):
        kid = key.get('kid', None)
        if not kid:
            logger.error("Cannot save key with missing/blank 'kid' property: {0!s}".format(key))
            return None

        logger.info("Saving Key by kid: '{0!s}'.".format(kid))
        payload = json.dumps(key)

        self.EnsureClient()

        request_args = {}
        request_args['Bucket'] = dest_bucket
        request_args['Key'] = kid
        request_args['Body'] = payload

        response = self._client.put_object(**request_args)
        return kid

    def EnsureClient(self):
        self.EnsureSession()
        if not self._client:
            self._client = self._session.client('s3')

    def EnsureSession(self):
        if not self._session:
            self._session = boto3.Session()








