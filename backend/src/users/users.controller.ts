import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto){
    return this.usersService.create(createUserDto)
  }

  @Get('kycstatus')
  isUserVerified(@Query('wallet_address')  address: string){
    return this.usersService.isUserVerified('wallet_address',address)
  }
}
