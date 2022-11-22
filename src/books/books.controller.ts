import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
  Response,
  Param,
  Delete,
  Put,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  audioFileFilter,
  editBookImageName,
  editFileName,
  imageFileFilter,
  pdfFileFilter,
} from 'src/utils/file-upload.utils';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { diskStorage } from 'multer';
import { AddAudioDto } from './dto/add-audio.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateDonatedBookDto } from './dto/update-donated-book.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { GetPagination } from 'src/decorator';
import { GetUser } from '../auth/decorator';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from 'src/users/user.entity';
import { use } from 'passport';
import { Subscription } from 'src/payments/entities/subscription.entity';
import { Payment } from 'src/payments/entities/payments.entity';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @Get('/getall')
  async findAll(@Response() res) {
    const books = await this.booksService.findAll();
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-10/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);
  }

  @Get()
  getAllBooks(
    @GetPagination() pagination: { limit: number; skip: number },
    @Query()
    query: { authorEnglish?: string; authorArabic?: string; genre?: string },
  ) {
    return this.booksService.getAllBooks(pagination, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('donated')
  getDonatedBooksByUser(@GetUser('userId') userId: number) {
    return this.booksService.getDonatedBooksByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('donated-audio')
  getDonatedAudioBooksByUser(@GetUser('userId') userId: number) {
    return this.booksService.getDonatedAudioBooksByUser(userId);
  }

  @Get('getall/:id')
  async findAllById(@Response() res, @Param('id') id: string) {
    const books = await this.booksService.getNotification(+id);
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-1/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete('getall/:id')
  async DeleteAllById(@Param('id') id: number) {
    // return await this.booksService.deleteNotification(+id, req.user);
    return await this.booksService.deleteNotification(id);
  }

  // @UseGuards(JwtAuthGuard)
  @Put('getall/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/booksimages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  acceptAllById(
    @Body() updateNotification: UpdateBookDto,
    // @Request() req,
    @UploadedFile() file,
    @Param('id') id: number,
  ) {
    // return this.booksService.acceptNotification(updateNotification, req.user, file);
    // return this.booksService.acceptNotification(updateNotification, req.user);
    return this.booksService.acceptNotification(updateNotification, file, id);
  }

  @Get('/getsamples')
  getSamples() {
    return this.booksService.findSamples();
  }

  @Get('/getdefaultbooks')
  getDefault() {
    return this.booksService.findDefault();
  }

  @Get('/getonlyapproved')
  getApproved() {
    return this.booksService.getApproved();
  }

  @Get('/getByStatus/:status')
  async getByStatus(
    // @Response() res,
    @Param('status') status: string,
  ) {
    return await this.booksService.getByStatus(+status);
    // return await res
    //   .append('X-Total-Count', books[1])
    //   .append('Access-Control-Expose-Headers', 'X-Total-Count')
    //   .append('Content-Range', 'posts 0-10/' + books[1])
    //   .append('Access-Control-Expose-Headers', 'Content-Range')
    //   .json(books[0]);
  }

  @Get('/getByStatus/:status/:id')
  async getByStatusById(
    @Param('status') status: string,
    @Param('id') id: string,
  ) {
    return await this.booksService.getByStatusById(+status, +id);
    // return await res
    //   .append('X-Total-Count', books[1])
    //   .append('Access-Control-Expose-Headers', 'X-Total-Count')
    //   .append('Content-Range', 'posts 0-1/' + books[1])
    //   .append('Access-Control-Expose-Headers', 'Content-Range')
    //   .json(books[0]);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete('/getByStatus/:status/:id')
  async deleteByStatus(@Param('id') id: number) {
    // return await this.booksService.deleteNotification(+id, req.user);
    return await this.booksService.deleteNotification(id);
  }

  // @UseGuards(JwtAuthGuard)
  @Put('/getByStatus/:status/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/booksimages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async editByStatus(
    @Body() updateNotification: UpdateBookDto,
    // @Request() req,
    @UploadedFile() file,
    @Param('id') id: number,
  ) {
    // return this.booksService.acceptNotification(updateNotification, req.user, file);
    // return this.booksService.acceptNotification(updateNotification, req.user);
    return await this.booksService.acceptNotification(
      updateNotification,
      file,
      id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/booksimages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  createBook(
    @Body() createBookDto: CreateBookDto,
    @Request() req,
    @UploadedFile() file,
  ) {
    console.log('asdasdsada');
    return this.booksService.createBook(createBookDto, req.user, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('createNotification')
  createBookNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req,
  ) {
    return this.booksService.createBookNotification(
      createNotificationDto,
      req.user,
    );
  }

  @Get('getAllNotifications')
  async getAllNotifications(@Response() res) {
    const books = await this.booksService.getAllNotifications();
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-10/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);
  }

  @Get('getLastNotification')
  async getLastNotification(@Response() res) {
    const book = await this.booksService.getLastNotification();
    console.log(book[0]);
    return await res
      .append('X-Total-Count', book[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-1/' + book[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(book[0]);
  }

  @Get('getAllNotifications/:id')
  async getAllNotificationsById(@Response() res, @Param('id') id: string) {
    const books = await this.booksService.getNotification(+id);
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-1/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);
  }

  @Get('getLastNotification/:id')
  async getLastNotificationById(@Response() res, @Param('id') id: string) {
    const book = await this.booksService.getNotification(+id);
    console.log(book[0]);
    return await res
      .append('X-Total-Count', book[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-1/' + book[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(book[0]);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete('getAllNotifications/:id')
  async DeleteNotificationById(@Param('id') id: number) {
    // return await this.booksService.deleteNotification(+id, req.user);
    return await this.booksService.deleteNotification(id);
  }

  // @UseGuards(JwtAuthGuard)
  @Put('getAllNotifications/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/booksimages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  acceptNotification(
    @Body() updateNotification: UpdateBookDto,
    @UploadedFile() file,
    @Param('id') id: number,
  ) {
    console.log({ id });
    // return this.booksService.acceptNotification(updateNotification, req.user, file);
    // return this.booksService.acceptNotification(updateNotification, req.user);
    return this.booksService.acceptNotification(updateNotification, file, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('approveBook')
  approveBook(@Query() bookQuery, @Request() req) {
    return this.booksService.approveBook(bookQuery['bookId'], req.user);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('addAudio')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './public/booksaudios',
        filename: editFileName,
      }),
      fileFilter: audioFileFilter,
    }),
  )
  addAudio(
    @Body() addAudioDto: AddAudioDto,
    // @Request() req,
    @UploadedFile() file,
  ) {
    return this.booksService.addAudio(
      addAudioDto,
      // req.user,
      file,
    );
  }

  @Post(':id/add-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/booksimages',
        filename: editBookImageName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  addBookImage(@UploadedFile() file, @Param('id') bookId: number) {
    return this.booksService.addBookImage(file, bookId);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('addPdf/:id')
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './public/bookspdfs',
        filename: editFileName,
      }),
      fileFilter: pdfFileFilter,
    }),
  )
  addPdf(
    // @Body() addAudioDto: AddAudioDto,
    @Param('id') id: string,
    // @Request() req,
    @UploadedFile() file,
  ) {
    console.log(id);
    console.log(file);
    return this.booksService.addPdf(
      +id,
      // req.user,
      file,
    );
  }

  @Get('getFullDonatedBooks')
  async getFullDonatedBooks(@Response() res) {
    const books = await this.booksService.getFullDonatedBooks();
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-10/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);
  }

  @Get('getFullDonatedBooks/:id')
  async getFullDonatedBooksById(@Response() res, @Param('id') id: number) {
    const books = await this.booksService.getFullDonatedBooksById(id);
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-1/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);
  }

  @Get('getBookAudiosById/:id')
  async getBookAudiosById(@Param('id') id: string) {
    return await this.booksService.getBookAudiosById(+id);
  }

  @Delete('getFullDonatedBooks/:id')
  async removeDonatedNotification(@Param('id') id: number) {
    // return await this.booksService.deleteNotification(+id, req.user);
    return await this.booksService.removeDonatedNotification(id);
  }

  @Delete('removeAudioBook/:id')
  async removeAudioBook(@Param('id') id: number, @Response() res) {
    // return await this.booksService.deleteNotification(+id, req.user);
    const books = await this.booksService.removeAudioBook(id);
    return await res
      .append('X-Total-Count', books[1])
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-10/' + books[1])
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(books[0]);

    // return await this.booksService.removeAudioBook(+id);
  }

  // @UseGuards(JwtAuthGuard)
  @Put('editAudioBook/:id')
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: './public/booksaudios',
        filename: editFileName,
      }),
      fileFilter: audioFileFilter,
    }),
  )
  async editAudioBook(
    @Body() updateAudioDto: UpdateAudioDto,
    // @Request() req,
    @UploadedFile() file,
    @Param('id') id: number,
  ) {
    // return this.booksService.acceptNotification(updateNotification, req.user, file);
    // return this.booksService.acceptNotification(updateNotification, req.user);
    console.log(updateAudioDto);
    console.log(file);
    return await this.booksService.editAudio(updateAudioDto, file, id);
  }

  // @UseGuards(JwtAuthGuard)
  @Put('getFullDonatedBooks/:id')
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: './public/booksaudios',
        filename: editBookImageName,
      }),
      fileFilter: audioFileFilter,
    }),
  )
  async editFullDonated(
    @Body() updateNotification: UpdateDonatedBookDto,
    // @Request() req,
    @UploadedFile() file,
    @Param('id') id: number,
  ) {
    // return this.booksService.acceptNotification(updateNotification, req.user, file);
    // return this.booksService.acceptNotification(updateNotification, req.user);
    console.log(updateNotification);
    console.log(file);
    return await this.booksService.updateDonatedBook(
      updateNotification,
      file,
      id,
    );
  }

  // @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(
    @GetPagination() pagination: { limit: number; skip: number },
    @Res() res,
  ) {
    const users = await this.booksService.getAllUsers(pagination);

    return res
      .append('X-Total-Count', 1)
      .append('Access-Control-Expose-Headers', 'X-Total-Count')
      .append('Content-Range', 'posts 0-10/' + 1)
      .append('Access-Control-Expose-Headers', 'Content-Range')
      .json(users);
  }

  @Get('users/:id')
  getUser(@Param('id') id: number) {
    return this.booksService.getUser(id);
  }

  @Put('users/:id')
  editUser(@Param('id') userId: number, @Body() dto: EditUserDto) {
    return this.booksService.editUser(userId, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') userId: number) {
    return this.booksService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAudioBookFiles/:id')
  async getAudioBookFiles(
    @GetUser('id') userId: number,
    @Param('id') bookId: number,
    @Res() res,
  ) {
    let isSubscribed = false;
    let isDonated = false;

    const subscription = await Subscription.findOne({
      where: {
        userId,
      },
    });

    if (subscription) {
      isSubscribed = true;
    }

    const donation = await Payment.findOne({
      where: {
        from_user: userId,
        bookId,
      },
    });

    if (donation) {
      isDonated = true;
    }

    if (!isSubscribed && !isDonated) {
      const url = `${process.env.FRONT_URL}subscription`;
      return res.redirect(url);
    }

    return this.booksService.getAudioBookFiles(bookId);
  }
}
