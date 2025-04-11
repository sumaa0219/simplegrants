import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { NextAuthGuard } from 'src/auth/guards/nextauth.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InviteCodeResponse } from './invites.interface';
import { RequestWithUser } from 'src/users/users.interface';

@ApiTags('Ecosystem Builder Invites')
@UseGuards(ThrottlerGuard)
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  // Most likely won't create an API for this for now
  //   @Post()
  //   async createInvites() {
  //     return await this.invitesService.createInvites()
  //   }

  @ApiOperation({
    description:
      'Claim an invite code to be an Ecosystem Builder. Rate limited to 3 tries for 24 hours.',
  })
  @ApiOkResponse({
    description: 'Ecosystem Builder account created',
    type: InviteCodeResponse,
  })
  @Throttle(3, 86400)
  @Post(':code')
  @UseGuards(NextAuthGuard)
  async claimInviteCode(
    @Param('code') inviteCode: string,
    @Request() req: RequestWithUser,
  ) {
    return new InviteCodeResponse(
      await this.invitesService.claimInviteCode(inviteCode, req.user),
    );
  }
}
