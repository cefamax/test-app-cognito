import { BadRequestException, Body, Controller, Delete, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmRequestDto } from './dto/confirm.request.dto';
import { AuthenticateRequestDto } from './dto/authenticate.request.dto';
import { RefreshRequestDto } from './dto/refresh.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerRequest: RegisterRequestDto) {
    try {
      return await this.authService.registerUser(registerRequest);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('confirm')
  async confirm(@Body() confirmRequest: ConfirmRequestDto) {
    try {
      return await this.authService.confirmUser(confirmRequest);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('login')
  async login(@Body() authenticateRequest: AuthenticateRequestDto) {
    try {
      return await this.authService.authenticateUser(authenticateRequest);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('refresh')
  async refresh(@Body() refreshRequest: RefreshRequestDto) {
    try {
      return await this.authService.refreshToken(refreshRequest);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete('user')
  async delete(@Body() authenticateRequest: AuthenticateRequestDto) {
    try {
      return await this.authService.deleteUser(authenticateRequest);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

}
