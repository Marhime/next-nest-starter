import { Controller, Get } from '@nestjs/common';
import {
  Session,
  UserSession,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  @Get('me')
  async getProfile(@Session() session: UserSession) {
    if (!session) {
      return { user: null };
    }
    return { user: session.user };
  }

  @Get('public')
  @AllowAnonymous() // Allow anonymous access
  async getPublic() {
    return { message: 'Public route' };
  }

  @Get('optional')
  @OptionalAuth() // Authentication is optional
  async getOptional(@Session() session: UserSession) {
    return { authenticated: !!session };
  }
}
