import { Effect, Layer, Runtime, Stream } from "effect";
import { Fastify } from "./fastify";
import { StreamBuildLog } from "./stream-build-log";
import { AppConfig } from "./config";

export const ViewLogWSRouteLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    const fastify = yield* _(Fastify);
    const runtime = yield* _(Effect.runtime<AppConfig>());

    fastify.get("/view-log-ws", { websocket: true }, (socket, _request) => {
      socket.on("message", (msg) =>
        Effect.gen(function* (_) {
          if (msg.toString() === "ping") {
            return;
          }

          const buildLog = yield* _(StreamBuildLog);

          yield* _(
            buildLog,
            Stream.runForEach((line) =>
              Effect.gen(function* (_) {
                socket.send(line);
              }),
            ),
          );

          socket.close();
        }).pipe(Runtime.runPromise(runtime)),
      );
    });
  }),
);
