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
const models = moduleFiles.keys().reduce((model: any[], modelPath) => {
  const value = moduleFiles(modelPath)
  const [entity] = Object.values(value).filter((v) => typeof v === 'function' && v.toString().slice(0, 5) === 'class')
  // 如果是默认导出的情况,则是 [...model, value.default]
  return [...model, entity]
}, [])

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`, '.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        APP_PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_HOST: Joi.string().default('127.0.0.1'),
        REDIS_USERNAME: Joi.string().default('root'),
        REDIS_PWD: Joi.string().required(),
        MYSQL_URL: Joi.string().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().default(3306),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PWD: Joi.string().required(),
        MYSQL_DBNAME: Joi.string().required(),
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          config: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
            username: config.get('REDIS_USERNAME'),
            password: config.get('REDIS_PWD'),
          },
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const MYSQL_URL = config.get('MYSQL_URL')
        const typeormCofnig = MYSQL_URL
          ? { url: MYSQL_URL }
          : {
              host: config.get('MYSQL_HOST'),
              port: config.get('MYSQL_PORT'),
              username: config.get('MYSQL_USER'),
              password: config.get('MYSQL_PWD'),
              database: config.get('MYSQL_DBNAME'),
            }
        return {
          type: 'mysql',
          ...typeormCofnig,
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
