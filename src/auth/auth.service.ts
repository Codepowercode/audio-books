import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Payment } from 'src/payments/entities/payments.entity';
import { Subscription } from 'src/payments/entities/subscription.entity';

import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { MoreThan } from 'typeorm';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { Token } from './entities/token.entity';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signJWT(payload) {
    return await this.jwtService.sign(payload);
  }

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);

    const donations = await Payment.find({
      from_user: user.id,
      payment_type: 'donation_to_project',
    });

    user.donated = 0;
    const donatedToBooks = {};

    donations.forEach((donation) => {
      user.donated += donation.amount;

      if (donation.bookId in donatedToBooks && donation.bookId != null) {
        donatedToBooks[donation.bookId] += donation.amount;
      } else {
        donatedToBooks[donation.bookId] = donation.amount;
      }
    });

    let userSubscriptionActive = false;
    const newDate = new Date();
    let userSubscriptionDueTo = new Date(
      newDate.setMonth(newDate.getMonth() - 1),
    );

    const subscriptions = await Subscription.createQueryBuilder('subscription')
      .where('userId = :id', {
        id: user.id,
      })
      .andWhere({
        end_date: MoreThan(Date.now()),
      })
      .getOne();

    if (subscriptions !== undefined) {
      userSubscriptionDueTo = subscriptions.end_date;
      userSubscriptionActive = true;
    }

    const payload = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      userDonations: user.donated,
      avatar: user.avatar || '',
      userDonationsToBooks: donatedToBooks,
      userSubscriptionActive: userSubscriptionActive,
      userSubscriptionDueTo: userSubscriptionDueTo,
    };

    return {
      access_token: await this.signJWT(payload),
    };
  }

  async loginAdmin(dto: AuthLoginDto) {
    const user = await this.validateUser(dto);

    if (user.role !== 'admin') {
      throw new UnauthorizedException();
    }

    const donations = await Payment.find({
      from_user: user.id,
      payment_type: 'donation_to_project',
    });

    user.donated = 0;
    const donatedToBooks = {};

    donations.forEach((donation) => {
      user.donated += donation.amount;

      if (donation.bookId in donatedToBooks && donation.bookId != null) {
        donatedToBooks[donation.bookId] += donation.amount;
      } else {
        donatedToBooks[donation.bookId] = donation.amount;
      }
    });

    let userSubscriptionActive = false;
    const newDate = new Date();
    let userSubscriptionDueTo = new Date(
      newDate.setMonth(newDate.getMonth() - 1),
    );

    const subscriptions = await Subscription.createQueryBuilder('subscription')
      .where('userId = :id', {
        id: user.id,
      })
      .andWhere({
        end_date: MoreThan(Date.now()),
      })
      .getOne();

    if (subscriptions !== undefined) {
      userSubscriptionDueTo = subscriptions.end_date;
      userSubscriptionActive = true;
    }

    const payload = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      userDonations: user.donated,
      avatar: user.avatar || '',
      userDonationsToBooks: donatedToBooks,
      userSubscriptionActive: userSubscriptionActive,
      userSubscriptionDueTo: userSubscriptionDueTo,
    };

    return {
      access_token: await this.signJWT(payload),
    };
  }

  async validateUser(authLoginDto: AuthLoginDto): Promise<User> {
    const { email, password } = authLoginDto;

    const user = await this.usersService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await User.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await Token.delete({
      userId: user.id,
    });

    const token = crypto.randomBytes(16).toString('hex');
    const createdToken = await Token.create({
      userId: user.id,
      token,
    });

    await createdToken.save();

    const frontUrl = process.env.FRONT_URL;
    const resetLink = frontUrl + `reset-password?token=${createdToken.token}`;

    await this.mailService.sendMail(
      user.email,
      { resetLink },
      'Password Reset',
      '/reset-password',
    );

    return {
      message: 'Check your email for password reset link',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await Token.findOne({
      token: dto.token,
    });

    if (!token) {
      throw new ForbiddenException('Credentials invalid');
    }

    const user = await User.findOne(token.userId);

    if (!user) {
      throw new ForbiddenException('Credentials invalid');
    }

    user.password = await bcrypt.hash(dto.password, 8);

    await user.save();
    await token.remove();

    return {
      message: 'Password reseted succesfully',
    };
  }
}
