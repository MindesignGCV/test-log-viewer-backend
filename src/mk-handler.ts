import { Context, Effect, Runtime } from "effect";
import { FastifyReply, FastifyRequest } from "fastify";

export class AppRequest extends Context.Tag("fastify.request")<
  AppRequest,
  FastifyRequest
>() {}
export class AppReply extends Context.Tag("fastify.reply")<
  AppReply,
  FastifyReply
>() {}

export const mkHandler =
  <R, E, A>(runtime: Runtime.Runtime<R>) =>
  (handler: Effect.Effect<A, E, R | AppRequest | AppReply>) =>
  (request: FastifyRequest, reply: FastifyReply) =>
    handler.pipe(
      Effect.provideService(AppRequest, AppRequest.of(request)),
      Effect.provideService(AppReply, AppReply.of(reply)),
      Runtime.runPromise(runtime),
    );
