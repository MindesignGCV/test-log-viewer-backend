import { Effect, Layer } from "effect";
import { Fastify } from "./fastify";
import { AppReply, mkHandler } from "./mk-handler";
import { NodeStream } from "@effect/platform-node";
import { StreamBuildLog } from "./stream-build-log";
import { AppConfig } from "./config";

export const ViewLogRouteLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    const fastify = yield* _(Fastify);
    const runtime = yield* _(Effect.runtime<AppConfig>());

    fastify.get(
      "/view-log",
      {
        schema: {
          response: {
            200: {
              content: {
                "text/plain": {
                  schema: {
                    type: "string",
                    format: "byte",
                  },
                },
              },
            },
          },
        },
      },
      Effect.gen(function* (_) {
        const reply = yield* _(AppReply);

        reply.type("text/plain");
        reply.header("Content-Disposition", 'attachment; filename="build.log"');

        const buildLog = yield* _(StreamBuildLog);

        return yield* _(buildLog, NodeStream.toReadable);
      }).pipe(mkHandler(runtime)),
    );
  }),
);
