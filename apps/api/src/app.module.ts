import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Joi from 'joi'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import winston from 'winston'
import { WinstonModule } from 'nest-winston'
import 'winston-daily-rotate-file'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerMiddleware, MaintMiddleware, TransformInterceptor, UnifyExceptionFilter } from '@libs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { AuthModule } from './auth/auth.module'

// @ts-ignore
const moduleFiles = require.context('./models', true, /\.(ts|js)$/)
const models = moduleFiles.keys().reduce((model: any[], modelPath: string) => {
  const value = moduleFiles(modelPath)
  // 单个导出时
  // const [entity] = Object.values(value).filter((v) => typeof v === 'function' && v.toString().slice(0, 5) === 'class')
  // 默认导出时
  return [...model, value.default]
}, [])
const envFilePath =
  process.env.NODE_ENV === 'production'
    ? ['.env.production.local', '.env.production']
    : [`.env.${process.env.NODE_ENV}.local`, '.env.local', '.env']
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        APP_PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_HOST: Joi.string().default('127.0.0.1'),
        REDIS_USER: Joi.string().default('root'),
        REDIS_PWD: Joi.string().required(),
        MONGODB_URL: Joi.string().required(),
        MONGODB_HOST: Joi.string().required(),
        MONGODB_PORT: Joi.number().default(27017),
        MONGODB_USER: Joi.string().default('root'),
        MONGODB_PWD: Joi.string().required(),
        MONGODB_DBNAME: Joi.string().required(),
        CHARSET: Joi.string().default('utf8'),
        TIMEZONE: Joi.string().default('Asia/Shanghai'),
      }),
    }),
    WinstonModule.forRoot({
      exitOnError: false, // 出现 uncaughtException 时是否 process.exit
      transports: [
        new winston.transports.DailyRotateFile({
          silent: process.env.NODE_ENV !== 'production',
          dirname: 'logs/api', // 日志保存的目录
          filename: '%DATE%.log', // 日志名称，占位符 %DATE% 取值为 datePattern 值
          datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天
          zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件
          maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb
          maxFiles: '14d', // 保留日志文件的最大天数，此处表示自动删除超过 14 天的日志文件
          // 记录时添加时间戳信息
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
          ),
        }),
      ],
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          config: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
            username: config.get('REDIS_USER'),
            password: config.get('REDIS_PWD'),
          },
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const MONGODB_URL = config.get('MONGODB_URL')
        const typeormCofnig = MONGODB_URL
          ? { url: MONGODB_URL }
          : {
              host: config.get('MONGODB_HOST'),
              port: config.get('MONGODB_PORT'),
              username: config.get('MONGODB_USER'),
              password: config.get('MONGODB_PWD'),
              database: config.get('MONGODB_DBNAME'),
            }
        return {
          type: 'mongodb',
          ...typeormCofnig,
          // 搞不懂这种方式为什么不生效, 无奈改用动态导入模块的方式
          // entities: [__dirname + '/**/*.entity.{ts,js}'],
          entities: models,
          charset: config.get('CHARSET'),
          synchronize: config.get('NODE_ENV') !== 'production' ? false : true,
          autoLoadEntities: true,
        }
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: UnifyExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MaintMiddleware, LoggerMiddleware)
      .exclude({ path: 'swagger/(.*)', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
