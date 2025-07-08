import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { SearchLandDto } from './dto/search-land-dto';

@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Post()
  create(@Body() createLandDto: CreateLandDto) {
    console.log("Received DTO:", createLandDto);
    return this.landsService.create(createLandDto);
  }

  @Get()
  findAll() {
    return this.landsService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.landsService.findOne(+id);
  // }

  @Get('/get-land-by-address/:address')
  findByAddress(@Param('address') address: string){
    return this.landsService.findByAddress(address)
  }

  @Get('search-and-filter')
  search(@Query() query: SearchLandDto){
    return this.landsService.search(query)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLandDto: UpdateLandDto) {
    return this.landsService.update(+id, updateLandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.landsService.remove(+id);
  }
}
