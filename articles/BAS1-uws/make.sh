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
# ============================================================

PROFILE="syncservice"
LBUCKET="sws.lambdas"
SWSID="swsdev"
STACKNAME="SWSStack"

# ============================================================

printf "\n"
printf "Make for SWSAPI:\n"
printf "========================================\n"
printf "AWS Profile              : $PROFILE\n"
printf "Lambdas Bucket Name      : $LBUCKET\n"
printf "SWSID                    : $SWSID\n"
printf "Stack Name               : $STACKNAME\n"

# ============================================================

printf "\n"
printf "========================================\n"
printf "Preparing Lambda Packages:\n"
printf "========================================\n"

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
	--parameter-overrides SWSID=$SWSID
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
