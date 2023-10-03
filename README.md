<p align="center">
  <img src="https://github.com/AntL4b/anthill-framework/blob/main/docs/images/logo.png?raw=true" width="120" alt="Anthill Framework logo" />
</p>

<p align="center">
A lightweight, fast and reliable dependence-less TypeScript framework for building serverless applications on AWS.
</p>

<p align="center">
  <a href="https://github.com/AntL4b/anthill-framework/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" /></a>
  <a href="https://github.com/AntL4b/anthill-framework/actions/workflows/build.yml" target="_blank"><img src="https://github.com/AntL4b/anthill-framework/actions/workflows/build.yml/badge.svg" alt="Build" /></a>
  <a href="https://coveralls.io/github/AntL4b/anthill-framework" target="_blank"><img src="https://coveralls.io/repos/github/AntL4b/anthill-framework/badge.svg" alt="Coverage Status" /></a>
  <a href="https://www.npmjs.com/package/@antl4b/anthill-framework" target="_blank"><img src="https://badgen.net/npm/v/@antl4b/anthill-framework" alt="NPM Version" /></a>
  <a href="https://packagephobia.com/result?p=@antl4b/anthill-framework" target="_blank"><img src="https://badgen.net/packagephobia/install/@antl4b/anthill-framework" alt="NPM Install Size" /></a>
</p>

## Description

The project aims to provide an environment and tools for developing REST API using AWS Lambda and API Gateway. Anthill Framework comes with an HTTP request handling system capable of caching, running middlewares, dealing with CORS and much more ! It can handle classic AWS Lambda invocation as well (i.e. No HTTP / AWS API Gateway integration).

Anthill comes with strong typing and structure because readability counts and code benefits from being explicit.

## Why Anthill Framework ?

There are a lot of existing frameworks to build amazing web backends.
So, why should you use Anthill ?

- It has ZERO dependency
- It's tailor-made for AWS using API Gateway and Lambda
- It's light and fast even when facing cold starts
- It's 100% TypeScript and strongly typed

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

## Anthill

Anthill class is the main entry point of an Anthill project.
To define an Anthill app, you'll have to declare your app in the root file of your project such as:

```ts
const app = anthill();
```

Anthill app can then be configured using `configure()` method to register controllers and to set up common configuration within your project.

```ts
app.configure({
  controllers: [MyController],
  options: {
    defaultLogLevel: AHLogLevelEnum.Info,
    displayPerformanceMetrics: true,
  }
});
```

Finally, all registered controllers can have their handlers exposed inside an object using `exposeHandlers()` method to export and link them with the serverless configuration file.

```ts
const handlers = app.exposeHandlers();
exports.myHandler = handlers.myHandler;
```

## Configuration

Anthill Framework uses a configuration inheritance system allowing to apply some common logic within your app, controller or handler scope.

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
> Through Anthill, Controller and Handler during runBefore and in reversed order during runAfter.
> See more in [Middlewares](#middlewares) section.

## Routing

Anthill Framework doesn't provide a proper way of routing requests to a given handler according to some path related rules.
Traditional frameworks used to do it this way but, being in a serverless context, routing of requests to handlers benefits more from being carried out by API Gateway.

Here is an example of how requests can be routed to handlers using Serverless YML configuration file:

```yml
create-resource:
  handler: src/index.createResource
  events:
    - http:
        path: /resources
        method: post
list-resources:
  handler: src/index.listResources
  events:
    - http:
        path: /resources
        method: get
get-resource:
  handler: src/index.getResource
  events:
    - http:
        path: /resources/{id}
        method: get
delete-resource:
  handler: src/index.deleteResource
  events:
    - http:
        path: /resources/{id}
        method: delete
```

For more information on routing to handler, see [Serverless official documentation](https://www.serverless.com/).

Ensuring that each service is hosted by a single Lambda also helps a lot in terms of monitoring and troubleshooting.
Plus, it doesn't cost anything extra.

![image](https://github.com/AntL4b/anthill-framework/blob/main/docs/images/lambda-monitoring.png?raw=true)

If you're still not convinced and want to map an ANY method event to a single handler, then feel free to [create your own middleware](#create-your-own) to manage routing rules the way you prefer !

## Controllers & Handlers

Controllers permit grouping handlers according to whatever they have in common and define a scope in which some common configuration is applied.
When added to the Anthill app controller list with `configure()` (see [Anthill](#anthill)), all the handlers attached to it become exposeable by `exposeHandlers()` method.

Handlers are methods that can be either an instance method or a static method.
They are the main entry points for the code implementation

To create controllers and handlers, Anthill Framework uses classes and decorators.
Two types of controllers and handlers are available: `@RestController` / `@LambdaController` going in pair with `@RestHandler` / `@LambdaHandler`

> :warning: All handlers within the app MUST have different names.
> By default, the handler registration system will use the handler method name but there's a chance this name won't be unique.
> Ex: MyController1.list() and MyController2.list() won't work.
> If two handlers located in two controllers have the same name, you will have to declare an alternative name for at least one handler.
> The `name` property of the configuration object of `@RestHandler` / `@LambdaHandler` decorators if here for that

### REST

To create a REST controller containing a handler, decorate the controller class with `@RestController` and decorate the handler with `@RestHandler`

```ts
@RestController()
class MyController {
  @RestHandler({ method: AHRestMethodEnum.Get })
  myHandler(event: AHAwsEvent): AHHttpResponse {
    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success
    });
  }
}
```

`@RestController` decorator takes an optional argument to apply common configuration to all handlers inside it. See [configuration](#configuration) for more details on how it works.

REST handlers have to respect this signature:

```ts
restHandlerMethod(
  event: AHAwsEvent,
  context?: AHAwsContext,
  callback?: AHAwsCallback,
): Promise<AHHttpResponse> | AHHttpResponse;
```

As for the `@RestController` decorator, `@RestHandler` decorator takes an argument to apply configuration to the handler scope.

```ts
@RestController()
class MyController {
  @RestHandler({
    method: AHRestMethodEnum.Get,
    name: "myHandlerAlternativeName",
    middlewares: [new AHJsonBodyParserMiddleware()]
  })
  myHandler(event: AHAwsEvent): AHHttpResponse {
    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success
    });
  }
}
```

### Lambda

To create a Lambda controller containing a handler, decorate the controller class with `@LambdaController` and decorate the handler with `@LambdaHandler`

```ts
@LambdaController()
class MyController {
  @LambdaHandler()
  myHandler(event: AHAwsEvent): any {
    return null;
  }
}
```

Lambda controllers and handlers follow the same rules as the REST ones.
However, the way in which requests are processed is much simpler since there is way less possible configuration and no middleware execution system

Lambda handlers have to respect this signature:

```ts
lambdaHandlerMethod(
  event: AHAwsEvent,
  context?: AHAwsContext,
  callback?: AHAwsCallback,
): Promise<any> | any;
```

## Middlewares
### Use existing ones
### Create your own
## Cache
## Logger
## Time tracker
