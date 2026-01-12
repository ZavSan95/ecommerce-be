import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { AfipModule } from '../afip/afip.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AfipModule, StorageModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
