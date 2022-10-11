import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const port = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe());

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

  app.use(cookieParser());
  await app.listen(port);
}

bootstrap().then(() => {
  console.log(`[Server] Listening on port: ${port}`);
});
