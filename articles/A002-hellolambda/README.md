---
title: "A002 - Hello Lambda"
permalink: /articles/a002-hellolambda/index.html
---

# A002 - Hello Lambda

A simple template for simple scenarios: consider this the *"Getting Started"* template, a tad more than what you get in the official [AWS Lambda Developer Guide: Getting Started](http://docs.aws.amazon.com/lambda/latest/dg/getting-started.html).

The Lambda function itself will simply log the event it receives, and return a salutation message. The simple use case allows us to focus on some ancillary topics (eg: how do you deploy and test this?) that will be handy in more complex use cases.

# The Use Case

We wish to develop a *"Hello World"* Lambda function: given a triggering event, which *may* include a \<name> argument, the function should return a salutation: *"Hello, \<name>."*, using *"World"* if no \<name> was provided.

# hello_world Lambda

Perhaps the simplest possible solution is a 1-liner handler: [hello_world_1.py](./hello_world_1.py)

```python
{% include_relative hello_world_1.py %}
```

Code-golfing aside, here's a slightly longer version that also introduces a bit of simple logging: `hello_world_2.py`

```python
{% include_relative hello_world_2.py %}
```

**NOTE:** I'm glancing over the `return` statement here, because it leads to the larger topic of signaling success (and returning results) or error conditions in Lambda functions, and that leads to proper error handling, and... well, things escalate quickly, and this is supposed to be the *SIMPLE* Lambda scenario. Expect a separate article on those topics at some point. #TODO

## Logging
Logging from Python Lambdas can be achieved through different means. The official [AWS Lambda Developer Guide: Logging (Python)](http://docs.aws.amazon.com/lambda/latest/dg/python-logging.html) gives you an overview, which is a reasonable starting point (although I might later add more details for more complex cases, #TODO).

For now, let's say logging can be done by

* using print statements (and if you feel fancy you can `from __future__ import print_function` to be future-friendly), or
* using the standard `logging` module (in which case the logged messages have some additional information that can help diagnostics)

In `hello_world_2` I used the simplest option: `prints` statements.
Here's the alternative: `hello_world_3.py`

```python
{% include_relative hello_world_3.py %}
```

We're now:

* importing `logging` instead of `__future__`
* using `logging.info()` to log an *INFO*-level message
* added a couple of lines to initialize the `logger` object outside of the `lambda_handler` method

**NOTE:** Another topic I don't want to dive in at this stage: why was the `logger` initialized *outside* of the `lambda_handler` method? Well, the AWS Lambda engine *might* let our Lambda function re-use its run-time context under some conditions (but there's no guarantee). So, objects declared outside of the top-level lambda handler method will remain *alive* and we can avoid paying initialization costs. In this case, the initialization of the `logger` is not a costly operation, so it was done outside of the `lambda_handler` for simplicity. #TODO

Our `hello_world` is not quite what most people might call `Enterprise-grade` (or `cloud-scale` or `lol-scale`), but for the simple use case we're facing that may be a Good Thing. Time to look beyond the actual code of the Lambda function.

**NOTE:** For the purists, I apologize. I did not write the tests first. By choice, although this doesn't mean I reccommend always writing the code first and the tests afterward. Mayhap I'll write about TDD one day, but it may not be a topic strictly for AWSomesauce.

# About Testing and Tests Categorization

So, what about testing, in this Brave New World of distributed, cloud-based, even serverless computing?
My reccommendation is to plan and use multiple layers of testing:
* **Unit Testing:** focuses on testing the smallest units of your solution in isolation. For instance: test a method in your script (or a method in a class).
* **Integration Testing:** focuses on testing the collaboration of your solution's components. For instance: test that under certain conditions your script is triggered, and will request certain operations (eg: save data to a database) from a separate component (eg: your own `Storage` service/class, or an AWS data storage service like DynamoDB).

Things can certainly be more complicated than this. A couple of examples:
* your organization (or project) may require you to have contractually-enforced `Acceptance Tests` that represent the agreement of proper functionality with external stakeholders
* some of the components in your solution are large and complex enough to warrant some level of `integration testing` of their own (eg: test the collaboration of the various parts that make up that component, without involving any other component)

For our `hello_world` use case, these seem far-fetched concerns, so let's focus on the basics.

## Unit Tests

The best tools to test the smallest parts of our solution usually come in the form of unit testing frameworks developed for the kind of program we're using. For instance, as `hello_world` is currently a simple Python script, we can use any of the unit testing tools available, and designed for Python scripts.

You definitely [have many options](https://wiki.python.org/moin/PythonTestingToolsTaxonomy), but here's what my starter's toolbox looks like (you don't necessarily need to use all of these tools):
* [unittest](https://docs.python.org/2/library/unittest.html): the standard Python unit testing module
* [node](http://nose.readthedocs.io/en/latest/): a handy extension of unittest
* [mock](http://www.voidspace.org.uk/python/mock/): a mocking library

For instance, `test_hello_world_3_unittest.py` is a simple `unittest`-based test for `hello_world_3.py`:
```
{% include_relative test_hello_world_3_unittest.py %}
```



## Deployment

## Integration tests

## No APIGateway Yet?

# References:

* [AWS Lambda Home](https://aws.amazon.com/lambda/)
* [AWS Lambda Developer Guide](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
