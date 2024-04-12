import { Effect, Function, Stream, pipe } from "effect";
import * as fs from "node:fs";
import { AppConfig } from "./config";
import { NodeStream } from "@effect/platform-node";

export const StreamBuildLog = Effect.gen(function* (_) {
  const config = yield* _(AppConfig);
  const stream = pipe(
    NodeStream.fromReadable<unknown, string>(
      () =>
        fs.createReadStream(config.buildLogFile, {
          highWaterMark: 1024 * 1024, // 1mb
          encoding: "utf-8",
        }),
      Function.identity,
    ),
    Stream.splitLines,
  );

  return pipe(
    stream,
    Stream.throttle({
      cost: () => 1,
      duration: "2 second",
      units: 1,
    }),
  );
});
