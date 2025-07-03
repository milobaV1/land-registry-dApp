import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from './entities/land.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Land])],
  controllers: [LandsController],
  providers: [LandsService],
})
export class LandsModule {}
