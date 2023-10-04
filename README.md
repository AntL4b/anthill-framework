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

## Table of contents

- [Quick start](#quick-start)
- [Installation](#installation)
- [Request lifecycle](#request-lifecycle)
- [Anthill](#anthill)
- [Configuration](#configuration)
- [Routing](#routing)
- [Controllers & Handlers](#controllers--handlers)
  - [REST](#rest)
  - [Lambda](#lambda)
- [Middlewares](#middlewares)
  - [Use existing ones](#use-existing-ones)
  - [Create your own](#create-your-own)
- [Samples](#samples)
- [Cache](#cache)
- [Logger](#logger)
- [Time tracker](#time-tracker)

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

Anthill Framework uses a configuration inheritance system allowing to apply common logics within your app, controller or handler scope.

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

Ex: The following code will enable caching and require that an `Authorization` header is provided for each of the controller handlers.
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

Controllers are groups of handlers defining a scope in which some common configuration is applied.
Registering a controller to Anthill with `configure()` (see [Anthill](#anthill)), makes its handlers exposeable by the Anthill `exposeHandlers()` method.

Handlers are methods that can be either instance or static methods. They are the main entry points for the code implementation

![image](https://github.com/AntL4b/anthill-framework/blob/main/docs/images/controllers-handlers.drawio.png?raw=true)

To create controllers and handlers, Anthill Framework uses classes and decorators.
Two types of controllers and handlers are available: `@RestController` and `@LambdaController` going in pair with `@RestHandler` and `@LambdaHandler`

> [!WARNING]
> All handlers within the app MUST have different names.
> By default, the handler registration system will use the handler method name but there's a possibility this name won't be unique.
> Ex: MyController1.list() and MyController2.list() won't work.

If two handlers located in two controllers have the same name, you will have to declare an alternative name for at least one handler.
The `name` property of the configuration object of `@RestHandler` and `@LambdaHandler` decorators is made for that purpose.

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

Middlewares are classes that extend `AHMiddleware` containing methods executed before and after the handler is called (or the cache is retrieved).

The `runBefore()` method executed before calling the handler has the capability of:
- Executing any code
- Making changes to the incoming request event
- End the request lifecycle by returning an `AHHttpResponse`

Its signature is as follow:

```ts
type RunBeforeReturnType = AHAwsEvent | AHHttpResponse;
runBefore(event: AHAwsEvent, context: AHAwsContext): Promise<RunBeforeReturnType> | RunBeforeReturnType;
```

It must return the event even if not altering it or an `AHHttpReponse` to end the request lifecycle.

The `runAfter()` method executed after a response has been emitted (either by the handler, the cache or a middleware `runBefore()`) has the capability of:
- Executing any code
- Making changes to the request response

Its signature is as follow:

```ts
runAfter(httpResponse: AHHttpResponse, event: AHAwsEvent, context: AHAwsContext): Promise<AHHttpResponse> | AHHttpResponse
```

It must return the httpResponse even if not altering it.

Both `runBefore()` and the `runAfter()` methods can be overridden when extending `AHMiddleware`.

> [!IMPORTANT]  
> Middleware execution order is something to take into consideration.

Let's take the example of 3 middlewares m1, m2 and m3 having all a `runBefore()` and a `runAfter()` implementation.
The nominal scenario is this one:

![image](https://github.com/AntL4b/anthill-framework/blob/main/docs/images/middleware-scenario-1.drawio.png?raw=true)

`runBefore()` and `runAfter()` are called as a mirror around the handler.

> [!WARNING]
> In case a middleware `runBefore()` returns an `AHHttpResponse`, all following middlewares `runBefore()` won't be called and only those
> that have already been called will see their `runAfter()` method called.

In the previous example of m1, m2 and m3, if m2 `runBefore()` returns an `AHHttpReponse`

The scenario will be this one: 

![image](https://github.com/AntL4b/anthill-framework/blob/main/docs/images/middleware-scenario-2.drawio.png?raw=true)

### Use existing ones

Some middlewares have already been developed and are included in Anthill Framework to cover most frequent needs such as dealing with CORS or parsing JSON body.
Browse [middleware](https://github.com/AntL4b/anthill-framework/tree/main/packages/framework/features/middleware/impl) folder for more details.

The middleware list is likely to grow over time. Don't hesitate to request or to create a pull request if you want to contribute.

### Create your own

As told at the beginning of the [middlewares](#middlewares) section, middlewares are classes that extend `AHMiddleware` class.

Let's imagine a ticketing service that opens on October 10, 2023 at 8 p.m. the and which rejects all incoming requests before this time.

```ts
import {
  AHAwsContext,
  AHAwsEvent,
  AHHttpResponse,
  AHHttpResponseBodyStatusEnum,
  AHMiddleware,
  RunBeforeReturnType
} from "@antl4b/anthill-framework";

export class BlockBeforeDateMiddleware extends AHMiddleware<Date> {

  // Declare payload as a date, it will store the time before which we block the request
  constructor(payload: Date) {
    super(payload);
  }

  override runBefore(event: AHAwsEvent, context?: AHAwsContext): RunBeforeReturnType {
    // If current date is less than the middleware payload (the time before which we block the request)
    if ((new Date()) < this.payload) {

      // Return an HttpResponse with an error
      return AHHttpResponse.error({
        status: AHHttpResponseBodyStatusEnum.Error,
        message: "Not opened yet, retry later"
      });
    }

    // Otherwise, forward the event
    return event;
  }
}
```

Now to use it in a handler, instantiate the middleware inside the `@RestHandler` decorator:

```ts
@RestController()
export class TicketingController {

  @RestHandler({
    method: AHRestMethodEnum.Post,
    middlewares: [
      new BlockBeforeTimeMiddleware(
        new Date("2023-10-10 20:00:00") // Init the middleware with the time before which we block incoming requests
      ),
    ],
  })
  buyTicket(event: AHAwsEvent): AHHttpResponse {

    // Do stuff to buy a ticket

    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success,
      payload: { /* the ticket */ },
    });
  }
}
```

## Samples

Sample projects have been developed to serve as a source of working examples.
Browse [samples](https://github.com/AntL4b/anthill-framework/tree/main/samples) folder for more details.

## Cache
## Logger
## Time tracker
