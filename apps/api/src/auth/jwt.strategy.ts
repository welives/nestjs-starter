import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 解析header头中的Bearer token
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  /** 校验JWT, 校验通过后会把解析出来的 payload 挂载到 request.user 上 */
  async validate(payload: any) {
    console.log('Step 4: 校验JWT, 被守卫调用')
    const { iat, exp, ...rest } = payload
    return rest
  }
}
