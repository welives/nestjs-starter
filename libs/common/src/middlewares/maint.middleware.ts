import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { ApiException } from '../exceptions/api-exception'

interface IMaintenance {
  type: 'ALL' | 'PART' // 维护类型
  message: string // 维护信息
  list?: string[] // type 为 PART 时指定的维护接口
}

const REDIS_MAINT_KEY = '@@REDIS_MAINT_KEY'

@Injectable()
export class MaintMiddleware implements NestMiddleware {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { url, method } = req
    const currentApi = `${method.toLowerCase()}:${url}`
    const maintData: IMaintenance | null = JSON.parse(await this.redis.get(REDIS_MAINT_KEY))
    if (maintData) {
      switch (maintData.type) {
        case 'ALL':
          throw new ApiException(maintData.message)
        case 'PART':
          if (maintData?.list.includes(currentApi)) throw new ApiException(maintData.message)
        default:
          break
      }
    }
    next()
  }
}
