#!/usr/bin/env python
"""
hello_world_3
"""

import logging
import json


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("Triggered by event: {0!s}".format(json.dumps(event, indent=2)))
    name = event.get('name', 'World')
    salutation = "Hello, {0!s}.".format(name)
    return {
        'salutation': salutation
    }
