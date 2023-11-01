import { HttpException, HttpStatus } from '@nestjs/common'

export class AppException extends HttpException {
  /**
   * @param msg 业务消息
   * @param code 业务码
   */
  constructor(msg = '', code = 'E0001') {
    super({ code, message: msg, success: false }, HttpStatus.OK)
  }
}
