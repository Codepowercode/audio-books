import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import { Payment } from 'src/payments/entities/payments.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async makeid(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      if (
        await User.findOne({
          where: {
            email: createUserDto.email,
          },
        })
      ) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User with this email already registered',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      const user = await this.userRepo.create(createUserDto);
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      user.verificationCode = '';
      for (let i = 0; i < 20; i++) {
        user.verificationCode += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      await user.save();
      ['password', 'createdAt', 'updatedAt'].forEach((element) => {
        delete user[element];
      });
      return user;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async confirmVerification(confirmEmailDto: ConfirmEmailDto) {
    try {
      const user = await User.findOne({
        email: confirmEmailDto.email,
        verificationCode: confirmEmailDto.verificationCode,
      });
      console.log(user);
      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User not found',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      if (user.isVerificated == true) {
        return 'user is already verificated';
      } else {
        user.isVerificated = true;
        await user.save();

        ['password', 'createdAt', 'updatedAt'].forEach((element) => {
          delete user[element];
        });

        return user;
      }
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async showById(id: number): Promise<User> {
    const user = await this.findById(id);

    const donations = await Payment.find({
      from_user: user.id,
      payment_type: 'donation_to_project',
    });

    user.donated = 0;

    donations.forEach((donation) => {
      user.donated += donation.amount;
    });

    ['password', 'createdAt', 'updatedAt', 'verificationCode'].forEach(
      (deletion) => {
        delete user[deletion];
      },
    );
    return user;
  }

  async showAll() {
    const users = await User.find();

    for (const user of users) {
      const donations = await Payment.find({
        from_user: user.id,
        payment_type: 'donation_to_project',
      });

      user.donated = 0;

      donations.forEach((donation) => {
        user.donated += donation.amount;
      });

      ['password', 'createdAt', 'updatedAt', 'verificationCode'].forEach(
        (deletion) => {
          delete user[deletion];
        },
      );
    }

    return users;
  }

  async getAllUsers(pagination: { limit: number; skip: number }) {
    const users = await User.find({
      skip: pagination.skip,
      take: pagination.limit,
      select: [
        'id',
        'avatar',
        'birthday',
        'country',
        'donated',
        'email',
        'gender',
        'role',
      ],
    });

    const usersCount = await User.count();
    const pagesCount = Math.ceil(usersCount / pagination.limit);

    return {
      users,
      pagesCount,
    };
  }

  async findById(id: number) {
    return await User.findOne(id);
  }

  async findByEmail(email: string) {
    return await User.findOne({
      where: {
        email: email,
      },
    });
  }

  async changePersonalInfo(
    updateUserInfo: UpdateUserInfoDto,
    user: { userId: number; userName: string; userRole: string },
  ) {
    try {
      const currentuser = await User.findOne({
        id: user.userId,
      });
      if (!currentuser) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User not found',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      // const checkemail = await User.findOne({
      //   email: updateUserInfo.email,
      // });
      // if (checkemail && checkemail['id'] != user.userId) {
      //   throw new HttpException(
      //     {
      //       status: HttpStatus.FORBIDDEN,
      //       error: 'User with this email already exist',
      //     },
      //     HttpStatus.FORBIDDEN,
      //   );
      // }
      currentuser['email'] = updateUserInfo['email'];
      currentuser['name'] = updateUserInfo['name'];
      currentuser['gender'] = updateUserInfo['gender'];
      currentuser['country'] = updateUserInfo['country'];
      currentuser['birthday'] = updateUserInfo['birthday'];
      if (updateUserInfo.password) {
        currentuser['password'] = await bcrypt.hash(
          updateUserInfo['password'],
          8,
        );
      }

      await currentuser.save();

      const payload = {
        userId: currentuser.id,
        userName: currentuser.name,
        userRole: currentuser.role,
        userEmail: currentuser.email,
        userDonations: currentuser.donated,
        avatar: currentuser.avatar || '',
      };

      const token = await this.jwtService.sign(payload);

      return { access_token: token };
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async changePersonalAvatar(
    user: { userId: number; userName: string; userRole: string },
    file,
  ) {
    try {
      const currentuser = await User.findOne({
        id: user.userId,
      });
      if (!currentuser) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User not found',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (file) {
        currentuser['avatarExtension'] = file.filename.split('.')[1];
        currentuser['isAvatarSet'] = true;

        if (currentuser.avatar) {
          const oldPath = `public/${currentuser.avatar}`;

          try {
            await fs.promises.unlink(oldPath);
          } catch (err) {
            console.error(err);
          }
        }

        currentuser['avatar'] = `usersimages/${file.filename}`;
        // await rename(
        //   file.path,
        //   'public\\usersimages\\' +
        //     currentuser['id'] +
        //     '.' +
        //     currentuser['avatarExtension'],
        //   function (err) {
        //     if (err) console.log('Error: ' + err);
        //   },
        // );
      }

      await currentuser.save();

      const payload = {
        userId: currentuser.id,
        userName: currentuser.name,
        userRole: currentuser.role,
        userEmail: currentuser.email,
        userDonations: currentuser.donated,
        avatar: currentuser.avatar || '',
      };

      const token = await this.jwtService.sign(payload);

      return { access_token: token };
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async getPersonalInfo(user: {
    userId: number;
    userName: string;
    userRole: string;
  }) {
    try {
      const currentuser = await User.findOne({
        id: user.userId,
      });
      if (!currentuser) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User not found',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      delete currentuser.password;
      delete currentuser.verificationCode;
      delete currentuser.createdAt;
      delete currentuser.updatedAt;
      currentuser['imagePath'] =
        process.env.HOST_URL +
        'usersimages/' +
        currentuser.id +
        '.' +
        currentuser.avatarExtension;
      delete currentuser.avatarExtension;

      const donations = await Payment.find({
        from_user: currentuser.id,
        payment_type: 'donation_to_project',
      });
      currentuser.donated = 0;
      donations.forEach((donation) => {
        currentuser.donated += donation.amount;
      });
      return currentuser;
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }
}
