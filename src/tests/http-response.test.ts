import { AHHttpResponseBodyStatusEnum } from "../framework/models/enums/http-response-body-status-enum";
import { AHHttpResponse } from "../framework/models/http/http-response";


describe('AHHttpResponse', () => {
  test('constructor', () => {
    const response = new AHHttpResponse(200, {});
    expect(response).toBeInstanceOf(AHHttpResponse);
  });

  test('response', () => {
    const response = new AHHttpResponse(250, { status: AHHttpResponseBodyStatusEnum.Success });
    expect(response.statusCode).toBe(250);
    expect(response.body).toBe(JSON.stringify({ status: AHHttpResponseBodyStatusEnum.Success }));
  });

  test('success', () => {
    const response = AHHttpResponse.success({});
    expect(response.statusCode).toBe(200);
  });

  test('error', () => {
    const response = AHHttpResponse.error({});
    expect(response.statusCode).toBe(400);
  });

  test('failure', () => {
    const response = AHHttpResponse.failure({});
    expect(response.statusCode).toBe(500);
  });

  test('forbidden', () => {
    const response = AHHttpResponse.forbidden({});
    expect(response.statusCode).toBe(403);
  });

  test('headers', () => {
    const response = AHHttpResponse.response(
      200,
      { payload: '<p>html paragraphe<p>' },
      { 'Content-Type': 'text/html' },
    );
    expect(Object.keys(response.headers).includes('Content-Type')).toBeTruthy();
    expect(response.headers['Content-Type']).toBe('text/html');
    expect(response.body).toStrictEqual({ payload: '<p>html paragraphe<p>' });
  });
});
