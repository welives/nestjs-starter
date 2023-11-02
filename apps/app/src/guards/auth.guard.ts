import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { IS_PUBLIC_API, UserRequest } from '@libs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRedis() private readonly redis: Redis
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 如果是公共开放接口,则直接放行
    if (this.reflector.get(IS_PUBLIC_API, context.getHandler())) return true
    // 获取请求头中的token
    const tokenStr = context.switchToRpc().getData().headers.authorization
    if (!tokenStr) {
      throw new UnauthorizedException('非法请求,请先登录')
    }
    try {
      const userInfoStr = await this.redis.get(tokenStr)
      if (!userInfoStr) {
        throw new UnauthorizedException('非法请求,请先登录')
      }
      const request = context.switchToHttp().getRequest<UserRequest>()
      const userData = JSON.parse(userInfoStr)
      // 给登录用户挂载额外数据
      request.user = {
        userId: userData.id,
        avatar: userData.avatar_url,
        nickName: userData.nickname,
      }
      return true
    } catch (error) {
      throw new UnauthorizedException('非法请求,请先登录')
    }
  }
}
