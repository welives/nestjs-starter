import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }
  /** 校验登录信息, 校验通过后会把返回值挂载到 request.user 上 */
  async validate(username: string, password: string): Promise<any> {
    console.log('Step 1: local策略登录校验')
    const res = await this.authService.validateUser({ username, password })
    switch (res.type) {
      case 'NORMAL':
        return res.result
      case 'INCORRECT':
        throw new UnauthorizedException(res.message)
      case 'FORBIDDEN':
        throw new ForbiddenException(res.message)
      default:
        throw new NotFoundException(res.message)
    }
  }
}
