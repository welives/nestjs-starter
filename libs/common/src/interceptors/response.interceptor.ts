import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { Request } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import Utils from '../utils'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>()
    return next.handle().pipe(
      map((data) => {
        this.logger.info('response', { data, request: Utils.getReqForLogger(req) })
        return { code: '200', message: 'ok', success: true, data }
      })
    )
  }
}
