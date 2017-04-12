---
title: "A002 - Hello Lambda"
permalink: /articles/A002-hellolambda/index.html
---

# A002 - Hello Lambda (Work In Progress)

A simple template for simple scenarios: consider this the *"Getting Started"* template, a tad more than what you get in the official [AWS Lambda Developer Guide: Getting Started](http://docs.aws.amazon.com/lambda/latest/dg/getting-started.html).

The Lambda function itself will simply log the event it receives, and return a salutation message. The simple use case allows us to focus on some ancillary topics (eg: how do you deploy and test this?) that will be handy in more complex use cases.

## The Use Case

We wish to develop a *"Hello World"* Lambda function: given a triggering event, which *may* include a *\<name>* argument, the function should return a salutation (*"Hello, \<name>."*), using *"World"* if no *\<name>* was provided.

## hello_world Lambda

Perhaps the simplest possible solution is a 1-liner handler: [hello_world_1.py](./hello_world_1.py)

```python
{% include_relative hello_world_1.py %}
```

Code-golfing aside, here's a slightly longer version that also introduces a bit of simple logging: [hello_world_2.py](./hello_world_2.py)

```python
{% include_relative hello_world_2.py %}
```

<div class="note tangent">
   <h5>On Returning</h5>
   <p>I'm purposely avoiding details about the `return` statement here. This is because it leads to a long digression on the ways a Lambda function can return results, and/or signal success/error. That merits its own article at some point (#TODO).</p>
</div>

## Logging Basics

Logging from Python Lambdas can be achieved through different means. The official [AWS Lambda Developer Guide: Logging (Python)](http://docs.aws.amazon.com/lambda/latest/dg/python-logging.html) gives you an overview, which is a reasonable starting point (although I might later add more details for more complex cases, #TODO).

For now, let's say logging can be done by

* using `print` statements
   * if you feel fancy, even `from __future__ import print_function` to be future-friendly
* using the standard `logging` module
   * logged messages will have some additional information that can help during diagnostics

In [hello_world_2.py](./hello_world_2.py) I used the simple `print` statements. Here's the `logging` alternative: [hello_world_3.py](./hello_world_3.py)

```python
{% include_relative hello_world_3.py %}
```

We're now:

* importing `logging` instead of `__future__`
* using `logging.info()` to log an *INFO*-level message
* added a couple of lines to initialize the `logger` object outside of the `lambda_handler` method

<div class="note tangent">
   <h5>On Top-Level Scoped Variables</h5>
   <p>Why was the <code class="highlighter-rouge">logger</code> object declared and initialized <em>outside</em> of the method scope? That has got to do with the way the AWS Lambda engine manages the container where our Lambda function runs. There is a chance for the container to be re-used, so sometimes we declare and initialize variables outside of our method to try and minimize the chance to apy the initialization costs if we can avoid it. Another topic for another article. #TODO</p>
</div>

*hello_world* is not quite what you'd call *Enterprise-grade* (or *cloud-scale*, or *lol-scale*), but for the simple use case we're facing that may be a *Good Thing*. Time to look beyond the actual code of the Lambda function.

<div class="note">
   <h5>Where's my TDD?</h5>
   <p>For the purists, I apologize for not writing tests before the code. This was done by choice, to introduce the Lambda function first. This doesn't mean I recommend always writing the code first in all cases (nor, to be honest, the opposite).</p>
</div>

## About Testing

So, what about testing, in this Brave New World of distributed, cloud-based, even serverless computing?
My recommendation is to plan and use multiple layers of testing:

* **Unit Testing:** focuses on testing the smallest units of your solution in isolation. For instance: test a method in your script (or a method in a class).
* **Integration Testing:** focuses on testing the collaboration of your solution's components. For instance: test that under certain conditions your script is triggered, and will request certain operations (eg: save data to a database) from a separate component (eg: an AWS data storage service).

Things can certainly be more complicated than this. A couple of examples:

* Your organization (or project) may require you to have contractually-enforced **Acceptance Tests** that represent the agreement of proper functionality with external stakeholders
* Some of the components in your solution are large and complex enough to warrant some level of **Component Testing** of their own (eg: test the collaboration of the various parts that make up that component, without involving any other component)

For our current use case, these seem far-fetched concerns, so let's focus on the basics.

## Unit Tests

The best tools to test the smallest parts of our solution usually come in the form of unit testing frameworks developed for the kind of program we're developing. For instance, as *hello_world* is a simple Python script, we can use any of the unit testing tools available for Python.

You [have many options](https://wiki.python.org/moin/PythonTestingToolsTaxonomy), but here's what my starter's toolbox looks like (you don't necessarily need to use all of these tools):

* [unittest](https://docs.python.org/2/library/unittest.html): the standard Python unit testing module
* [node](http://nose.readthedocs.io/en/latest/): a handy extension of unittest
* [mock](http://www.voidspace.org.uk/python/mock/): a mocking library

Unit tests for [hello_world_3.py](./hello_world_3.py) could look like this: [test_hello_world_3_unittest.py](./test_hello_world_3_unittest.py)

```
{% include_relative test_hello_world_3_unittest.py %}
```

Here's a sample run from within your virtual environment, with the built-in coverage option:

```
%> nosetests --with-coverage --cover-erase test_hello_world_3_unittest.py
..
Name               Stmts   Miss  Cover
--------------------------------------
hello_world_3.py      10      0   100%
--------------------------------------------------
Ran 2 tests in 0.002s

OK
```

## Deployment

The 100% coverage from above may seem nice, but don't be lulled into a false sense of security. All we can say at this stage, is that our Lambda function has been [WOMM Certified](https://jcooney.net/archive/2007/02/01/42999.aspx) because it [Works On My Machine](https://blog.codinghorror.com/the-works-on-my-machine-certification-program/).

{: .center}
![WOMM Certified](./womm.png)

The road to releasing our Hello World service is not over. The next step is to deploy our solution to the AWS platform, and can take many forms.

Specifically, at this stage, we want to create a new *AWS Lambda Function* resource, and configure it as needed (eg: with the code we've developed above). The AWS platform is designed to serve many use cases, and supports various ways to interact with it.
For instance, to request the creation of a new Lambda Function, we could:

* Use the [AWS Web Console](https://aws.amazon.com/console/): designed primarily for web-based interactive use:
   * Lambda > Functions > 'Create a Lambda function', and follow the wizard
* Use the [AWS CLI](https://aws.amazon.com/cli/): designed primarily for command-line interactive use:
   * `%> aws lambda create-function [OPTIONS]` [Docs](http://docs.aws.amazon.com/cli/latest/reference/lambda/create-function.html)
* Write a program that uses [Boto3](https://boto3.readthedocs.io/en/latest/index.html): designed primarily for Python programs:
   * `response = client.create_function(...)` [Docs](https://boto3.readthedocs.io/en/latest/reference/services/lambda.html#Lambda.Client.create_function)
* Use [AWS CloudFormation](https://aws.amazon.com/cloudformation/):

   > AWS CloudFormation gives developers and systems administrators an easy way to create and manage a collection of related AWS resources, provisioning and updating them in an orderly and predictable fashion.

   * Create a CloudFormation Stack Template
   * Submit and execute the template to AWS CloudFormation (which, in itself, can be done by any of the other means described in this list)
* Make an HTTP Request to the [AWS REST API](http://docs.aws.amazon.com/lambda/latest/dg/API_Reference.html): designed to expose AWS as a RESTful service
   * [Docs](http://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html), eg:

         POST /2015-03-31/functions HTTP/1.1
         Content-type: application/json

         {
         "Code": { ... },
         "Description": "...",
         "FunctionName": "...",
         etc...
         }

I'll let you in on a secret: while there are many ways you can submit a request to AWS, **they all boild own to the last one:** Making an HTTP Request to the AWS REST API. All the other methods are tools and layers of abstractions built upon the essential lower-level REST API protocol, and exist simply to make it simpler for users in various use cases.

As we're working with an extremely *simple* use case, we'll go through the simplest approach (ie: using the AWS Web Console), with a word of caution:

<div class="note warning">
   <h5>Avoid Manual Operations</h5>
   <p>The process we're about to review is essentially a <em>manual operation</em>. It requires a user to interact with a tool (the AWS Web Console). If the user is not available to perform these operations, the deployment process cannot be performed. So, <em>please</em> head my words and <strong>move away from manual steps as soon as possible!</strong> I'll soon write on the other methods by which you can deploy your solutions to AWS, and you will see how they are superior to this manual process. #TODO</p>
</div>

The official [AWS Lambda Developer Guide](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html) includes a good reference for the process of manually deploying a simple Lambda function as [Step 2.1: Create a Hello World Lambda Function](http://docs.aws.amazon.com/lambda/latest/dg/get-started-create-function.html). Follow those steps, but when use the code we developed in [hello_world_3.py](./hello_world_3.py).

Specifically, when you reach **Step 5\. On the Configure function page, do the following:**, instead of simply reviewing the pre-canned code, paste the source from [hello_world_3.py](./hello_world_3.py) in the *Lambda Function Code* text area.

<div class="note tangent">
   <h5>Other Lambda Details</h5>
   <p>As you follow the basic steps to deploy your Lambda function, you'll notice there are a number of details you could configure, such as: <em>Triggers</em>, <em>Handler Name</em>, <em>Role used by the Lambda</em>, etc... These are all advanced topics I hope to tackle at a later time, but are not essential at this time: don't let them distract you from the simple use case. #TODO</p>
</div>

## Testing in Lambda

Now that we deployed *hello_world* as a Lambda function on AWS, we can perform some form of integration testing. This may be surprising because we've essentially deployed a single component to the platform (the lonely *hello_world* function). However, we've now deployed to the AWS platform, so there are other components that our function is expected to interact with:

* The AWS Lambda engine itself:
   * did we correctly configure our function so that the engine can run it when needed?
   * did we include any dependency necessary (and not provided by the engine by default)?
* The AWS IAM Service:
   * did we configure our Lambda function with an appropriate Role that provides access to the resources it needs at run-time?
* The AWS CloudWatch service:
   * can our function use it to log the messages we expect?

For our simple use case, and simple function, this can all be tested through a simple manual process accessible through the AWS Web Console.

Once again, the official [AWS Lambda Developer Guide](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html) includes a good reference for this process as [Step 2.2: Invoke the Lambda Function Manually and Verify Results, Logs, and Metrics](http://docs.aws.amazon.com/lambda/latest/dg/get-started-invoke-manually.html). You can follow those steps, using the following Input test events in step 2:

| Test         | Input Event            | Expected Output                     |
| ------------ | ---------------------  | ----------------------------------- |
| No \<name>   | `{ }`                  | `{ "salutation": "Hello, World."}`  |
| With \<name> | `{ "name": "Lambda" }` | `{ "salutation": "Hello, Lambda."}` |

<div class="note warning">
   <h5>Avoid Manual Operations</h5>
   <p>This is also a <em>manual operation</em> you should try and avoid in less trivial use cases. Technically, you could write a program, or a framework, to do what the 'Test' button in the AWS Web Console does: exercising your Lambda function with some input, through the <a href="http://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html">Invoke AWS REST API</a>, and capture the result returned by your function. Or through the equivalent <a href="http://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html">AWS CLI Lambda invoke</a> command, or the equivalent <a href="https://boto3.readthedocs.io/en/latest/reference/services/lambda.html#Lambda.Client.invoke">Boto3 Lambda Invoke]</a>. All of which sounds like great fun, but way beyond what <em>Hello World</em> is worth.<br />
   Just remember that this is a manual process, and it's ok only for quick spot checking, but nothing beyond that.</p>
</div>

With the lambda function properly deployed and tested, it is time to talk about AWS Lambda's best friend: AWS API Gateway.

## API Gateway

Let's start with the blurb from the [AWS API Gateway Page](https://aws.amazon.com/api-gateway/):

> Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale.

That may sound vague, but to be fair it's because API Gateway can do, or at least enable, a lot of stuff. It's sort of open-ended, because it is designed as a routing mechanism from incoming HTTP requests to.. a handler of some sort. For instance, you could set it up so that properly formatted requests, describing a data entity, can be routed to a database table in your AWS DynamoDB, and insert a new record.

In our case, we'll route the requests to be served by the *hello_world* Lambda we deployed. When used in this role, I think of API Gateway as the *hosting* and *routing* front-end to expose your Lambda functions as HTTP API/Endpoints. Let's see what we need to do to set up API gateway so that requests to a certain URL are routed to our *hello_world* function.

The official [AWS API Gateway Developer Guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) includes a good reference under [Getting Started - Build an API Step by Step](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html). You can follow those steps, using the following information instead of the sample pets and dogs:

* Create a new **API**, named for instance `helloworldAPI`
* Create a new **Resource** within the API, named `hw`, with resource path set to `/hw`
* Create a new **Method** within the Resource, selecting `GET` as the method verb
* Use `Lambda Function` as the **Integration Type** for the method
* Pick a **Lambda Region** where your Lambda function is available
* Select the **Lambda Function** you uploaded previously

This should have brought you to about step 4 of the [Getting Started - Build an API Step by Step](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html), and already you could perform some test through the AWS Web Console to verify that your *helloworldAPI* is properly configured. However, we will hold on to that for a little longer, because we have not completed the set up to account for the optional \<name> input argument, so at this stage you would always receive the default `Hello, Lambda.` response.

API Gateway supports the various means by which a client can send data for an HTTP service:

* URL Query String Parameters
* HTTP Request Headers
* Data within the HTTP Request Body

In addition, API Gateway allows us to map and transform the data from the form it receives it to a different form sent to the triggered event handler (in our case, the triggered Lambda function). For our simple case, we'll use the *HTTP Request Headers* method.

<div class="note tangent">
   <h5>API Gateway Request Data Handling</h5>
   <p>I'll talk more about the various ways an API Gateway method can handle and relay request data in a different article. #TODO</p>
</div>

From the AWS Web Console, API Gateway Service page displaying the details of your newly created *helloworldAPI* API, with the */hw* Resource and *GET* Method selected:

* Click on the **Method Request** panel:
   * Expand the *HTTP Request Headers* section, and add a new header named `X-Name`
   * Return to the method's 4-panels page by clicking the *Method Execution* link at the top of the page.
* Click on the **Integration Request** panel:
   * Expand the *Body Mapping Templates* section, and add a new *mapping template* for *Content-Type* `application/json`
   * In the mapping template text-area, enter the following template (which says *"take the value from the input parameter X-Name and pass it to the handler as a property 'name' of an anonymous object"*):
      `{ "name": "$input.params('X-Name')" }`
   * Return to the method's 4-panels page by clicking the *Method Execution* link at the top of the page.

Your *helloworldAPI* API, with the */hw* Resource, *GET* method, *Request Mapping*, **and** the *hello_world* Lambda function are all ready for some integration testing now.

<div class="note tangent">
   <h5>Other API Gateway Details</h5>
   <p>If you're following along in your AWS Web Console, you probably noticed that it has a large number of other features and options. I shall write about those one day. #TODO</p>
</div>

## Testing in API Gateway

By know you should know what I think about **Manual Operations**, but that doesn't keep me from giving you a quick tour of the built-in Testing facility within API Gateway, as it is a handy way to make sure your API, Resources, Methods, and Mappings are configured as needed to talk to your Lambda function.

Once again, from the AWS Web Console, API Gateway Service page displaying the details of your newly created *helloworldAPI* API, with the */hw* Resource and *GET* Method selected, click the **Test** link in the *Client* box to the left of the *Method Request* panel.
The Test page for an API Gateway method provides fields to let you enter any of the configured means by which input data can be provided (*Path*, *Query String*, *Headers*, *Stage Variables* and *Request Body*). In our case, you should be able to specify (or leave blank) the value for the `X-Name` header, and click the *Test* button to see the results:

| Test         | X-Name        | Expected Output                     |
| ------------ | ------------- | ----------------------------------- |
| No \<name>   | *leave blank* | `{ "salutation": "Hello, World."}`  |
| With \<name> | `Lambda`      | `{ "salutation": "Hello, Lambda."}` |

## Deploying the API

Our simple system is in place:

* The *hello_world* Lambda Function is deployed to AWS Lambda
* The *helloWorldAPI* API is configured on AWS API Gateway, with a */hw* Resource, with a *GET* method redirecting to the Lambda function

All we need to do now is to Deploy the API (in AWS API Gateway) to a **Stage** so that the */hw* HTTP endpoint is available to the public for use outside of the AWS Web Console.

The official developer guide [on Deploying an API in Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-deploy-api.html) provides lots of informations on the various options available to your solution. For our current simple scenario, we don't need to worry about most of these, but we can simply deploy using the AWS Web Console (*sigh*, another Manual Operation) as follows:

* In the AWS Web Console, Amazon API Gateway service pages, in the left-hand side navigation menu, select:
   * APIs > helloworldAPI > Resources
   * In the list of Resources for the API, select the **root** Resource ('/')
* From the 'Actions' drop-down button, select **Deploy API**
* In the 'Deploy API' dialog:
   * 'Deployment stage': select `[New Stage]`
   * 'Stage Name': enter a stage name (eg: `hwdev`)
   * Click on the 'Deploy' button

AWS deploys the API to the new stage, and will display at the top of the page the URL for the deployed solution, eg: Invoke URL: https://*\<GUID>*.execute-api.us-east-1.amazonaws.com/hwdev

You can use this URL to reach your service and submit requests to it (eg: via a web browser, or via Curl), but remember to add the resource name in the URL (eg: https://*\<GUID>*.execute-api.us-east-1.amazonaws.com/hwdev**/hw**), and, of course, if you wish to submit a \<name> argument, send it via the `X-Name` HTTP Header.




