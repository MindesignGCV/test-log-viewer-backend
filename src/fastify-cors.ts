import FastifyCorsPlugin from "@fastify/cors";
import { Effect, Layer } from "effect";
import { Fastify } from "./fastify";
import { AppConfig } from "./config";

export const FastifyCorsLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    const config = yield* _(AppConfig);
    const fastify = yield* _(Fastify);

    yield* _(
      Effect.tryPromise(
        async () =>
          await fastify.register(FastifyCorsPlugin, {
            origin: (origin, cb) => {
              if (!origin) {
                cb(null, true);
                return;
              }

              const url = new URL(origin);
              if (config.corsOriginHostnames.includes(url.hostname)) {
                cb(null, true);
                return;
              }
              cb(new Error("Not allowed"), false);
            },
          }),
      ),
    );
  }),
);
