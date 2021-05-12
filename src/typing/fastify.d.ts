import { FastifyLoggerInstance } from 'fastify/types/logger';
import { RouteGenericInterface } from 'fastify/types/route';
import {
  RawServerBase,
  RawServerDefault,
  RawRequestDefaultExpression,
} from 'fastify/types/utils';

declare module 'fastify' {
  interface FastifyRequest<
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<
      RawServer
    > = RawRequestDefaultExpression<RawServer>
  > {
    id: any;
    params: RouteGeneric['Params'];
    raw: RawRequest;
    query: RouteGeneric['Querystring'];
    readonly headers: RawRequest['headers'] & RouteGeneric['Headers']; // this enables the developer to extend the existing http(s|2) headers list
    log: FastifyLoggerInstance;
    body: RouteGeneric['Body'];
    readonly ip: string;
    readonly ips?: string[];
    readonly hostname: string;
    readonly url: string;
    readonly method: string;
    readonly connection: RawRequest['socket'];
    identity: CommonIdentity;
  }
}
