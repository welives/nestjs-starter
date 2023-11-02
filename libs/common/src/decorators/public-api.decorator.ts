import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_API = Symbol('IS_PUBLIC_API')
/** 开放接口装饰器 */
export const PublicApi = () => SetMetadata(IS_PUBLIC_API, true)
