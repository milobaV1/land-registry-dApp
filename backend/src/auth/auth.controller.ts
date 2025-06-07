import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  getNonce(@Request() req){
    return this.authService.nonce(req.session);
  }

  @Post('verify')
  verify(@Request() req, @Body() body: {message: string; signature: string}){
    return this.authService.verify(body.message, body.signature, req.session)
  }

  @Post('me')
  me(@Body('token') token:string){
    return this.authService.me(token)
  }
}
