import { Chunk, Effect, Function, Schedule, Stream, pipe } from "effect";
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

  const totalLines = yield* _(stream, Stream.runCount);

  const firstPartSize = Math.max(totalLines - 60 * 5, 0);

  return pipe(
    stream,
    Stream.take(firstPartSize),
    Stream.grouped(1000),
    Stream.map((chunk) => pipe(chunk, Chunk.join("\n"))),
    Stream.schedule(Schedule.spaced("10 milli")),
    Stream.concat(
      pipe(
        stream,
        Stream.takeRight(totalLines - firstPartSize),
        Stream.grouped(5),
        Stream.map((chunk) => pipe(chunk, Chunk.join("\n"))),
        Stream.schedule(Schedule.spaced("1 second")),
      ),
    ),
    Stream.map((line) => line + "\n"),
  );
});
