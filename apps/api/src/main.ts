import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
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
  await app.listen(process.env.APP_PORT)
}
bootstrap()
