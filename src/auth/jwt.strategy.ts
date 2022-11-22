import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: {
    userId: number;
    userName: string;
    userRole: string;
    userEmail: string;
    avatar: string;
    userDonations: number;
    userDonationsToBooks: number;
    userSubscriptionActive: boolean;
    userSubscriptionDueTo: Date;
  }) {
    return {
      userId: payload.userId,
      userName: payload.userName,
      userRole: payload.userRole,
      userEmail: payload.userEmail,
      avatar: payload.avatar,
      userDonations: payload.userDonations,
      userDonationsToBooks: payload.userDonationsToBooks,
      userSubscriptionActive: payload.userSubscriptionActive,
      userSubscriptionDueTo: payload.userSubscriptionDueTo,
    };
  }
}
