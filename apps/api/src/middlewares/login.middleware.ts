import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { validate } from 'class-validator'
import { LoginDTO } from '../auth/dto/auth.dto'

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const body = req.body
    if (Object.keys(body).length !== 0) {
      const loginDto = new LoginDTO()
      Object.keys(body).forEach((key) => {
        loginDto[key] = body[key]
      })
      const errors = await validate(loginDto)
      if (errors.length > 0) {
        const msg = Object.values(errors[0].constraints)[0] // 只取第一个错误信息即可
        throw new BadRequestException(msg)
      }
    }
    next()
  }
}
