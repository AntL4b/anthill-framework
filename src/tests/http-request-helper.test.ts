import { AHHttpRequestHelper } from "../framework/helpers/http-request-helper";
import { AHAwsEvent } from "../framework/models/aws/event/aws-event";
import { AHRestMethodEnum } from "../framework/models/enums/rest-method-enum";

const BASE_EVENT: AHAwsEvent = new AHAwsEvent();

Object.assign(BASE_EVENT, {
  ressource: '',
  path: '/',
  httpMethod: AHRestMethodEnum.Post,
  headers: {},
  requestContext: {
    ressourceId: '',
    resourcePath: '',
    httpMethod: AHRestMethodEnum.Post,
    requestTime: '',
    path: '',
    accountId: '',
    protocol: '',
    domainPrefix: '',
    domainName: '',
    apiId: '',
    identity: {
      sourceIp: '',
      userAgent: '',
    },
  },
});

describe('AHHttpRequestHelper', () => {
  test('addBaseHttpRequest', () => {
    const event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));
    expect(
      JSON.stringify(AHHttpRequestHelper.addBaseHttpRequest({}, event))
    ).toBe(
      JSON.stringify({ pager: { page :null, pageSize: null } })
    );

    event.queryStringParameters = { page: "1", pageSize: "5" };

    expect(
      JSON.stringify(AHHttpRequestHelper.addBaseHttpRequest({}, event))
    ).toBe(
      JSON.stringify({ pager: { page :1, pageSize: 5 } })
    );
  });

  test('getHeaderValue', () => {
    const event: AHAwsEvent = Object.assign(new AHAwsEvent(), JSON.parse(JSON.stringify(BASE_EVENT)));
    event.headers = { "test-header": "test" };

    expect(AHHttpRequestHelper.getHeaderValue("test-header", event)).toBe("test");

    event.headers = null;

    expect(AHHttpRequestHelper.getHeaderValue("test-header", event)).toBe(null);
  });
});
