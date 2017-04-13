#!/bin/bash
# ============================================================
#	chmod u+x make.sh
#	./make.sh
# ============================================================

# ============================================================
# Configuration:
# ============================================================
#
# PROFILE:
#		AWS Profile to be used
#
# LBUCKET:
#		Name of the AWS S3 Bucket to be used to upload
#		Lambda Deployment Packages.
#
# SWSID:
#		SWS Instance Identifier
#
# STACKNAME:
#		Name of the CloudFormation Stack to be used
#
# VENVS_HOME:
#		Path to the default location for virtual environment
#		home directory
#
# AUTH_APP_ID:
#		Client Application ID to be used for Authentication
#		with the Identity Provider (MS AD on Azure)
#
# AUTH_TENANT_ID:
#		Tenant ID to be used for Authentication
#		with the Identity Provider (MS AD on Azure)
#
# ============================================================

PROFILE="your_aws_profile"
LBUCKET="sws.lambdas"
SWSID="swsdev"
STACKNAME="SWSStack"
VENVS_HOME="$WORKON_HOME"
AUTH_APP_ID="your_client_id"
AUTH_TENANT_ID="your_tenant_id"

# ============================================================
ORIGINALPWD=$PWD
# ============================================================

printf "\n"
printf "Make for SWSAPI:\n"
printf "========================================\n"
printf "AWS Profile              : $PROFILE\n"
printf "Lambdas Bucket Name      : $LBUCKET\n"
printf "SWSID                    : $SWSID\n"
printf "Stack Name               : $STACKNAME\n"
printf "Virtual Environments Home: $VENVS_HOME\n"
printf "Auth Application Id      : $AUTH_APP_ID\n"
printf "Auth Tenant Id           : $AUTH_TENANT_ID\n"

# ============================================================

printf "\n"
printf "========================================\n"
printf "Preparing Lambda Packages:\n"
printf "========================================\n"

printf "certsgrabber:\n"
# ============================================================
rm -f certsgrabber.zip
if [ $? != 0 ] ; then
	printf "!> FAILED to remove certsgrabber.zip.\n"
	exit $?
else
	printf "\tRemoved certsgrabber.zip\n"
fi

PACKZIP="$ORIGINALPWD/certsgrabber.zip"

PACKDIR="$ORIGINALPWD/certsgrabber"
cd $PACKDIR
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$PACKDIR'.\n"
	exit $?
else
	printf "\tcd into '$PACKDIR'\n"
fi

zip -g $PACKZIP ./certsgrabber.py
if [ $? != 0 ] ; then
	printf "!> FAILED to add certsgrabber.py to '$PACKZIP'.\n"
	exit $?
else
	printf "\tAdded certsgrabber.py to '$PACKZIP'.\n"
fi

DEPSDIR="$VENVS_HOME/certsgrabber/lib/python2.7/site-packages"
cd $DEPSDIR
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$DEPSDIR'.\n"
	exit $?
else
	printf "\tcd into '$DEPSDIR'\n"
fi

zip -r9 $PACKZIP *
if [ $? != 0 ] ; then
	printf "!> FAILED to add dependencies to '$PACKZIP'.\n"
	exit $?
else
	printf "\tAdded dependencies to '$PACKZIP'.\n"
fi

cd $ORIGINALPWD
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$ORIGINALPWD'.\n"
	exit $?
else
	printf "\tcd into '$ORIGINALPWD'\n"
fi

printf "custauth:\n"
# ============================================================
rm -f custauth.zip
if [ $? != 0 ] ; then
	printf "!> FAILED to remove custauth.zip.\n"
	exit $?
else
	printf "\tRemoved custauth.zip\n"
fi

PACKZIP="$ORIGINALPWD/custauth.zip"

PACKDIR="$ORIGINALPWD/custauth"
cd $PACKDIR
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$PACKDIR'.\n"
	exit $?
else
	printf "\tcd into '$PACKDIR'\n"
fi

zip -g $PACKZIP ./custauth.py
if [ $? != 0 ] ; then
	printf "!> FAILED to add custauth.py to '$PACKZIP'.\n"
	exit $?
else
	printf "\tAdded custauth.py to '$PACKZIP'.\n"
fi

DEPSDIR="$VENVS_HOME/custauth/lib/python2.7/site-packages"
cd $DEPSDIR
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$DEPSDIR'.\n"
	exit $?
else
	printf "\tcd into '$DEPSDIR'\n"
fi

