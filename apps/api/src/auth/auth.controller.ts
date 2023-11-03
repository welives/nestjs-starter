import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PublicApi } from '@libs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicApi()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() request: any) {
    return { token: await this.authService.certificate(request.user) }
  }

  @Get('profile')
  async profile(@Request() request: any) {
    return 'Hello World'
  }
}
