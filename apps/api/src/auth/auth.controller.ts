import { Controller, Post, UseGuards, Request } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { PublicApi, UserRequest } from '@libs/common'
import { AuthService } from './auth.service'
import { LoginDTO } from './dto/auth.dto'

@ApiTags('Auth模块')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 登录接口
   */
  @ApiOperation({ summary: '登录接口' })
  @ApiBody({ type: LoginDTO })
  @PublicApi()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() request: UserRequest) {
    return { token: await this.authService.certificate(request.user) }
  }
}
