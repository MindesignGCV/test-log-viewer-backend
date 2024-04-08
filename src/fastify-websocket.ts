import FastifyWebsocketPlugin from "@fastify/websocket";
import { Effect, Layer, LogLevel } from "effect";
import { Fastify } from "./fastify";
import { AppConfig } from "./config";

const LogLevels = {
  [LogLevel.All._tag]: "trace",
  [LogLevel.Debug._tag]: "debug",
  [LogLevel.Trace._tag]: "trace",
  [LogLevel.Info._tag]: "info",
  [LogLevel.Error._tag]: "error",
  [LogLevel.Fatal._tag]: "fatal",
  [LogLevel.Warning._tag]: "warn",
  [LogLevel.None._tag]: "silent",
} as const;

export const FastifyWebsocketLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    const config = yield* _(AppConfig);
    const fastify = yield* _(Fastify);

    yield* _(
      Effect.tryPromise(
        async () =>
          await fastify.register(FastifyWebsocketPlugin, {
            logLevel: LogLevels[config.logLevel._tag],
          }),
      ),
    );
  }),
);
