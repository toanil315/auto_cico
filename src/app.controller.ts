import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Leave, User } from './model';

@Controller('users')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  listUsers(@Query('pwd') pwd: string) {
    if (pwd === 'toanil315') {
      return this.appService.getUsers();
    }
  }

  @Post()
  upsertUser(@Body() user: User) {
    return this.appService.upsertUser(user);
  }

  @Post('enable')
  enableUser(@Body() params: { id: string; is_active: boolean }) {
    return this.appService.enableUser(params);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.appService.deleteUser(id);
  }

  @Post('leaves')
  createLeave(@Body() leave: Leave) {
    return this.appService.createLeave(leave);
  }
}
