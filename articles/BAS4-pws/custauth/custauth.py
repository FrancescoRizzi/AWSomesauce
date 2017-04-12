#!/usr/bin/env python

import os
import json
import StringIO
from contextlib import closing
import re
import time
import pprint

import boto3
from boto3.session import Session
import botocore

import jwt
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend


# Simplest form of logging using the standard logging module:
# ============================================================
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


# Top-Level Handler:
# ============================================================
def lambda_handler(event, context):
    logger.info("CustAuth Triggered.")

    authToken = event.get('authorizationToken', '')
    methodArn = event.get('methodArn', '')
    authHeader = event.get('Authorization', '')
    logger.info("Authorization Token : '{0!s}'.".format(authToken))
    logger.info("Method ARN          : '{0!s}'.".format(methodArn))
    logger.info("Authorization Header: '{0!s}'.".format(authHeader))

    # Check Configuration before wasting time
    # ========================================================

    # AUTH_APP_ID: required
    auth_app_id = os.environ.get('AUTH_APP_ID', None)
    if not auth_app_id:
        logger.error("Missing Required 'AUTH_APP_ID' Environmental Variable.")
        raise ValueError("Missing/blank 'AUTH_APP_ID'")
    logger.info("Auth App ID         : '{0!s}'.".format(auth_app_id))

    # AUTH_TENANT_ID: required
    auth_tenant_id = os.environ.get('AUTH_TENANT_ID', None)
    if not auth_tenant_id:
        logger.error("Missing Required 'AUTH_TENANT_ID' Environmental Variable.")
        raise ValueError("Missing/blank 'AUTH_TENANT_ID'")
    logger.info("Auth Tenant ID      : '{0!s}'.".format(auth_tenant_id))

    # CERTS_BUCKET: required
    certs_bucket = os.environ.get('CERTS_BUCKET', None)
    if not certs_bucket:
        logger.error("Missing Required 'CERTS_BUCKET' Environmental Variable.")
        raise ValueError("Missing/blank 'CERTS_BUCKET'")
    logger.info("Certificates Bucket : '{0!s}'.".format(certs_bucket))

    # ========================================================

    # Client credentials expected in the authorizationToken, in the form:
    # 'Bearer <id_token>'

    # Missing authorizationToken:
    #   response 401 - Unauthorized (although we don't send back a 'WWW-Authenticate' header as we should)
    if not authToken:
        logger.warn("Missing Authorization Token: will trigger 401-Unauthorized response.")
        raise Exception('Unauthorized')

    validator = TokenValidator()
    validToken = validator.ValidateToken(authToken, auth_app_id, auth_tenant_id, certs_bucket)

    logger.info("Is the Authorization Token valid? {0!s}".format(validToken))

    # authorizationToken invalid (format or contents):
    #   respond with Policy DENYING access, which will trigger API Gateway to respond with
    #   response 403 - Forbidden

    # authorizationToken valid (format and contents):
    #   respond with Policy ALLOWING access, which will trigger API Gateway to
    #   proceed with the backend integration configured on the method.

    principalId = auth_app_id

    arnParts = event['methodArn'].split(':')
    apiGatewayArnTmp = arnParts[5].split('/')
    awsAccountId = arnParts[4]

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = arnParts[3]
    policy.stage = apiGatewayArnTmp[1]

    policyDesc = ''

    if validToken:
        policy.allowAllMethods()
        policyDesc = 'ALLOW'
    else:
        policy.denyAllMethods()
        policyDesc = 'DENY'

    authResponse = policy.build()

    # Optional: context
    #   The response can also include a 'context' key-value pairs mapping,
    #   which will be rendered available to the configured backend
    #   (if the policy is such that the request handling continues)
    #   as $context.authorizer.<key>
    #   This mapping is part of the cached response.
    #
    # context = {
    #     'key': 'value', # $context.authorizer.key -> value
    #     'number' : 1,
    #     'bool' : True
    # }
    # authResponse['context'] = context
    #
    # INVALID formats:
    #   context['arr'] = ['foo']
    #   context['obj'] = {'foo':'bar'}

    logger.info("CustAuth completed: returning policy to {0!s} access.".format(policyDesc))
    return authResponse


