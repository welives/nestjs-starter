import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_API, UserRequest } from '@libs/common'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @InjectRedis() private readonly redis: Redis
  ) {
    super()
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 如果是公共开放接口,则直接放行
    if (this.reflector.get(IS_PUBLIC_API, context.getHandler())) return true
    await super.canActivate(context) // 执行父类中的JWT校验
    try {
      let token = context.switchToRpc().getData().headers.authorization
      token = token.split(' ')[1]
      const { user } = context.switchToHttp().getRequest<UserRequest>()
      // 去获取缓存里的 token
      const cacheToken = await this.redis.get(`uid:${user.id}`)
      if (!cacheToken) {
        throw new UnauthorizedException('非法请求，请先登录！')
      } else if (cacheToken !== token) {
        throw new UnauthorizedException('您的账号已在其他地方登录，请重新登录！')
      }
      return true
    } catch (error) {
      throw new UnauthorizedException('用户信息解析失败，请重新登录！')
    }
  }
}
