import { Controller, Get } from '@nestjs/common';
import { JwksService } from '../../../auth/jwks.service';

@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly jwksService: JwksService) {}

  @Get('jwks.json')
  getJwks() {
    return this.jwksService.getJwks();
  }
}
