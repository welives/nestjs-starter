import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Utils } from '@libs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  BigInt.prototype['toJSON'] = function () {
    return Number(this.toString())
  }
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 白名单模式，建议设置，否则不存在于 dto 对象中的键值也会被使用
      transform: true,
    })
  )
  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('NestJS-Starter')
      .setDescription('一个NestJS + TypeScript + PM2 + ESLint + Prettier 的基础项目')
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('swagger', app, document)
  }
  await app.listen(process.env.APP_PORT, () => {
    Utils.environmentsOutput()
  })
}
bootstrap()
