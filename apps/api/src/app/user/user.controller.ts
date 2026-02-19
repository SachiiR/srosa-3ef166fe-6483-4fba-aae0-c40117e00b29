
import { UserService } from '../user/user.service';
import { Controller, Get, Request as Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(@Req() req: any){
    return this.userService.findByOrg(req.user.orgId, req.user.role);
  }
}