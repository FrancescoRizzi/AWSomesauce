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
# SWASRC:
# 		Local path leading to SWA (eg: /dist)
#
# SWABUCKET:
#		Name of the S3 Bucket hosting SWA
#
# STACKNAME:
#		Name of the CloudFormation Stack to be used
#
# ============================================================

PROFILE="your_aws_profile"
SWASRC="./dist"
SWABUCKET="swa.site"
STACKNAME="SWAStack"

# ============================================================

printf "\n"
printf "Make for SWA:\n"
printf "========================================\n"
printf "AWS Profile              : $PROFILE\n"
printf "Local Source             : $SWASRC\n"
printf "Hosting Bucket Name      : $SWABUCKET\n"
printf "Stack Name               : $STACKNAME\n"

# ============================================================

printf "\n"
printf "========================================\n"
printf "Uploading Site to S3:\n"
printf "========================================\n"
aws s3 cp $SWASRC s3://$SWABUCKET \
	--recursive \
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
printf "Enable AWS CLI CloudFront Preview:\n"
printf "========================================\n"
aws configure set preview.cloudfront true --profile $PROFILE
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "Creating CloudFront OAI:\n"
printf "========================================\n"

printf "Generating Unique Statement ID...\n"
STATEMENTID=$(uuidgen)
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
	printf "\tStatement Id: $STATEMENTID\n"
fi

printf "Creating OAI...\n"
OAIID=$(aws cloudfront create-cloud-front-origin-access-identity --cloud-front-origin-access-identity-config CallerReference=$STATEMENTID,Comment=MadeForSWA --output text --query 'CloudFrontOriginAccessIdentity.Id' --profile $PROFILE)
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
	printf "\tOAI Id: $OAIID"
fi

# ============================================================

printf "\n"
printf "========================================\n"
printf "Deploying CloudFormation ChangeSet:\n"
printf "========================================\n"

printf "swa_cfn:\n"
aws cloudformation deploy \
	--profile $PROFILE \
	--template-file ./swa_cfn.yaml \
	--stack-name $STACKNAME \
	--parameter-overrides SWABucket=$SWABUCKET SWACloudFrontOAI=$OAIID
# --capabilities CAPABILITY_NAMED_IAM \
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

SWADOMAIN=$(aws cloudformation describe-stacks --stack-name $STACKNAME --no-paginate --output text --query 'Stacks[0].Outputs[?OutputKey==`SWADomain`]' | cut -f3)
if [ $? != 0 ] ; then
	printf "!> FAILED.\n"
	exit $?
else
	printf "\tOK\n"
fi

if [ "${SWADOMAIN}" == "" ]; then
	printf "!> FAILED: Could not find SWADomain Stack Output.\n"
	exit 1
else
	printf "\tSWADomain: $SWADOMAIN\n"
fi;

# ============================================================

printf "\n"
printf "========================================\n"
printf "All Done.\n"
exit 0
