import { HttpResponseBody } from "../models/http-response-body";

export class HttpResponse {
  statusCode: number;
  headers: { [key: string]: any };
  body: HttpResponseBody | any;

  constructor(statusCode: number, body?: HttpResponseBody | any, headers?: { [key: string]: any }) {
    this.headers = { ...headers };

    if (
      !Object.keys(this.headers)
        .map((k) => k.toLocaleLowerCase())
        .includes("content-type")
    ) {
      this.headers["Content-Type"] = "application/json";
    }

    if (this.headers["Content-Type"] === "application/json") {
      this.body = JSON.stringify(body);
    } else {
      this.body = body;
    }

    this.statusCode = statusCode;
  }

  /**
   * Return an http response
   * @param statusCode the http response status code
   * @param body the http response body
   * @param headers the http response headers
   * @returns an http response
   */
  static response(
    statusCode: number,
    body: HttpResponseBody | any,
    headers?: { [key: string]: any },
  ): HttpResponse {
    return new HttpResponse(statusCode, body, headers);
  }

  /**
   * Return a success (status code 200) http response
   * @param body the http response body
   * @param headers the http response headers
   * @returns a success http response
   */
  static success(body: HttpResponseBody | any, headers?: { [key: string]: any }): HttpResponse {
    return new HttpResponse(200, body, headers);
  }

  /**
   * Return an error (status code 400) http response
   * @param body the http response body
   * @param headers the http response headers
   * @returns an error http response
   */
  static error(body: HttpResponseBody | any, headers?: { [key: string]: any }): HttpResponse {
    return new HttpResponse(400, body, headers);
  }

  /**
   * Return a forbidden (status code 403) http response
   * @param body the http response body
   * @param headers the http response headers
   * @returns a forbidden http response
   */
  static forbidden(body: HttpResponseBody | any, headers?: { [key: string]: any }): HttpResponse {
    return new HttpResponse(403, body, headers);
  }

  /**
   * Return a noçt found (status code 404) http response
   * @param body the http response body
   * @param headers the http response headers
   * @returns a not found http response
   */
  static notFound(body: HttpResponseBody | any, headers?: { [key: string]: any }): HttpResponse {
    return new HttpResponse(404, body, headers);
  }

  /**
   * Return a failure (status code 500) http response
   * @param body the http response body
   * @param headers the http response headers
   * @returns a failure http response
   */
  static failure(body: HttpResponseBody | any, headers?: { [key: string]: any }): HttpResponse {
    return new HttpResponse(500, body, headers);
  }
}
