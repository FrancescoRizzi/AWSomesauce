#!/usr/bin/env python
"""
hello_world_2
"""

from __future__ import print_function
import json


def lambda_handler(event, context):
    print "Triggered by event: {0!s}".format(json.dumps(event, indent=2))
    name = event.get('name', None) or 'World'
    salutation = "Hello, {0!s}.".format(name)
    return {
        'salutation': salutation
    }
