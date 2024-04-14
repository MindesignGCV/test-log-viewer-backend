import {
  Config,
  Context,
  Effect,
  Layer,
  LogLevel,
  ReadonlyArray,
  ReadonlyRecord,
  String,
  pipe,
} from "effect";

import * as S from "@effect/schema/Schema";

export enum AppEnv {
  live = "live",
  dev = "dev",
  staging = "staging",
}

export class AppConfig extends Context.Tag("app.config")<
  AppConfig,
  {
    readonly env: AppEnv;
    readonly logLevel: LogLevel.LogLevel;
    readonly buildLogFile: string;
    readonly corsOriginHostnames: readonly string[];
  }
>() {}

export const AppConfigLive = Layer.suspend(() =>
  Layer.effect(
    AppConfig,
    Effect.gen(function* (_) {
      const possibleEnvList = pipe(
        AppEnv,
        ReadonlyRecord.values,
        ReadonlyArray.join(", "),
      );

      const env = yield* _(
        Config.string("APP_ENV"),
        Config.withDefault(AppEnv.dev),
        Config.withDescription(
          `Application environment, possible values are: ${possibleEnvList}.`,
        ),
        Effect.flatMap(S.decodeUnknown(S.enums(AppEnv))),
      );

      const possibleLogList = pipe(
        LogLevel.allLevels,
        ReadonlyArray.map(({ _tag }) => _tag),
        ReadonlyArray.join(", "),
      );

      const logLevelLiteral = yield* _(
        Config.string("APP_LOG_LEVEL"),
        Config.withDefault(LogLevel.Debug._tag),
        Config.withDescription(
          `Log level, possible values are: ${possibleLogList}.`,
        ),
        Effect.flatMap(
          S.decodeUnknown(
            S.union(
              ...pipe(
                LogLevel.allLevels,
                ReadonlyArray.map(({ _tag }) => S.literal(_tag)),
              ),
            ),
          ),
        ),
      );

      const buildLogFile = yield* _(
        Config.string("APP_BUILD_LOG_FILE"),
        Config.withDefault(`${__dirname}/../build.log`),
      );

      const corsOriginHostnames = yield* _(
        Config.string("APP_CORS_ORIGIN_HOSTNAMES"),
        Config.withDefault("localhost,test-log-viewer.stg.onepunch.agency"),
      );

      return AppConfig.of({
        env,
        logLevel: LogLevel.fromLiteral(logLevelLiteral),
        buildLogFile,
        corsOriginHostnames: pipe(corsOriginHostnames, String.split(",")),
      });
    }),
  ),
);
