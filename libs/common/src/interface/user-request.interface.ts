import { Request } from '@nestjs/common'
export interface UserRequest extends Request {
  user: {
    userId: string
    avatar: string
    nickName: string
    [key: string]: any
  }
}
