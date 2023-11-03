import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class LoginDTO {
  @ApiProperty({ required: true, type: String, description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名只能是 String 类型' })
  readonly username: string

  @ApiProperty({ required: true, type: String, description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码只能是 String 类型' })
  readonly password: string
}
