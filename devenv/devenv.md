---
title: Development Environment
permalink: devenv.html
---

# Standard Development Environment

To avoid repeating myself a number of times, throughout this project I refer to a Standard Development Environment, documented below. Of course, where exceptions are necessary, I will document them appropriately.

## Quick List

* Operating System (OS): *Shouldn't matter*

   When/if a solution presented in this project is targeting a specific OS
   it should be properly noted and documented. Otherwise, the solutions are
   meant to be OS-independent (aka: portable) or target an AWS-specific OS
   for run-time (again, something to be noted case-by-case).
   For reference, I commonly use one of these:
   * MacOS (aka: Mac OS X) (currently: MacOS Sierra 10.12.3)
   * MS Windows 7 Pro 64-bit
   * MS Windows 10 64-bit

* Programming Languages: *Currently: Python 2.7*

   Given an extremely large amount of time, I would love to develop the
   solutions in this project using any and all different programming languages
   supported by the AWS platform.
   Time being an extremely limited resource, I am currently using
   Python as my primary language. Please don't take this as a philosophical
   statement on the merits of one language over another; it's primarily
   due to very practical reasons, and avoiding spending time maintaining multiple
   different development environments.
   
   **NOTE:** If you're using Python on a Mac, I reccommend reading
   [Using Python on a Macintosh](https://docs.python.org/2.7/using/mac.html)
   to avoid working on an environment that will at some point force you to
   start over.
   
   * Additional Python Tools:
      * [virtualenv](https://virtualenv.pypa.io/en/stable/) installed globally
      * (Mac): [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/) installed globally
      * (Win): [virtualenvwrapper-win](https://pypi.python.org/pypi/virtualenvwrapper-win) installed globally
      * [Boto3](https://boto3.readthedocs.io/en/latest/)

* [AWS CLI](https://aws.amazon.com/cli/): Always handy

* Text/Code Editor: *Whatever you like*


