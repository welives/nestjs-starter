import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/** 获取请求中携带的用户信息 */
export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user
  return data ? user && user[data] : user
})
