---
title: "Building a Shield - Unprotected Web Service"
permalink: /articles/BAS1-uws/index.html
---

[Previously in the BAS Series](../BAS-intro/README.md), we looked at the challenge in front of us at a high level.

# Building a Shield: The Unprotected Web Service

Time to start building something: let's start with a web service for the AWS platform.

## The Use Case

Let's say we need a web service to expose some sensitive information so that we (or other authorized parties) can build client applications to access and use the information in question.

More specifically, let's say we'd like to expose these HTTP Endpoints:

* GET <root_URI>/directors: produce the list of known directors of S.H.I.E.L.D.
* GET <root_URI>/agents: produce the list of agents of S.H.I.E.L.D.

## Lambda Functions

[directors.py](./directors.py) is a simple python script that drops a line in the logs and gets us the list of directors:

```python
{% include_relative directors.py %}
```

[agents.py](./agents.py) is quite similar: drops a line in the logs and gets us the list of agents.

## Cloud Formation

[sws_cfn.yaml](./sws_cfn.yaml) is the Cloud Formation Template for our Shield Web Service (hence the 'sws' prefix we'll use throughout).
Some highlights from the template:

* **Transform: "AWS::Serverless-2016-10-31"**<br />
   This indicates that the template is actually using the [AWS Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model) extension of the basic AWS Cloud Formation template standard. The SAM extension is designed specifically for AWS Serverless applications, so it's a natural fit for our effort.
* **SWSID:**<br />
   an input parameter to let us specify an "Instance Identifier", which we'll use in naming resources so that we can easily distinguish between, say, a "test" and a "production" instance of our web service.
* **SWSRole:**<br />
   An IAM Role we set up with the permissions necessary for our web service resources to interact with other AWS resources. The Role by itself allows 2 AWS Services ("lambda.amazonaws.com" and "apigateway.amazonaws.com") to assume the Role. The permissions that are gained by assuming the role are specified by SWSPolicy.
* **SWSPolicy:**<br />
   An IAM Policy specifying the set of permissions our web service resources will need (eg: create and write logs). The policy is attached to the SWSRole.
* **DirectorsLambda and AgentsLambda:**<br />
   The Lambda functions depend on the SWSRole, as we use that Role as each lambda's execution role. See also the section below about *"Lambdas and Cloud Formations"*.
* **DirectorsLambdaPermission and AgentsLambdaPermission:**<br />
   These permissions enable the AWS API Gateway engine to trigger the corresponding Lambda function, which is necessary to tie these lambdas as backend for requests received by the API Gateway endpoints (eg: a request to GET .../directors should trigger the DirectorsLambda). Note that the SourceArn property includes references to the *AWS::Region* and *AWS::AccountId* [Pseudo Parameters](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html), as well as the *SWSAPI* resource (described below).
* **SWSAPI:**<br />
   This is the API Gateway *RestAPI* resource used by our web service. Most of its details are described by the *Body* property, which includes 2 paths: */directors* and */agents*. For each path, we specify method handlers matching 2 HTTP verbs: *GET* and *OPTIONS*. Each GET method handler is configured to trigger the corresponding Lambda function.

   The OPTIONS method handlers are configured (with the help of the *x-amazon-apigateway-integration* extension element) as simple *mock* handlers to respond with the appropriate set of HTTP Headers. They methods are necessary for [CORS support](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html), as the client web application will not (necessarily) be hosted on the same domain as the web service.

   See also the section below about *"Swagger/OpenAPI, and Cloud Formations"*.
* **SWSRestApiId Output:**<br />
   We define an Output parameter to capture the *RestApiId* of the SWSAPI REST API. This will make it easier for us to retrieve that value once the Cloud Formation template is deployed, as we will need it for some additional operations.

### Lambdas and Cloud Formations

Before moving on, it's worth giving a brief overview of the ways that your source code on your development machine can be bundled, deployed and used by the AWS Lambda service - because it's more complicated than you might think.

**First, the most trivial case:** your source code is in a single file, and depends on no 3rd-party module (other than those that AWS provides "for free"in the [AWS Lambda Execution Environment](http://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html), like boto3). In this case, whether you create the Lambda function through the AWS web console, or through a Cloud Formation template, or through calls to the AWS REST API, you can take the source code from your file and specify it "inline". As your source code grows, and/or starts depending on other modules, or even if you just want to run some automated unit tests before deploying it, this approach breaks down.

**Secondly, the less-trivial cases:** your source code is in one or more external files, and may depend on 3rd-party libraries that you have available on your machine. In this case, instead of specifying the source code for the Lambda function "inline", you'll need to:

* Create a "Lambda Deployment Package" with your source code
* Deploy the Lambda Deployment Package to S3
* Provide the S3 path to the Lambda Deployment Package as you create or update the Lambda function

[Creating the Lambda Deployment Package](http://docs.aws.amazon.com/lambda/latest/dg/lambda-python-how-to-create-deployment-package.html) can be complicated in its own right, but in short it boils down to:

* Create a zip archive
* Add your source code at the top level of the archive
* Add 3rd-party modules to the top level of the archive
   * **Note:** if a 3rd-party module has binary dependencies, you must include the version of that module built targeting the OS that AWS Lambda uses at run-time. That means you should build those libraries against one of the [AWS Linux AMIs listed here](https://aws.amazon.com/amazon-linux-ami/). That can be a complicated process of its own, and varies from module to module.

Now that you have a Lambda Deployment Package, you can upload it to S3 by any means available to you, and use the S3 path when creating the Lambda function.
However, if you are using a Cloud Formation template to create or maintain your Lambda functions, you can also do the following:

* Use the **CodeURI** property of the *AWS::Lambda::Function* or *AWS::Serverless::Function* resource, setting it to the relative path leading from the template to the Lambda Deployment Package zip archive
* Feed the Cloud Formation template through the AWS CLI **cloudformation package** command, which performs the upload of the Lambda Deployment Package zip archive to S3, and replaces the CodeURI property value with the S3 path
* Submit the updated Cloud Formation template to create a Change Set and deploy (either through AWS web console or through the AWS CLI **cloudformation deploy** command).

### Swagger/OpenAPI, and Cloud Formations

Another topic worth mentioning is the different ways through which you can specify the details of an API Gateway REST API resource through your Cloud Formation templates.

* **Specify each resource separately:**<br />
   Each of the elements necessary to completely define a REST API in API Gateway can be represented as a separate Cloud Formation Resource (eg: the REST API itself, and each Resource within, and each Method, etc...).
* **Use an external Swagger/OpenAPI file:**<br />
   The REST API resource supports a *BodyS3Location* property, which you can set to the S3 path where you uploaded a [Swagger/OpenAPI](http://swagger.io/introducing-the-open-api-initiative/) definition file. As for the Lambda Deployment Packages, there are options on how you can coordinate the uploading of this file to S3 and the submission of your Cloud Formation template.
* **Use an inline Swagger/OpenAPI definition:**<br />
   The REST API resource supports a *Body* property, which can be set to an inline Swagger/OpenAPI definition. The main advantages of this option compared to the external Swagger/OpenAPI file are:
   * you can use the Cloud Formation facilities (such as [Pseudo Parameters](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html), and [Intrinsic Functions](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html))
   * you don't have to upload the Swagger/OpenAPI definition to S3 before submitting the Cloud Formation template

## make.sh

You might have guessed from the last couple of sections, that the process to deploy our simple Lambda functions and Cloud Formation template to AWS is not quite as easy as the click of a button. Therefore, we add a shell script (I'm working on a Mac at this point in time) to facilitate, automate, and make repeatable, the steps in front of us.

[make.sh](./make.sh) is fairly straight forwar at this point. The main sections of the script are:

* **Configuration:**<br />
   Some configurable variables you can modify as needed.
* **Preparing Lambda Packages:**<br />
   directors.py is bundled in a directors.zip archive; agents.py into agents.zip. If either archive already exists, it is first deleted.
* **CloudFormation Package:**<br />
   The sws_cfn.yaml Cloud Formation template is submitted to the *cloudformation package* command, and the resulting "packaged" template saved as *sws_cfn_packaged.yaml*.
* **CloudFormation Deploy:**<br />
   The packaged sws_cfn_packaged.yaml template is submitted to *cloudformation deploy* to create the necessary stack change set and deploy to AWS.
* **Retrieve the REST API Id:**<br />
   The deployed stack is inspected via *cloudformation describe-stack* to retrieve the value of the *SWSRestApiId* Output Parameter, necessary for the next steps.
* **API Gateway Deployment:**<br />
   The REST API created by the Cloud Formation stack is deployed to an API Gateway Stage.
* **Retrieve the JS SDK:**<br />
   Finally, we retrieve the Javascript SDK that API Gateway provides for the newly deployed REST API, which will be useful to create the matching web application client in the next stage, and we save it locally as *aws_js_sdk.zip*.

## Deploying

<div class="note warning">
   <h5>BEFORE running the next steps, you should:</h5>
   <p>Create a Bucket, Ensure make.sh is executable, Configure make.sh.</p>
</div>

* **Create a Bucket to hold the Lambda Deployment Packages:**<br />
   Use the AWS web console (or any other mean available to you) to create an S3 bucket (or use an existing S3 bucket if you want) to sroe the Lambda Deployment Packages.
   * You can pick any [DNS-compliant name](http://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html); we'll assume the bucket is named **sws.lambdas**.
   * You'll have to select a **Region**.
   * **Versioning, Logging, and Tagging** are not necessary.
   * **Persmissions** should allow the *Owner* to Read and Write objects in the bucket, but no additional user permissions are necessary (ie: the bucket does not need to be *public*).
* **Ensure make.sh is executable:**<br />
   * `$> chmod u+x make.sh`
* **Configure make.sh:**<br />
   Open the shell script and modify the configuration at the top as appropriate:
   * **PROFILE:** the name of the AWS profile (configured on your machine via AWS CLI)
   * **LBUCKET:** the name of the S3 Bucket created above
   * **SWSID:** (optional) this will be used to distinguish different instances of the web service
   * **STACKNAME:** (optional) this can be used to have separate AWS Cloud Formation Stacks

**Finally:**

```shell

$>./make.sh 

Make for SWSAPI:
========================================
AWS Profile              : aws_profile
Lambdas Bucket Name      : sws.lambdas
SWSID                    : swsdev
Stack Name               : SWSStack

========================================
Preparing Lambda Packages:
========================================
directors:
   Removed
  adding: directors.py (deflated 55%)
   OK
agents:
   Removed
  adding: agents.py (deflated 65%)
   OK

========================================
Packaging SAM CloudFormation Templates:
========================================
sws_cfn:
Uploading to b8a1762ccf8fecc17989c02c22f9f5b4  474 / 474.0  (100.00%)%)
Successfully packaged artifacts and wrote output template to file ./sws_cfn_packaged.yaml.
Execute the following command to deploy the packaged template
aws cloudformation deploy --template-file [...]/BAS1-uws/sws_cfn_packaged.yaml --stack-name <YOUR STACK NAME>
   OK

========================================
Deploying CloudFormation ChangeSet:
========================================
sws_cfn_packaged:
Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - SWSStack
   OK

========================================
Retrieving Stack Outputs:
========================================
   OK
   SWSRestApiId: j1icuqmgj0

========================================
Requesting Deployment:
========================================
{
    "description": "Stage Deployment by make.sh", 
    "id": "yge686", 
    "createdDate": 1491412603
}
   OK

========================================
Requesting JS SDK:
========================================
{
    "contentType": "application/octet-stream", 
    "contentDisposition": "attachment; filename=\"null-0.0.1-javascript.zip\""
}
   OK

========================================
All Done.

```

## Progress!

At this point you can use the AWS Web console to check out what has been built and deployed, and you can use its testing facilities to verify the expected behavior of the Lambda functions, and the API Gateway Methods.

This was simple stuff. Onward!

# BAS Series
* [BAS - Intro](../BAS-intro/README.md)
* [BAS1 - Unprotected Web Service](../BAS1-uws/README.md)
* [BAS2 - Unprotected Web App](../BAS2-uwa/README.md)
* [BAS3 - Protecting the Web App](../BAS3-pwa/README.md)
* [BAS4 - Protecting the Web Service](../BAS4-pws/README.md)



