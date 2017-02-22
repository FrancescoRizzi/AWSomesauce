#!/usr/bin/env python
"""
hello_world_1
"""

def lambda_handler(event, context):
    return { 'salutation': "Hello, {0!s}.".format(event.get('name', None) or 'World') }
