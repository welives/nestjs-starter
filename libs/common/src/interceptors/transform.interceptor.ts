import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { Request } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import chalk from 'chalk'
import Utils from '../utils'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>()
    const now = Date.now()
    return next.handle().pipe(
      map((data) => {
        if (process.env.NODE_ENV !== 'production' && !req.url.includes('swagger')) {
          console.log(`
${chalk.green('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
Url: ${req.url}
Method: ${req.method}
Authorization: ${req.headers.authorization}
IP: ${req.ip}
Response: ${JSON.stringify(data)}
Memo: 本次请求处理耗时 ${Date.now() - now}ms
${chalk.green('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}`)
        }
        this.logger.info('response', { data, request: Utils.getReqForLogger(req) })
        return { code: '200', message: 'ok', success: true, data }
      })
    )
  }
}
