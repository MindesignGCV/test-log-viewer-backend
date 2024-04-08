import { Context, Layer, Effect, LogLevel, pipe } from "effect";
import BaseFastify, { FastifyInstance } from "fastify";
import { AppConfig } from "./config";

export class Fastify extends Context.Tag("fastify")<
  Fastify,
  FastifyInstance
>() {}

export const FastifyLive = Layer.suspend(() =>
  Layer.effect(
    Fastify,
    Effect.gen(function* (_) {
      const { logLevel } = yield* _(AppConfig);

      const fastify = yield* _(
        Effect.tryPromise(() =>
          BaseFastify({
            logger: pipe(logLevel, LogLevel.lessThan(LogLevel.Error)),
            pluginTimeout: 0,
          }),
        ),
      );

      return Fastify.of(fastify);
    }),
  ),
);

export const ServerLive = Layer.scopedDiscard(
  Effect.gen(function* (_) {
    const fastify = yield* _(Fastify);

    yield* _(
      Effect.addFinalizer((_exit) =>
        Effect.gen(function* (_) {
          yield* _(
            Effect.promise(async () => {
              await fastify.close();
            }),
          );

          yield* _(Effect.logInfo("Closing fastify."));
        }),
      ),
    );

    yield* _(
      Effect.tryPromise((signal) =>
        fastify.listen({
          port: 4000,
          host: "0.0.0.0",
          signal,
        }),
      ),
    );
  }),
);
