#!/usr/bin/env python

from __future__ import print_function

import pprint


def lambda_handler(event, context):
    print("Agents requested.")

    return {
        "agents": [
            { "id": "60", "name": "Kuro Chin", "notes": "" },
            { "id": "Barbour", "name": "Barbour", "notes": "Stationed at the Hub" },
            { "id": "Baylin", "name": "Baylin", "notes": "Stationed at the Hub" },
            { "id": "tomasc", "name": "Tomas Calderon", "notes": "Member of the 'Real S.H.I.E.L.D.'" },
            { "id": "fitz", "name": "Leopold Fitz", "notes": "Weapons, gadgets, and cutting edge technology, Level 5 Clearance; Engineer" },
            { "id": "goodman", "name": "Goodman", "notes": "Doctor; participated in experiments on GH-325 and in Phil Coulson's resurrection." },
            { "id": "joeyg", "name": "Joey Gutierrez", "notes": "Inhuman construction worker and field agent with ability to manipulate metal objects; member of the Secret Warriors." },
            { "id": "mariah", "name": "Maria Hill", "notes": "Acting field agent; former Deputy Director; now an employee of Stark Industries. Had Level 9 Security Clearance before S.H.I.E.L.D. was taken down." },
            { "id": "billyk", "name": "Billy Koenig", "notes": "Stationed at secret base Playground." },
            { "id": "samk", "name": "Sam Koenig", "notes": "Stationed at secret base Playground." },
            { "id": "jazuat", "name": "Jazuat", "notes": "Doctor; stationed at S.H.I.E.L.D. Trauma Zentrum in Zurich, Switzerland."},
            { "id": "skye", "name": "Daisy Johnson", "notes": "Field agent; computer hacker; first known Inhuman agent with the ability to generate seismic vibrations. Leader of the Secret Warriors."},
            { "id": "jones", "name": "Jones", "notes": "Stationed at the Hub"},
            { "id": "mack", "name": "Mack", "notes": "Undercover trucker."},
            { "id": "alphonsom", "name": "Alphonso MacKenzie", "notes": "Mechanic and field agent; founding member of the 'Real S.H.I.E.L.D.'."},
            { "id": "melindam", "name": "Melinda May", "notes": "Ace pilot and weapons expert, Level 7 Security Clearance, a.k.a. 'the Cavalry'; Administrator"},
            { "id": "mikep", "name": "Mike Peterson", "notes": "Former test subject for Project Centipede and slave of John Garrett and Hydra. Now a member of S.H.I.E.L.D. aka: Deathlok."},
            { "id": "elenar", "name": "Elena Rodriguez", "notes": "Inhuman field agent with ability to move at super speed for the duration of one heartbeat before returning to her starting point. Member of the Secret Warriors."},
            { "id": "katherines", "name": "Katherine Shane", "notes": "Undercover specialist."},
            { "id": "jemmas", "name": "Jemma Simmons", "notes": "Life scientist; Xeno-biologist (both human and alien), Level 5 Clearance, Bio-chemist."},
            { "id": "shade", "name": "Shade", "notes": "Sationed at the Hub."},
            { "id": "shaw", "name": "Shaw", "notes": "Undercover specialist; stationed at the Hub."},
            { "id": "streiten", "name": "Streiten", "notes": "Doctor; participated in Phil Coulson's resurrection."},
            { "id": "tyler", "name": "Tyler", "notes": "Mechanic aboard helicarrier; later field agent."},
            { "id": "annew", "name": "Anne Weaver", "notes": "Director of the S.H.I.E.L.D. Academy of Science and Technology; member of the 'Real S.H.I.E.L.D.'"}
        ]
    }

