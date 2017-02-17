---
title: "A001 - Development Environment"
permalink: /articles/A001-devenv/index.html
---

# A001 - Development Environment

To avoid repeating myself a number of times, throughout this project I refer to a Standard Development Environment, documented below. Of course, where exceptions are necessary, I will document them appropriately.

## Operating System (OS)

*Shouldn't matter*

When/if a solution presented in this project is targeting a specific OS
it should be properly noted and documented. Otherwise, the solutions are
meant to be OS-independent (aka: portable) or target an AWS-specific OS
for run-time (again, something to be noted case-by-case).

For reference, I commonly use any of these:

* MacOS (aka: Mac OS X) (currently: MacOS Sierra 10.12.3)
* MS Windows 7 Pro 64-bit
* MS Windows 10 64-bit

## Programming Languages

*Currently: Python 2.7*

Given an extremely large amount of time, I would love to develop the
solutions in this project using any and all different programming languages
supported by the AWS platform.
Time being an extremely limited resource, I am currently using
Python as my primary language. Please don't take this as a philosophical
statement on the merits of one language over another; it's primarily
due to very practical reasons, and avoiding spending time maintaining multiple
different development environments.

<div class="note os mac">
   <h5>Python on a Mac</h5>
   <p>If you're using Python on a Mac, I reccommend reading <a href="https://docs.python.org/2.7/using/mac.html">Using Python on a Macintosh</a> to avoid working on an environment that will at some point force you to start over.</p>
</div>

## Additional Tools

* [AWS CLI](https://aws.amazon.com/cli/): the AWS-authored library to interact with AWS from your command-line; see the official documentation on:
   * [Getting Set Up with the AWS Command Line Interface](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html)
   * [Configuring the AWS Command Line Interface](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
* [virtualenv](https://virtualenv.pypa.io/en/stable/) installed globally
* virtualenvwrapper installed globally, which means:
   * (Mac): [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/)
   * (Win): [virtualenvwrapper-win](https://pypi.python.org/pypi/virtualenvwrapper-win)
* Set up AWSomesauce as a virtual environment, eg:
   * `%> mkproject AWSomesauce` (or whatever project name you wish to use)
   * `%> setvirtualenvproject \<path/to/AWSomesauce>`
   * `%> cdproject`
* Install dependencies within the AWSomesauce virtual environment:
   * `pip install -r requirements.txt`

Among the dependencies listed in [requirements.txt](./requirements.txt), there's one worth mentioning from the get-go:

* [Boto3](https://boto3.readthedocs.io/en/latest/): This is an AWS-authored Python package providing an easy-to-use programmatic API from your code to interact with AWS. Semantically, it is similar to the afore-mentioned AWS CLI, and our programs will use it wherever they need to submit requests to any of the AWS services.

## Test/Code Editor

*Whatever you like*

Just be sure you have your settings for spaces and tabs as you like them. After all, we're dealing with Python.


