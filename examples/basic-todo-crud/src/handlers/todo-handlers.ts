import { AHAwsEvent, AHHttpResponse, AHRestHandler, AHRestMethodEnum } from "@antl4b/anthill-framework";

export class AHTodoHandlers {

  static listTodo = new AHRestHandler({
    name: 'listTodo',
    method: AHRestMethodEnum.Get,
    callable: async (event: AHAwsEvent): Promise<AHHttpResponse> => AHHttpResponse.success([]),
  });
}