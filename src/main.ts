import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  FastifyAdapter,
  NestFastifyApplication
} from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import { ConfigService } from "@nestjs/config";

let port = 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe());
  const config = app.get(ConfigService);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  if (process.env.NODE_ENV === "development") {
    const config = new DocumentBuilder()
      .setTitle("Oooi API")
      .setDescription("API documentation")
      .setVersion("1.0")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
  }

  await app.register(fastifyCookie, {
    secret: config.get("COOKIE_SECRET")
  });

  port = config.get<number>("PORT") || port;

  await app.listen(port);
}

bootstrap().then(() => {
  console.log(`[Server] Listening on port: ${port}`);
});
