import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WasabiService } from '../storage/wasabi.service';
import { StorageModule } from '../storage/storage.module';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
