import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import ms from 'ms'
import { PrismaService } from 'nestjs-prisma'
import { Utils } from '@libs/common'

interface ValidResult {
  type: 'NO_EXIST' | 'FORBIDDEN' | 'INCORRECT' | 'NORMAL'
  message: string
  result: any
}
enum UserStatus {
  NORMAL = 0,
  LOCKED = 1,
  BANNED = 2,
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}
  /**
   * 校验用户信息
   * @param data
   */
  async validateUser(data: { username: string; password: string }): Promise<ValidResult> {
    console.log('Step 2: 查询数据库校验登录用户信息')
    const user = await this.prisma.user.findFirst({ where: { username: data.username } })
    if (!user) {
      return {
        type: 'NO_EXIST',
        message: '用户不存在',
        result: null,
      }
    }
    if (user.status !== UserStatus.NORMAL) {
      return {
        type: 'FORBIDDEN',
        message: '用户已被锁定',
        result: null,
      }
    }
    const isCorrect = user.password === Utils.encryptPassword(data.password, user.salt)
    if (!isCorrect) {
      return {
        type: 'INCORRECT',
        message: '账号或密码错误',
        result: null,
      }
    }
    const { password, salt, ...result } = user
    return {
      type: 'NORMAL',
      message: 'ok',
      result,
    }
  }
  /**
   * 签发JWT
   * @param user
   */
  async certificate(user: any) {
    console.log('Step 3: 签发JWT', user)
    const token = this.jwtService.sign(user)
    const expires = parseInt(ms(this.config.get('JWT_EXPIRES_IN')))
    await this.redis.setex(`uid:${user.id}`, expires / 1000, token)
    return token
  }
}
