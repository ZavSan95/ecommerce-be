import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {

  @Get('ping')
  @ApiOperation({ summary: 'Ping al microservicio de catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo disponible' })
  pingCatalog() {
    return {
      gateway: 'ok',
      catalogResponse: {
        service: 'ms-catalog',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
