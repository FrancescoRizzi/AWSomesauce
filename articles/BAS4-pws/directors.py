#!/usr/bin/env python

from __future__ import print_function

import pprint


def lambda_handler(event, context):
    print("Directors requested.")

    return {
        "directors": [
            { "id": "peggyc", "name": "Peggy Carter" },
            { "id": "howards", "name": "Howard Stark" },
            { "id": "chesterp", "name": "Chester Phillips" },
            { "id": "alexanderp", "name": "Alexander Pierce" },
            { "id": "nickf", "name": "Nicholas J. Fury" },
            { "id": "tahiti", "name": "Phillip Coulson" },
            { "id": "bobg", "name": "Robert Gonzales" },
            { "id": "jeffm", "name": "Jeffrey Mace" }
        ]
    }
