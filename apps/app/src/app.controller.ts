import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { PublicApi } from '@libs/common'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @PublicApi()
  @Get()
  getHello() {
    return this.appService.getHello()
  }
}
