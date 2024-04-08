import FastifySwaggerPlugin from "@fastify/swagger";
import FastifySwaggerUIPlugin from "@fastify/swagger-ui";
import { Effect, Layer } from "effect";
import { Fastify } from "./fastify";

export const FastifySwaggerLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    const fastify = yield* _(Fastify);

    yield* _(
      Effect.tryPromise(
        async () =>
          await fastify.register(FastifySwaggerPlugin, {
            openapi: {
              info: {
                title: "test-log-viewer",
                description: "test-log-viewer",
                version: "1.0.0",
              },
            },
          }),
      ),
    );

    yield* _(
      Effect.tryPromise(
        async () =>
          await fastify.register(FastifySwaggerUIPlugin, {
            routePrefix: "/docs",
          }),
      ),
    );
  }),
);
