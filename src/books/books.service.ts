import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, fsync, readFile, rename, unlink, unlinkSync } from 'fs';
import { Payment } from 'src/payments/entities/payments.entity';
import { Subscription } from 'src/payments/entities/subscription.entity';
import { User } from 'src/users/user.entity';

import { getManager, Not, Repository } from 'typeorm';
import { AddAudioDto } from './dto/add-audio.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { FindSamplesDto } from './dto/find-samples.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateDonatedBookDto } from './dto/update-donated-book.dto';
import { AudioBook } from './entities/audiobook.entity';

import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  async findAll() {
    const whereStr = 'status = :s1 OR status = :s2 OR status = :s3';
    const books = await Book.createQueryBuilder('book')
      .where(whereStr, {
        s1: 2,
        s2: 3,
        s3: 5,
      })
      .orderBy('id', 'DESC')
      .getManyAndCount();

    // .innerJoin('status', 'book.status = status.id')
    // .select('status.name as statusName, books.*')

    if (books[0]) {
      books[0].forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }
    return books;
  }

  async getAllBooks(
    pagination: { limit: number; skip: number },
    query: { authorEnglish?: string; authorArabic?: string; genre?: string },
  ) {
    const books = await Book.find({
      skip: pagination.skip,
      take: pagination.limit,
      where: {
        ...query,
      },
    });

    return books;
  }

  async getDonatedBooksByUser(userId: number) {
    const payments = await Payment.createQueryBuilder('payment')
      .select('DISTINCT payment.bookId')
      .where('from_user = :userId', { userId })
      .getRawMany();

    const bookIds = payments.map((i) => i.bookId);

    const whereQuery = bookIds.map((i) => {
      return {
        id: i,
        status: Not(6),
      };
    });

    const books = await Book.find({
      where: whereQuery,
    });

    const formattedBooks = [];

    for (const book of books) {
      const formattedBook: any = {
        ...book,
      };
      const { sum } = await Payment.createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where(
          'bookId = :bookId AND from_user = :userId AND status = :status',
          {
            bookId: book.id,
            userId,
            status: 'verified',
          },
        )
        .getRawOne();

      formattedBook.userDonated = sum;

      formattedBooks.push(formattedBook);
    }

    return formattedBooks;
  }

  async getDonatedAudioBooksByUser(userId: number) {
    const payments = await Payment.createQueryBuilder('payment')
      .select('DISTINCT payment.bookId')
      .where('from_user = :userId AND status = :status', {
        userId,
        status: 'verified',
      })
      .getRawMany();

    const bookIds = payments.map((i) => i.bookId);

    const whereQuery = bookIds.map((i) => {
      return {
        id: i,
        status: 6,
      };
    });

    const books = await Book.find({
      where: whereQuery,
    });

    const formattedBooks = [];

    for (const book of books) {
      const formattedBook: any = {
        ...book,
      };
      const { sum } = await Payment.createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('bookId = :bookId AND from_user = :userId', {
          bookId: formattedBook.id,
          userId,
        })
        .getRawOne();

      formattedBook.userDonated = sum;

      formattedBooks.push(formattedBook);
    }

    return formattedBooks;
  }

  async findSamples() {
    const books = await Book.find({
      where: {
        issample: true,
      },
    });
    if (books) {
      books.forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }

    return { books: books };
  }

  async findDefault() {
    const books = await Book.createQueryBuilder('book')
      .where('issample = false')
      .getMany();

    if (books) {
      books.forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }

    return { books: books };
  }

  async getApproved() {
    const books = await Book.createQueryBuilder('book')
      .where('book.status = :status', { status: 2 })
      .getMany();
    if (books) {
      books.forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }
    return { books: books };
  }

  async getByStatus(status: number) {
    const books = await Book.createQueryBuilder('book')
      .where('book.status = :status', { status: status })
      .orderBy('id', 'DESC')
      // .getManyAndCount();
      .getMany();

    if (books) {
      books.forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }
    return { books: books };
  }

  async getByStatusById(status: number, id: number) {
    const book = await Book.createQueryBuilder('book')
      .where('book.status = :status', { status: status })
      .where('book.id = :id', { id: id })
      .getOneOrFail();

    if (book) {
      ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
        delete book[element];
      });
      // book['imageLink'] =
      //   process.env.HOST_URL +
      //   'booksimages/' +
      //   (book['isImage']
      //     ? existsSync(
      //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
      //       )
      //       ? book['id']
      //       : 'default'
      //     : 'default') +
      //   '.' +
      //   book['imageext'];

      return [book, 1];
    }

    return [book, 0];
  }

  async createBook(
    createBookDto: CreateBookDto,
    user: { userId: number; userName: string; userRole: string },
    file,
  ) {
    createBookDto['usersuggested'] = user.userId;
    createBookDto['status'] = 1;
    const newbook = await Book.create(createBookDto);

    if (file) {
      createBookDto['imageext'] = file.filename.split('.')[1];
      await rename(
        file.path,
        'public/booksimages/' + newbook.id + '.' + createBookDto['imageext'],
        function (err) {
          if (err) console.log('Error: ' + err);
        },
      );
    }
    await newbook.save();
    return 'success';
  }

  async createBookNotification(
    createNotificationDto: CreateNotificationDto,
    user: { userId: number; userName: string; userRole: string },
  ) {
    try {
      createNotificationDto['usersuggested'] = user.userId;
      createNotificationDto['status'] = 1;
      const newbook = await Book.create(createNotificationDto);
      await newbook.save();
      return { message: 'success' };
    } catch (error) {
      return { message: 'error' };
    }
  }

  async getAllNotifications() {
    const books = await Book.createQueryBuilder('book')
      // .where('status = :status', { status: 1 })
      .orderBy('id', 'DESC')
      .getManyAndCount();

    // .innerJoin('status', 'book.status = status.id')
    // .select('status.name as statusName, books.*')

    if (books[0]) {
      books[0].forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }
    return books;
  }

  async getFullDonatedBooks() {
    const books = await Book.createQueryBuilder('book')
      .where('status = 6')
      .andWhere('isReadDonated = false')
      .getManyAndCount();

    // .innerJoin('status', 'book.status = status.id')
    // .select('status.name as statusName, books.*')

    if (books[0]) {
      books[0].forEach((book) => {
        ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
          delete book[element];
        });
        // book['imageLink'] =
        //   process.env.HOST_URL +
        //   'booksimages/' +
        //   (book['isImage']
        //     ? existsSync(
        //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
        //       )
        //       ? book['id']
        //       : 'default'
        //     : 'default') +
        //   '.' +
        //   book['imageext'];
      });
    }
    return books;
  }

  async getFullDonatedBooksById(id: number) {
    const book = await Book.createQueryBuilder()
      .where('id = :id', { id: id })
      .getOneOrFail();

    if (book) {
      ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
        delete book[element];
      });
      // book['imageLink'] =
      //   process.env.HOST_URL +
      //   'booksimages/' +
      //   (book['isImage']
      //     ? existsSync(
      //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
      //       )
      //       ? book['id']
      //       : 'default'
      //     : 'default') +
      //   '.' +
      //   book['imageext'];

      // const firstAudiobook = await AudioBook.createQueryBuilder()
      // .where('forBook = :forBook', {forBook: book.id})
      // .getOne();

      const allAudioBooks = await AudioBook.createQueryBuilder()
        .where('forBook = :forBook', { forBook: book.id })
        .getMany();

      if (allAudioBooks) {
        allAudioBooks.forEach((audio) => {
          ['createdAt', 'updatedAt'].forEach((element) => {
            delete audio[element];
          });
          audio.fileName =
            process.env.HOST_URL + 'booksaudios/' + audio.fileName;
        });
        book['audioBooks'] = allAudioBooks;
      }
      // if(firstAudiobook){
      //   book['title'] = firstAudiobook.title;
      //   book['audio'] = process.env.HOST_URL + 'booksaudios/' + firstAudiobook.fileName;
      //   // book['id'] = firstAudiobook.id;
      //   book['audioBookDuration'] = firstAudiobook.audioBookDuration;
      //   book['briefDescription'] = firstAudiobook.briefDescription;
      //   book['manualyTags'] = firstAudiobook.manualyTags;
      //   book['narrationCompanyName'] = firstAudiobook.narrationCompanyName;
      //   book['narratorName'] = firstAudiobook.narratorName;
      //   book['secondaryTitle'] = firstAudiobook.secondaryTitle;
      //   book['forBook'] = firstAudiobook.forBook;
      //   book['fileName'] = firstAudiobook.fileName;
      // }

      return [book, 1];
    }

    return [book, 0];
  }

  async getBookAudiosById(id: number) {
    const book = await Book.createQueryBuilder('book')
      .select([
        'book.title',
        'book.audioBookDuration',
        'book.briefDescription',
        'book.manualyTags',
        'book.narrationCompanyName',
        'book.narratorName',
        'book.secondaryTitle',
      ])
      .where('id = :id', { id: id })
      .getOneOrFail();

    if (!book) {
      return 'no books with this id exists';
    }

    // const firstAudiobook = await AudioBook.createQueryBuilder()
    // .where('forBook = :forBook', {forBook: book.id})
    // .getOne();

    const allAudioBooks = await AudioBook.createQueryBuilder()
      .where('forBook = :forBook', { forBook: id })
      .getMany();

    if (allAudioBooks) {
      allAudioBooks.forEach((audio) => {
        ['createdAt', 'updatedAt'].forEach((element) => {
          delete audio[element];
        });
        audio.fileName = process.env.HOST_URL + 'booksaudios/' + audio.fileName;
      });
      book['audioBooks'] = allAudioBooks;
    }

    if (await existsSync('public/bookspdfs/' + id + '.pdf')) {
      book['pdf'] = process.env.HOST_URL + 'bookspdfs/' + id + '.pdf';
    }
    // if(firstAudiobook){
    //   book['title'] = firstAudiobook.title;
    //   book['audio'] = process.env.HOST_URL + 'booksaudios/' + firstAudiobook.fileName;
    //   // book['id'] = firstAudiobook.id;
    //   book['audioBookDuration'] = firstAudiobook.audioBookDuration;
    //   book['briefDescription'] = firstAudiobook.briefDescription;
    //   book['manualyTags'] = firstAudiobook.manualyTags;
    //   book['narrationCompanyName'] = firstAudiobook.narrationCompanyName;
    //   book['narratorName'] = firstAudiobook.narratorName;
    //   book['secondaryTitle'] = firstAudiobook.secondaryTitle;
    //   book['forBook'] = firstAudiobook.forBook;
    //   book['fileName'] = firstAudiobook.fileName;
    // }

    return book;
  }

  async getLastNotification() {
    const book = await Book.createQueryBuilder('book')
      .where('status = :status', { status: 1 })
      .orderBy('id', 'DESC')
      .getOne();

    if (book) {
      ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
        delete book[element];
      });
      // book['imageLink'] =
      //   process.env.HOST_URL +
      //   'booksimages/' +
      //   (book['isImage']
      //     ? existsSync(
      //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
      //       )
      //       ? book['id']
      //       : 'default'
      //     : 'default') +
      //   '.' +
      //   book['imageext'];

      return [[book], 1];
    }

    return [[book], 0];
  }

  async getNotification(id: number) {
    const book = await Book.createQueryBuilder()
      .where('id = :id', { id: id })
      .getOneOrFail();

    if (book) {
      ['issample', 'createdAt', 'updatedAt'].forEach((element) => {
        delete book[element];
      });
      // book['imageLink'] =
      //   process.env.HOST_URL +
      //   'booksimages/' +
      //   (book['isImage']
      //     ? existsSync(
      //         './public/booksimages/' + book['id'] + '.' + book['imageext'],
      //       )
      //       ? book['id']
      //       : 'default'
      //     : 'default') +
      //   '.' +
      //   book['imageext'];

      return [book, 1];
    }

    return [book, 0];
  }

  async acceptNotification(
    updateNotification: UpdateBookDto,
    // user: { userId: number; userName: string; userRole: string },
    file,
    id?: number,
  ) {
    if (file) {
      updateNotification['imageext'] = file.filename.split('.')[1];
      updateNotification['status'] = 2;
      // const result = await Book.update(updateNotification['id'], updateNotification);
      await rename(
        file.path,
        'public/booksimages/' +
          updateNotification['id'] +
          '.' +
          updateNotification['imageext'],
        function (err) {
          if (err) console.log('Error: ' + err);
        },
      );
      // return 'success';
    }
    delete updateNotification['image'];
    // return 'error';
    // updateNotification['status'] = 2;
    // if(user.userRole == 'administrator') {
    const result = await Book.update({ id }, updateNotification);
    // return result ? 'success' : 'error';
    return updateNotification;
    // return 'success';
    // }
    // else{
    //   return 'You need to be an administrator';
    // }
  }

  async updateDonatedBook(
    updateNotification: UpdateDonatedBookDto,
    // user: { userId: number; userName: string; userRole: string },
    file,
    id: number,
  ) {
    // updateNotification['imageext'] = file.filename.split('.')[1];
    // updateNotification['status'] = 2;
    // const result = await Book.update(updateNotification['id'], updateNotification);
    // await rename(
    //   file.path,
    //   'public/booksaudios/' + updateNotification['id'] + '.' + updateNotification['imageext'],
    //   function (err) {
    //     if (err) console.log('Error: ' + err);
    //   },
    // );
    // return 'success';

    // return 'error';
    // updateNotification['status'] = 2;
    // if(user.userRole == 'administrator') {
    const updateDonated = new UpdateDonatedBookDto();
    updateDonated.nameEnglish = updateNotification.nameEnglish;
    updateDonated.descriptionEnglish = updateNotification.descriptionEnglish;
    updateDonated.nameArabic = updateNotification.nameArabic;
    updateDonated.descriptionArabic = updateNotification.descriptionArabic;
    updateDonated.authorEnglish = updateNotification.authorEnglish;
    updateDonated.authorArabic = updateNotification.authorArabic;
    updateDonated.narrator = updateNotification.narrator;
    updateDonated.genre = updateNotification.genre;
    updateDonated.kickoffPledge = updateNotification.kickoffPledge;
    updateDonated.yearOfPublishing = updateNotification.yearOfPublishing;
    updateDonated.ISBN = updateNotification.ISBN;
    updateDonated.goal = updateNotification.goal;
    updateDonated.deadline = updateNotification.deadline;
    updateDonated.status = updateNotification.status;
    updateDonated.license = updateNotification.license;
    updateDonated.title = updateNotification.title;

    if (String(updateNotification.audioBookDuration) === 'null') {
      updateDonated.audioBookDuration = 0;
    } else {
      updateDonated.audioBookDuration = updateNotification.audioBookDuration;
    }

    updateDonated.briefDescription = updateNotification.briefDescription;
    updateDonated.manualyTags = updateNotification.manualyTags;
    updateDonated.narrationCompanyName =
      updateNotification.narrationCompanyName;
    updateDonated.narratorName = updateNotification.narratorName;
    updateDonated.secondaryTitle = updateNotification.secondaryTitle;
    const result = await Book.update(
      { id },
      {
        ...updateDonated,
      },
    );
    console.log(updateNotification.audioBookDuration);
    if (file) {
      const result2 = await AudioBook.create({
        forBook: id,
        fileName: file.filename,
        originalName: file.originalname,
      }).save();
      // return result ? 'success' : 'error';

      // return 'success';
      // }
      // else{
      //   return 'You need to be an administrator';
      // }
    }
    return updateNotification;
  }

  // async deleteNotification(id: number, user: { userId: number; userName: string; userRole: string }) {
  async deleteNotification(id: number) {
    // return (user.userRole == 'administrator' ?  await Book.createQueryBuilder('book').update().set({ status: 3 }).where("id = :id", { id: id }).execute() : 'You need to be an administrator');
    // return await Book.createQueryBuilder('book')
    //   .update()
    //   .set({ status: 7 })
    //   .where('id = :id', { id: id })
    //   .execute();
    return await Book.delete(id);
  }

  async removeDonatedNotification(id: number) {
    // return (user.userRole == 'administrator' ?  await Book.createQueryBuilder('book').update().set({ status: 3 }).where("id = :id", { id: id }).execute() : 'You need to be an administrator');
    // return await Book.createQueryBuilder('book')
    //   .update()
    //   .set({ isReadDonated: true })
    //   .where('id = :id', { id: id })
    //   .execute();
    return await Book.delete(id);
  }

  async removeAudioBook(id: number) {
    // return (user.userRole == 'administrator' ?  await Book.createQueryBuilder('book').update().set({ status: 3 }).where("id = :id", { id: id }).execute() : 'You need to be an administrator');
    const audioBook = await AudioBook.findOne({ id: id });
    const audioId = audioBook.forBook;
    if (audioBook) {
      await unlink('public/booksaudios/' + audioBook.fileName, (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      });
      await AudioBook.remove(audioBook);
    }
    return await this.getFullDonatedBooksById(+audioId);

    // return await Book.createQueryBuilder('book').update().set({ isReadDonated: true }).where("id = :id", { id: id }).execute();
  }

  async editAudio(
    updateAudioDto: UpdateAudioDto,
    // user: { userId: number; userName: string; userRole: string },
    file,
    id: number,
  ) {
    const audioBook = await AudioBook.findOneOrFail(updateAudioDto.id);
    let fileName = audioBook.fileName;
    if (file) {
      await unlink('public\\booksaudios\\' + audioBook.fileName, (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      });
      fileName = file.filename;
    }

    await AudioBook.update(
      { id },
      {
        // title: updateAudioDto.title,
        // audioBookDuration: updateAudioDto.audioBookDuration,
        // briefDescription: updateAudioDto.briefDescription,
        // manualyTags: updateAudioDto.manualyTags,
        // narrationCompanyName: updateAudioDto.narrationCompanyName,
        // narratorName: updateAudioDto.narratorName,
        // secondaryTitle: updateAudioDto.secondaryTitle,
        fileName: fileName,
        originalName: file.originalname || '',
      },
    );

    return updateAudioDto;
  }

  async approveBook(
    bookId: number,
    user: { userId: number; userName: string; userRole: string },
  ) {
    try {
      if (bookId == undefined) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Book id is undefined',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      const currentbook = await Book.findOne({ id: bookId });
      if (!currentbook) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: "Book with this id doesn't exist",
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (currentbook.status != 1) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: "This book isn't in queue",
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (user.userRole != 'administrator') {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: "You aren't administrator",
          },
          HttpStatus.FORBIDDEN,
        );
      }

      currentbook.status = 2;
      await currentbook.save();
      return 'success';
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async addAudio(
    addAudioDto: AddAudioDto,
    // user: { userId: number; userName: string; userRole: string },
    file,
  ) {
    try {
      if (file) {
        const currentbook = await Book.findOne({
          id: addAudioDto.id,
          // usersuggested: user.userId,
        });
        if (!currentbook) {
          await unlink(file.path, function (err) {
            if (err) console.log('Error: ' + err);
          });
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'There is no book with this id',
            },
            HttpStatus.FORBIDDEN,
          );
        }
        // if (user.userRole != 'administrator') {
        //   await unlink(file.path, function (err) {
        //     if (err) console.log('Error: ' + err);
        //   });
        //   throw new HttpException(
        //     {
        //       status: HttpStatus.FORBIDDEN,
        //       error: 'You are not an administrator',
        //     },
        //     HttpStatus.FORBIDDEN,
        //   );
        // }
        const fileExtension = file.filename.split('.')[1];
        await rename(
          file.path,
          'public/booksaudios/' +
            addAudioDto.id +
            '_' +
            (currentbook.audiocount + 1) +
            '.' +
            fileExtension,
          function (err) {
            if (err) console.log('Error: ' + err);
          },
        );
        currentbook.audiocount++;
        await currentbook.save();
        return 'success';
      } else {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'No file is in post',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async addBookImage(file: any, bookId: number) {
    if (!file) {
      throw new BadRequestException('File is missing');
    }

    const currentBook = await Book.findOne({ id: bookId });

    if (!currentBook) {
      throw new NotFoundException('Book not found');
    }

    if (currentBook.imageLink) {
      try {
        unlinkSync(`public/${currentBook.imageLink}`);
      } catch (err) {
        console.error(err);
      }
    }

    const fileName = file.filename;
    currentBook.imageLink = `booksimages/${fileName}`;

    await currentBook.save();

    return {
      success: true,
    };
  }

  async addPdf(
    id: number,
    // addAudioDto: AddAudioDto,
    // user: { userId: number; userName: string; userRole: string },
    file,
  ) {
    try {
      if (file) {
        const currentbook = await Book.findOne({
          id: id,
          // usersuggested: user.userId,
        });
        console.log('file1');
        if (!currentbook) {
          console.log('file2');
          await unlink(file.path, function (err) {
            if (err) console.log('Error: ' + err);
          });
          console.log('file3');
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'There is no book with this id',
            },
            HttpStatus.FORBIDDEN,
          );
        }
        console.log('file4');
        const fileExtension = file.filename.split('.')[1];
        console.log(fileExtension);
        console.log(file.path);
        await rename(
          file.path,
          'public/bookspdfs/' + id + '.' + fileExtension,
          function (err) {
            if (err) console.log('Error: ' + err);
          },
        );
        console.log('file5');
        currentbook.isPdfAdded = true;
        await currentbook.save();
        return 'success';
      } else {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'No file is in post',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async getAllUsers(pagination: { limit: number; skip: number }) {
    // const users = await User.find({
    //   select: [
    //     'id',
    //     'avatar',
    //     'birthday',
    //     'country',
    //     'donated',
    //     'email',
    //     'gender',
    //     'role',
    //     'name',
    //   ],
    // });
    const fields =
      'user.id, avatar, birthday, country, donated, email, gender, role, name, subscriptionStatus, start_date, end_date';
    const users = await getManager().query(
      `SELECT ${fields} FROM user LEFT JOIN subscription ON user.id = subscription.userId;`,
    );

    console.log(users);

    return users;
  }

  async getUser(id: number) {
    return await User.findOne({ id });
  }

  async editUser(userId: number, dto: EditUserDto) {
    const result = await User.update(userId, {
      ...dto,
    });

    console.log(result);
    return { success: true };
  }

  async deleteUser(userId: number) {
    await User.delete({
      id: userId,
    });

    return { success: true };
  }

  async getAudioBookFiles(bookId: number) {
    const audioBooks = await AudioBook.find({
      where: {
        forBook: bookId,
      },
    });

    return { audioBooks };
  }
}