# TokenValidator
# ============================================================
class TokenValidator(object):
    
    PEMSTART = "-----BEGIN CERTIFICATE-----\n"
    PEMEND = "\n-----END CERTIFICATE-----\n"

    def __init__(self):
        self._session = None
        self._client = None

    def ValidateToken(self, auth_header, auth_app_id, auth_tenant_id, certs_bucket):

        # auth_header expected to be in the form:
        #   'Bearer <id_token>'

        (pre, encoded_token) = auth_header.split(' ', 2)

        if (not pre) or (pre.upper() != "BEARER"):
            logger.warn("Authorization Token did not match expected 'Bearer <id_token>' format.")
            return False

        expected_issuer = 'https://sts.windows.net/{0!s}/'.format(auth_tenant_id)

        unverified_headers = jwt.get_unverified_header(encoded_token)
        #unverified_token = jwt.decode(encoded_token, algorithms=['RS256'], audience=auth_app_id, issuer=expected_issuer, options={'verify_signature': False})
        #x5t = unverified_token.get('x5t', None)
        #kid = unverified_token.get('kid', None)
        kid = unverified_headers.get('kid', None)
        logger.info("Token 'kid': '{0!s}'.".format(kid))
        if not kid:
            logger.warn("Could not extract 'kid' property from token.")
            return False

        cert_pem = self.GetSigningCertificate(certs_bucket, kid)
        if cert_pem:
            logger.info("Retrieved Signing Certificate.")

            #if isinstance(cert_pem, unicode):
            #    logger.info("Signing Certificate is unicode. Will attempt STRICT conversion.")
            #    cert_pem = cert_pem.encode('ascii', 'strict')
            #    logger.info("Signing Certificate unicode encoded to ASCII.")

            cert = load_pem_x509_certificate(cert_pem, default_backend())
            logger.info("Loaded Signing Certificate.")

            public_key = cert.public_key()
            logger.info("Extracted Public Key from Signing Certificate.")

            decoded = jwt.decode(encoded_token, public_key, algorithms=['RS256'], audience=auth_app_id, issuer=expected_issuer)
            # NOTE: the JWT decode method verifies
            #   - general format of the encoded token
            #   - signature, using the given public key
            #   - aud claim (Audience) vs audience value
            #   - exp claim (Expiration) vs current datetime (UTC)
            #   - nbf claim (Not Before) vs current datetime (UTC)
            #   - iss claim (Issuer) vs issuer value
            if decoded:
                logger.info("Token Decoded and Validated Successfully.")
                return True
            else:
                logger.warn("Failed to Decode Token when verifying signature.")
                return False
        else:
            logger.warn("Could not retrieve signing certificate matching token's 'kid' property ('{0!s}').".format(kid))
            return False

    def GetSigningCertificate(self, certs_bucket, kid):
        self.EnsureClient()

        discovery_record_str = None
        with closing(StringIO.StringIO()) as dest:
            self._client.download_fileobj(
                Bucket=certs_bucket,
                Key=kid,
                Fileobj=dest)
            discovery_record_str = dest.getvalue()
        if not discovery_record_str:
            logger.warn("Could not retrieve Discovery Record from Bucket.")
            return None

        logger.info("Retrieved Discovery Record Payload from Bucket.")

        # discovery_record_str is the payload extracted from
        # the bucket, presumed to be the JSON-formatted string
        # of the signing certificate discovery record. eg:
        # {
        #   "x5t": "...",
        #   "use": "...",
        #   "e": "...",
        #   "kty": "...",
        #   "n": "...",
        #   "x5c": [
        #       "..."
        #   ],
        #   "issuer": "...",
        #   "kid": "..."
        # }
        # What we need to extract as 'certificate' is
        # the first value in the "x5c" property list

        discovery_record = json.loads(discovery_record_str)
        logger.info("Parsed Discovery Record JSON.")

        x5c = discovery_record.get('x5c', None)
        if not x5c:
            logger.warn("Could not find 'x5c' property from Discovery Record.")
            return None
        logger.info("Discovery Record x5c found.")

        raw_cert = ""
        if isinstance(x5c, list):
            raw_cert = x5c[0]
        elif isinstance(x5c, basestring):
            raw_cert = x5c
        else:
            logger.warn("Unexpected data type for x5c value from Discovery Record (expected string or list).")
            return None

        logger.info("Raw Cert:|{0!s}|".format(raw_cert))

        if isinstance(raw_cert, unicode):
            logger.info("Raw Certificate is unicode. Attempting STRICT conversion to ASCII.")
            raw_cert = raw_cert.encode('ascii', 'strict')
            logger.info("Raw Certificate encoded to ASCII.")

        logger.info("Formatting Raw Certificate according to PEM 64-characters lines.")
        raw_cert = self.InsertNewLines(raw_cert)
        logger.info("Raw Certificate lines length normalized to PEM.")

        pem_cert = self.PEMSTART + raw_cert + self.PEMEND
        logger.info("After wrapping Raw certificate in PEM Markers:")
        logger.info(pem_cert)

        #tmp = "is NOT"
        #if isinstance(raw_cert, unicode):
        #    tmp = "is"
        #logger.info("Before Wrapping in PEM delimiters, the raw_cert data type {0!s} unicode.".format(tmp))
        #
        #pem_cert = self.PEMSTART + raw_cert + self.PEMEND
        #logger.info("PEM Cert:|{0!s}|".format(pem_cert))
        #
        #tmp = "is NOT"
        #if isinstance(pem_cert, unicode):
        #    tmp = "is"
        #logger.info("After Wrapping in PEM delimiters, the pem_cert data type {0!s} unicode.".format(tmp))
        #
        #if isinstance(pem_cert, unicode):
        #    logger.info("Signing Certificate is unicode. Will attempt STRICT conversion.")
        #    pem_cert = pem_cert.encode('ascii', 'strict')
        #    logger.info("Signing Certificate unicode encoded to ASCII.")
        #
        #logger.info("Splitting according to PEM format (64 characters per line).")
        #pem_cert = self.InsertNewLines(pem_cert)
        #logger.info("After splitting in 64-character long lines:")
        #logger.info(pem_cert)

        return pem_cert

    def InsertNewLines(self, s, every=64):
        lines = []
        for i in xrange(0, len(s), every):
            lines.append(s[i:i+every])
        return '\n'.join(lines)

    def EnsureClient(self):
        self.EnsureSession()
        if not self._client:
            self._client = self._session.client('s3')

    def EnsureSession(self):
        if not self._session:
            self._session = boto3.Session()


