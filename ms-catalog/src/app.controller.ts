import { Controller, Get } from '@nestjs/common';
import type { CatalogPingResponse } from '@ecommerce/contracts';


@Controller()
export class AppController {

  @Get('ping')
  ping(): CatalogPingResponse {
    return {
      service: 'ms-catalog',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
