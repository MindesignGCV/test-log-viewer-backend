import { Effect, Layer } from "effect";
import { Fastify } from "./fastify";
import { AppReply, mkHandler } from "./mk-handler";
import * as fs from "node:fs";
import { AppConfig } from "./config";

export const IndexRouteLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    const fastify = yield* _(Fastify);
    const runtime = yield* _(Effect.runtime<AppConfig>());

    fastify.get(
      "/",
      {
        schema: {
          response: {
            200: {
              content: {
                "text/html": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
      Effect.gen(function* (_) {
        const reply = yield* _(AppReply);

        reply.type("text/html");

        return fs.createReadStream(`${__dirname}/../index.html`);
      }).pipe(mkHandler(runtime)),
    );
  }),
);
