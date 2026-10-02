package system.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.Json
import system.api.{ConnectionApiMessageSchema, PlainApiMessageSchema}

final case class RegisteredPlan(
  name: String,
  execute: Json => IO[Json]
)

object RegisteredPlan:

  def plainMessage[Input, Output](schema: PlainApiMessageSchema[Input, Output]): RegisteredPlan =
    RegisteredPlan(
      name = schema.name,
      execute = payload =>
        IO.fromEither(
          payload.as[Input](using schema.inputDecoder).left.map(error =>
            new IllegalArgumentException(s"Invalid JSON for ${schema.name}: ${error.getMessage}")
          )
        ).flatMap(input => schema.execute(input).map(schema.outputEncoder.apply))
    )

  def withConnectionMessage[Input, Output](schema: ConnectionApiMessageSchema[Input, Output]): RegisteredPlan =
    RegisteredPlan(
      name = schema.name,
      execute = payload =>
        IO.fromEither(
          payload.as[Input](using schema.inputDecoder).left.map(error =>
            new IllegalArgumentException(s"Invalid JSON for ${schema.name}: ${error.getMessage}")
          )
        ).flatMap(input =>
          DatabaseSession.withTransactionConnection(connection =>
            schema.execute(input, connection)
          ).map(schema.outputEncoder.apply)
        )
    )

object PlannerRegistry:

  val planners: Map[String, RegisteredPlan] = PlannerDefinitions.planners
