# Anthill Framework

A lightweight, fast and reliable dependence less TypeScript framework for building powerfull serverless backend applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/AntL4b/anthill-framework/blob/main/LICENSE)
[![Build][build-image]][build-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

The project aims to provide an environment and tools for developing REST API using AWS Lambdas and API Gateway. It comes with an HTTP request handling system that can handle caching requests, run middlewares, deal with CORS and much more ! It can handle classic AWS Lambda invocation as well (i.e. No HTTP / AWS API Gateway integration)

Anthill comes with strong typing and structure because code benefits from being explicit and readability counts.

## Quick start

Here is how we can code a simple "Hello world" example:

```ts
import {
  AHAwsEvent,
  AHHttpResponse,
  AHHttpResponseBodyStatusEnum,
  AHRestMethodEnum,
  RestController,
  RestHandler,
  anthill,
} from "@antl4b/anthill-framework";

@RestController()
class MyController {
  /**
   * Handle the request
   * @param event AWS event
   * @returns My handler response
   */
  @RestHandler({ method: AHRestMethodEnum.Get })
  myHandler(event: AHAwsEvent): AHHttpResponse {
    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success,
      payload: "Hello World",
    });
  }
}

const app = anthill();

app.configure({
  controllers: [MyController],
});

const handlers = app.exposeHandlers();
exports.myHandler = handlers.myHandler;
```

```bash
$ curl --request GET 'http://localhost:3000/dev/my-handler'
{"status":"success","payload":"Hello world"}
```

## Installation
This is a [Node.js](https://nodejs.org/en/) module available through the npm registry. Installation is done using the npm install command:
```bash
$ npm install @antl4b/anthill-framework --save
```

[build-image]: https://github.com/AntL4b/anthill-framework/actions/workflows/build.yml/badge.svg
[build-url]: https://github.com/AntL4b/anthill-framework/actions/workflows/build.yml
[coveralls-image]: https://coveralls.io/repos/github/AntL4b/anthill-framework/badge.svg
[coveralls-url]: https://coveralls.io/github/AntL4b/anthill-framework
[npm-version-image]: https://badgen.net/npm/v/@antl4b/anthill-framework
[npm-url]: https://www.npmjs.com/package/@antl4b/anthill-framework
[npm-install-size-image]: https://badgen.net/packagephobia/install/@antl4b/anthill-framework
[npm-install-size-url]: https://packagephobia.com/result?p=@antl4b/anthill-framework