# HttpVerbs
# ============================================================
class HttpVerb:
    GET     = "GET"
    POST    = "POST"
    PUT     = "PUT"
    PATCH   = "PATCH"
    HEAD    = "HEAD"
    DELETE  = "DELETE"
    OPTIONS = "OPTIONS"
    ALL     = "*"


# AuthPolicy
# ============================================================
class AuthPolicy(object):
    awsAccountId = ""
    """The AWS account id the policy will be generated for. This is used to create the method ARNs."""
    principalId = ""
    """The principal used for the policy, this should be a unique identifier for the end user."""
    version = "2012-10-17"
    """The policy version used for the evaluation. This should always be '2012-10-17'"""
    pathRegex = "^[/.a-zA-Z0-9-\*]+$"
    """The regular expression used to validate resource paths for the policy"""

    """these are the internal lists of allowed and denied methods. These are lists
    of objects and each object has 2 properties: A resource ARN and a nullable
    conditions statement.
    the build method processes these lists and generates the approriate
    statements for the final policy"""
    allowMethods = []
    denyMethods = []

    restApiId = "*"
    """The API Gateway API id. By default this is set to '*'"""
    region = "*"
    """The region where the API is deployed. By default this is set to '*'"""
    stage = "*"
    """The name of the stage used in the policy. By default this is set to '*'"""

    def __init__(self, principal, awsAccountId):
        self.awsAccountId = awsAccountId
        self.principalId = principal
        self.allowMethods = []
        self.denyMethods = []

    def _addMethod(self, effect, verb, resource, conditions):
        """Adds a method to the internal lists of allowed or denied methods. Each object in
        the internal list contains a resource ARN and a condition statement. The condition
        statement can be null."""
        if verb != "*" and not hasattr(HttpVerb, verb):
            raise NameError("Invalid HTTP verb " + verb + ". Allowed verbs in HttpVerb class")
        resourcePattern = re.compile(self.pathRegex)
        if not resourcePattern.match(resource):
            raise NameError("Invalid resource path: " + resource + ". Path should match " + self.pathRegex)

        if resource[:1] == "/":
            resource = resource[1:]

        resourceArn = ("arn:aws:execute-api:" +
            self.region + ":" +
            self.awsAccountId + ":" +
            self.restApiId + "/" +
            self.stage + "/" +
            verb + "/" +
            resource)

        if effect.lower() == "allow":
            self.allowMethods.append({
                'resourceArn' : resourceArn,
                'conditions' : conditions
            })
        elif effect.lower() == "deny":
            self.denyMethods.append({
                'resourceArn' : resourceArn,
                'conditions' : conditions
            })

    def _getEmptyStatement(self, effect):
        """Returns an empty statement object prepopulated with the correct action and the
        desired effect."""
        statement = {
            'Action': 'execute-api:Invoke',
            'Effect': effect[:1].upper() + effect[1:].lower(),
            'Resource': []
        }

        return statement

    def _getStatementForEffect(self, effect, methods):
        """This function loops over an array of objects containing a resourceArn and
        conditions statement and generates the array of statements for the policy."""
        statements = []

        if len(methods) > 0:
            statement = self._getEmptyStatement(effect)

            for curMethod in methods:
                if curMethod['conditions'] is None or len(curMethod['conditions']) == 0:
                    statement['Resource'].append(curMethod['resourceArn'])
                else:
                    conditionalStatement = self._getEmptyStatement(effect)
                    conditionalStatement['Resource'].append(curMethod['resourceArn'])
                    conditionalStatement['Condition'] = curMethod['conditions']
                    statements.append(conditionalStatement)

            statements.append(statement)

        return statements

    def allowAllMethods(self):
        """Adds a '*' allow to the policy to authorize access to all methods of an API"""
        self._addMethod("Allow", HttpVerb.ALL, "*", [])

    def denyAllMethods(self):
        """Adds a '*' allow to the policy to deny access to all methods of an API"""
        self._addMethod("Deny", HttpVerb.ALL, "*", [])

    def allowMethod(self, verb, resource):
        """Adds an API Gateway method (Http verb + Resource path) to the list of allowed
        methods for the policy"""
        self._addMethod("Allow", verb, resource, [])

    def denyMethod(self, verb, resource):
        """Adds an API Gateway method (Http verb + Resource path) to the list of denied
        methods for the policy"""
        self._addMethod("Deny", verb, resource, [])

    def allowMethodWithConditions(self, verb, resource, conditions):
        """Adds an API Gateway method (Http verb + Resource path) to the list of allowed
        methods and includes a condition for the policy statement. More on AWS policy
        conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition"""
        self._addMethod("Allow", verb, resource, conditions)

    def denyMethodWithConditions(self, verb, resource, conditions):
        """Adds an API Gateway method (Http verb + Resource path) to the list of denied
        methods and includes a condition for the policy statement. More on AWS policy
        conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition"""
        self._addMethod("Deny", verb, resource, conditions)

    def build(self):
        """Generates the policy document based on the internal lists of allowed and denied
        conditions. This will generate a policy with two main statements for the effect:
        one statement for Allow and one statement for Deny.
        Methods that includes conditions will have their own statement in the policy."""
        if ((self.allowMethods is None or len(self.allowMethods) == 0) and
            (self.denyMethods is None or len(self.denyMethods) == 0)):
            raise NameError("No statements defined for the policy")

        policy = {
            'principalId' : self.principalId,
            'policyDocument' : {
                'Version' : self.version,
                'Statement' : []
            }
        }

        policy['policyDocument']['Statement'].extend(self._getStatementForEffect("Allow", self.allowMethods))
        policy['policyDocument']['Statement'].extend(self._getStatementForEffect("Deny", self.denyMethods))

        return policy