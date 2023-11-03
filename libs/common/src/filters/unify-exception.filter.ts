import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common'
import { Request, Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import dayjs from 'dayjs'
import chalk from 'chalk'
import Utils from '../utils'

@Catch()
export class UnifyExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const data = {
      success: false,
      code: void 0,
      message: status >= 500 ? 'Server Error' : 'Client Error',
      url: request.url,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    if (exception instanceof HttpException) {
      const res: any = exception.getResponse()
      if (Object.prototype.toString.call(res) === '[object Object]') {
        res.message && (data.message = res.message)
        res.code && (data.code = res.code)
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
${chalk.red('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
Url: ${request.url}
Method: ${request.method}
Authorization: ${request.headers.authorization}
IP: ${request.ip}
StatusCode: ${status}
Message: ${data.message}
${chalk.red('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}`)
    }
    this.logger.error('exception', {
      status,
      request: Utils.getReqForLogger(request),
    })
    response.status(status).json(data)
  }
}
