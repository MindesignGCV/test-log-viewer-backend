import { Effect, Layer } from "effect";
import { FastifyLive, ServerLive } from "./fastify";
import { AppConfigLive } from "./config";
import { FastifySwaggerLive } from "./fastify-swagger";
import { ViewLogRouteLive } from "./view-log";
import { IndexRouteLive } from "./index";
import { FastifyWebsocketLive } from "./fastify-websocket";
import { ViewLogWSRouteLive } from "./view-log-ws";

const MainLive = ServerLive.pipe(
  Layer.provide(
    Layer.mergeAll(IndexRouteLive, ViewLogRouteLive, ViewLogWSRouteLive),
  ),
  Layer.provide(FastifySwaggerLive),
  Layer.provide(FastifyWebsocketLive),
  Layer.provideMerge(FastifyLive),
  Layer.provideMerge(AppConfigLive),
);

Effect.runPromise(Layer.launch(MainLive));
