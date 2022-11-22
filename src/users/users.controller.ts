import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Request,
  UploadedFile,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/utils/file-upload.utils';
import { diskStorage } from 'multer';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { GetPagination } from '../decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailsService: MailService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    console.log({ createUserDto });
    const user = await this.usersService.create(createUserDto);
    const verificationCodeUrl = `${process.env.FRONT_URL}email-verification?email=${user.email}&verification=${user.verificationCode}`;
    console.log({ verificationCodeUrl });
    return this.mailsService.sendMail(
      user['email'],
      {
        verificationCode: verificationCodeUrl,
      },
      'Email Verification Message',
      '/email',
    );
  }

  @Post('confirmEmail')
  confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.usersService.confirmVerification(confirmEmailDto);
  }

  @Get('getuser/:id')
  show(@Param('id') id: string) {
    return this.usersService.showById(+id);
  }

  @Get('getallusers')
  async showAll() {
    return await this.usersService.showAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers(@GetPagination() pagination: { limit: number; skip: number }) {
    return this.usersService.getAllUsers(pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Post('changePersonalInfo')
  changePersonalInfo(
    @Body() updateUserInfo: UpdateUserInfoDto,
    @Request() req,
  ) {
    return this.usersService.changePersonalInfo(updateUserInfo, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('changePersonalAvatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/usersimages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  changePersonalAvatar(@Request() req, @UploadedFile() file) {
    return this.usersService.changePersonalAvatar(req.user, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getPersonalInfo')
  async getPersonalInfo(@Request() req) {
    return this.usersService.getPersonalInfo(req.user);
  }
}
