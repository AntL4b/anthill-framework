# Anthill Framework

A lightweight, fast and reliable dependence-less TypeScript framework for building powerful serverless backend applications on AWS.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/AntL4b/anthill-framework/blob/main/LICENSE)
[![Build][build-image]][build-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

The project aims to provide an environment and tools for developing REST API using AWS Lambda and API Gateway. Anthill framework comes with an HTTP request handling system capable of caching, running middlewares, dealing with CORS and much more ! It can handle classic AWS Lambda invocation as well (i.e. No HTTP / AWS API Gateway integration).

Anthill comes with strong typing and structure because readability counts and code benefits from being explicit.

## Why Anthill framework ?

There are a lot of existing frameworks to build amazing web backends.
So, why should you use Anthill ?

- It has ZERO dependency
- This is a tailor-made framework for AWS using API Gateway and Lambda
- It's crazy fast compared to other framework even when facing cold starts
- It's 100% TypeScript and everything is strongly typed

## Quick start

Here is the code for an "Hello world" example:

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

## Request lifecycle

![image](https://github.com/AntL4b/anthill-framework/blob/main/docs/images/request-lifecycle.drawio.png?raw=true)

## Configuration

Anthill framework uses a configuration inheritance system allowing to apply some common logic within your app, controller or handler scope.

Ex: For dealing with cors for all the REST handlers of the application, set it on Anthill app scope:

```ts
const app = anthill();
app.configure({
  controllers: [MyController],
  restHandlerConfig: {
    middlewares: [new AHCorsMiddleware()]
  }
});
```

Ex: The following code will enable caching and require that an "Authorization" header is provided for each of the controller handlers.
The second handler configuration will override the caching configuration to apply a shorter TTL.

```ts
@RestController({
  cacheConfig: {
    cacheable: true,
    ttl: 120,
    },
  middlewares: [new AHHeaderFieldMiddleware(["Authorization"])],
})
class MyController {
  /**
   * My First handler
   */
  @RestHandler({ method: AHRestMethodEnum.Get })
  myHandler1(event: AHAwsEvent): AHHttpResponse {
    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success
    });
  }

  /**
   * My second handler
   */
  @RestHandler({
    method: AHRestMethodEnum.Get,
    cacheConfig: { ttl: 60 },
  })
  myHandler2(event: AHAwsEvent): AHHttpResponse {
    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success,
    });
  }
}
```

Here is an example of how 3 layers of configuration can work.

> [!NOTE]  
> Middleware inheritance is cumulative so the 3 layers of middleware will be applied successively.
> From Anthill to Handler during runBefore and in reversed order during runAfter.
> See more in [Middlewares](#middlewares) section.

## Routing
## Controllers & Handlers
### REST
### Lambdas
## Middlewares
### Use existing ones
### Create your own
### Example: cognito authentication
## Cache
## Logger
## Time tracker


[build-image]: https://github.com/AntL4b/anthill-framework/actions/workflows/build.yml/badge.svg
[build-url]: https://github.com/AntL4b/anthill-framework/actions/workflows/build.yml
[coveralls-image]: https://coveralls.io/repos/github/AntL4b/anthill-framework/badge.svg
[coveralls-url]: https://coveralls.io/github/AntL4b/anthill-framework
[npm-version-image]: https://badgen.net/npm/v/@antl4b/anthill-framework
[npm-url]: https://www.npmjs.com/package/@antl4b/anthill-framework
[npm-install-size-image]: https://badgen.net/packagephobia/install/@antl4b/anthill-framework
[npm-install-size-url]: https://packagephobia.com/result?p=@antl4b/anthill-framework