zip -r9 $PACKZIP * \
	-x _cffi_backend.so \
	-x cffi \
	-x cffi-1.10.0.dist-info \
	-x cryptography/\* \
	-x cryptography-1.8.1.dist-info/\*
if [ $? != 0 ] ; then
	printf "!> FAILED to add dependencies to '$PACKZIP'.\n"
	exit $?
else
	printf "\tAdded dependencies to '$PACKZIP'.\n"
fi

AWSDIR="$ORIGINALPWD/libs-for-aws"
cd $AWSDIR
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$AWSDIR'.\n"
	exit $?
else
	printf "\tcd into '$AWSDIR'\n"
fi

zip -gr9 $PACKZIP \
	_cffi_backend.so \
	.libs_cffi_backend \
	cffi \
	cffi-1.10.0.dist-info \
	cryptography \
	cryptography-1.8.1-py2.7.egg-info/

if [ $? != 0 ] ; then
	printf "!> FAILED to add dependency (for AWS) to '$PACKZIP'.\n"
	exit $?
else
	printf "\tAdded dependency (for AWS) to '$PACKZIP'.\n"
fi

cd $ORIGINALPWD
if [ $? != 0 ] ; then
	printf "!> FAILED to cd to '$ORIGINALPWD'.\n"
	exit $?
else
	printf "\tcd into '$ORIGINALPWD'\n"
fi

printf "directors:\n"
# ============================================================
rm -f directors.zip
if [ $? != 0 ] ; then
	printf "!> FAILED to remove.\n"
	exit $?
else
	printf "\tRemoved\n"
fi
zip directors.zip ./directors.py
if [ $? != 0 ] ; then
	printf "!> FAILED to zip.\n"
	exit $?
else
	printf "\tOK\n"
fi

printf "agents:\n"
# ============================================================
rm -f agents.zip
if [ $? != 0 ] ; then
	printf "!> FAILED to remove.\n"
	exit $?
else
	printf "\tRemoved\n"
fi
zip agents.zip ./agents.py
if [ $? != 0 ] ; then
	printf "!> FAILED to zip.\n"
	exit $?
else
	printf "\tOK\n"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "Packaging SAM CloudFormation Templates:\n"
printf "========================================\n"

printf "sws_cfn:\n"
aws cloudformation package \
	--template-file ./sws_cfn.yaml \
	--s3-bucket $LBUCKET \
	--output-template-file ./sws_cfn_packaged.yaml \
	--profile $PROFILE
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "Deploying CloudFormation ChangeSet:\n"
printf "========================================\n"

printf "sws_cfn_packaged:\n"
aws cloudformation deploy \
	--profile $PROFILE \
	--template-file ./sws_cfn_packaged.yaml \
	--stack-name $STACKNAME \
	--capabilities CAPABILITY_NAMED_IAM \
	--parameter-overrides SWSID=$SWSID AUTHCLIENTID=$AUTH_APP_ID AUTHTENANT=$AUTH_TENANT_ID
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "Retrieving Stack Outputs:\n"
printf "========================================\n"

# aws cloudformation describe-stacks \
# 	--stack-name $STACKNAME \
# 	--no-paginate \
# 	--output text \
# 	--query 'Stacks[0].Outputs[?OutputKey==`SWSRestApiId`]'

RESTAPIID=$(aws cloudformation describe-stacks --stack-name $STACKNAME --no-paginate --output text --query 'Stacks[0].Outputs[?OutputKey==`SWSRestApiId`]' | cut -f3)

if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

if [ "${RESTAPIID}" == "" ]; then
	printf "!> FAILED: Could not find SWSRestApiId Stack Output.\n"
	exit 1
else
	printf "\tSWSRestApiId: $RESTAPIID\n"
fi;

# ============================================================

printf "\n"
printf "========================================\n"
printf "Requesting Deployment:\n"
printf "========================================\n"

aws apigateway create-deployment \
	--rest-api-id $RESTAPIID \
	--stage-name $SWSID \
	--stage-description "SWS REST API Stage" \
	--description "Stage Deployment by make.sh" \
	--no-cache-cluster-enabled
	#--cache-cluster-size <value>
	#--variables <value>
	#--cli-input-json <value>
	#--generate-cli-skeleton <value>
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "Requesting JS SDK:\n"
printf "========================================\n"

aws apigateway get-sdk \
	--rest-api-id $RESTAPIID \
	--stage-name $SWSID \
	--sdk-type javascript \
	./aws_js_sdk.zip

if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "All Done.\n"
exit 0


