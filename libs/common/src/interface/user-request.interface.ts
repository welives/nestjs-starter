import { Request } from '@nestjs/common'
export interface UserRequest extends Request {
  user: {
    id: number
    username: string
    role: number
    avatar: string
    [key: string]: any
  }
}
