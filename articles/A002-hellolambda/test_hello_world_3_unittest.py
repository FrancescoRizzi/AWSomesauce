#!/usr/bin/env python
"""
test_hello_world_3
"""

import unittest
import json
import hello_world_3


class TestHelloWorld3(unittest.TestCase):

    def test_lambda_handler(self):
        name = 'AWSomesauce'
        event = { 'name': name }

        expected = {'salutation': "Hello, {0!s}.".format(name) }
        expected_info = "Triggered by event: {0!s}".format(json.dumps(event, indent=2))

        actual = hello_world_3.lambda_handler(event, {})
        self.assertEqual(expected, actual)

    def test_lambda_handler_uses_World_when_name_is_missing(self):
        event = { }

        expected = {'salutation': "Hello, {0!s}.".format('World') }
        expected_info = "Triggered by event: {0!s}".format(json.dumps(event, indent=2))

        actual = hello_world_3.lambda_handler(event, {})
        self.assertEqual(expected, actual)


if __name__ == '__main__':
    unittest.main()