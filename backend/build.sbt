ThisBuild / scalaVersion := "3.3.3"
ThisBuild / organization := "com.example"
ThisBuild / version := "0.1.0-SNAPSHOT"

lazy val root = (project in file("."))
  .settings(
    name := "backend-sample",
    libraryDependencies ++= Seq(
      "org.typelevel" %% "cats-effect" % "3.5.4",
      "org.http4s" %% "http4s-dsl" % "0.23.27",
      "org.http4s" %% "http4s-ember-server" % "0.23.27",
      "org.http4s" %% "http4s-ember-client" % "0.23.27",
      "org.http4s" %% "http4s-circe" % "0.23.27",
      "io.circe" %% "circe-generic" % "0.14.9",
      "io.circe" %% "circe-parser" % "0.14.9",
      "com.zaxxer" % "HikariCP" % "5.1.0",
      "org.postgresql" % "postgresql" % "42.7.4",
      "org.typelevel" %% "log4cats-slf4j" % "2.7.0",
      "org.slf4j" % "slf4j-simple" % "2.0.13",
      "org.scalatest" %% "scalatest" % "3.2.19" % Test
    ),
    Test / testOptions += Tests.Argument(TestFrameworks.ScalaTest, "-oD"),
    scalacOptions ++= Seq("-Xmax-inlines", "128"),
    // Run the backend in a forked JVM so the dev server stays stable under sbt on Windows.
    Compile / run / fork := true,
    Compile / run / mainClass := Some("Main"),
    assembly / mainClass := Some("Main"),
    assembly / assemblyJarName := "backend.jar",
    assembly / assemblyMergeStrategy := {
      case PathList("module-info.class")                            => MergeStrategy.discard
      case PathList("META-INF", "versions", _, "module-info.class") => MergeStrategy.discard
      case x =>
        val oldStrategy = (assembly / assemblyMergeStrategy).value
        oldStrategy(x)
    }
  )
