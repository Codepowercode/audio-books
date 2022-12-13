import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Response,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateCardDto } from './dto/update-card.dto';
import { PaymentsService } from './payments.service';
import { configure, payment, Payment as IPayment } from 'paypal-rest-sdk';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payments.entity';
import { Book } from 'src/books/entities/book.entity';
import { Subscription } from './entities/subscription.entity';
import { MoreThan } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly authService: AuthService,
  ) {
    this.configurePaypal();
  }

  private configurePaypal() {
    configure({
      mode: process.env.PAYPAL_MODE,
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_SECRET_KEY,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('updateCard')
  updateCard(@Body() updateCardInfo: UpdateCardDto, @Request() req) {
    return this.paymentService.updateCard(updateCardInfo, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pay')
  async pay(
    @Request() req,
    @Response() res,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    // return await this.paymentService.pay();
    this.configurePaypal();
    console.log(createPaymentDto.bookId);
    console.log(createPaymentDto.amount);
    console.log(req.user.userId);

    const create_payment_json: IPayment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: process.env.HOST_URL + 'payments/success',
        cancel_url: process.env.HOST_URL + 'payments/cancel',
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'Book' + createPaymentDto.bookId,
                sku: req.user.userId,
                price: String(createPaymentDto.amount),
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: String(createPaymentDto.amount),
          },
          description: 'Book donation',
        },
      ],
    };

    // return 1;
    await payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            console.log(payment.links[i].href);
            createPaymentDto['from_user'] = req.user.userId;
            const url = new URL(payment.links[i].href);
            createPaymentDto['token'] = url.searchParams.get('token');
            createPaymentDto['payment_type'] = 'donation_to_project';
            Payment.create(createPaymentDto).save();
            res.send(payment.links[i].href);
            // return payment.links[i].href;
            break;
          }
        }
      }
    });
  }

  @Get('success')
  async success(@Query() query, @Response() res) {
    console.log('un success');
    const currentPayment = await Payment.findOneOrFail({
      token: query.token,
    });
    const currentBook = await Book.findOneOrFail({
      id: currentPayment.bookId,
    });
    const payerId = query.PayerID;
    const paymentId = query.paymentId;
    const execute_payment_json = {
      payer_id: payerId,
      // payment_id: paymentId
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: currentPayment.amount,
          },
        },
      ],
    };

    await payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment: any) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          // let iserror = false;
          if (payment.id == query.paymentId) {
            // if (payment.state != 'approved') {
            //   console.log('payment.state');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.cart != query.token.substring(3)) {
            //   console.log('payment.cart');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.payer.status != 'VERIFIED') {
            //   console.log('payment.payer.status');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.payer.payer_info.payer_id != payerId) {
            //   console.log('payment.payer.payer_info.payer_id');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   parseFloat(payment.transactions[0].amount.total) !=
            //   currentPayment.amount
            // ) {
            //   console.log('payment.transactions[0].amount');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   payment.transactions[0].item_list.items[0].name !=
            //   'Book' + currentPayment.bookId
            // ) {
            //   console.log('payment.item_list.items[0].name');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   payment.transactions[0].item_list.items[0].sku !=
            //   currentPayment.from_user
            // ) {
            //   console.log('payment.item_list.items[0].sku');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   payment.transactions[0].item_list.items[0].price !=
            //   currentPayment.amount
            // ) {
            //   console.log('payment.item_list.items[0].price');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   currentPayment.status == 'verified' ||
            //   currentPayment.status == 'cancelled'
            // ) {
            //   console.log('currentPayment.status');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }

            // if (!iserror) {
            currentPayment.status = 'verified';
            currentPayment.payer_email = payment.payer.payer_info.email;
            if (
              currentBook.donated + currentPayment.amount >=
              currentBook.goal
            ) {
              currentBook.status = 3;
            }
            currentBook.donated += currentPayment.amount;
            currentBook.save();

            if (currentPayment.amount > 50) {
              const start_date = new Date();
              const end_date = new Date(
                start_date.setFullYear(start_date.getFullYear() + 1),
              );

              const user = await User.findOne(currentPayment.from_user);

              const subscriptionPayload = {
                user,
                start_date: new Date(),
                end_date: end_date,
              };

              const subscriptions = Subscription.createQueryBuilder(
                'subscription',
              )
                .where('userId = :id', { id: currentPayment.from_user })
                .andWhere({
                  end_date: MoreThan(Date.now()),
                })
                .getOne();

              if (subscriptions == undefined) {
                const newSubscription =
                  Subscription.create(subscriptionPayload);
                newSubscription.save();
              }
            }

            await User.update(currentPayment.from_user, {
              contributed: true,
            });

            currentPayment.save();
            // res.send('success');
            res.redirect(process.env.FRONT_URL);
            // }
          } else {
            // res.send('error');
            res.redirect(process.env.FRONT_URL);
          }
        }
      },
    );
  }

  @Get('cancel')
  async cancel(@Query() query, @Response() res) {
    console.log('un cancel');
    const currentPayment = await Payment.findOneOrFail({
      token: query.token,
    });
    if (currentPayment.status == 'query') {
      currentPayment.status = 'cancelled';
      currentPayment.save();
    }
    // return 'cancelled';
    await res.redirect(process.env.FRONT_URL);
  }

  @Get('getBookDonations/:id')
  async getBookDonations(@Param('id') id: number) {
    return await this.paymentService.getBookDonations(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('buy-subscription-month')
  async buySubscriptionForMonth(@Request() req, @Response() res) {
    this.configurePaypal();
    console.log(req.user.userId);

    const subscriptions = await Subscription.createQueryBuilder('subscription')
      .where('userId = :id', { id: req.user.userId })
      .andWhere({
        end_date: MoreThan(Date.now()),
      })
      .getOne();

    if (subscriptions !== undefined) {
      res.send(
        'You already have an active subscription, it will end in ' +
          subscriptions.end_date.toDateString(),
      );
      return 'fail';
    }

    const create_payment_json: IPayment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url:
          process.env.HOST_URL + 'payments/success-one-month-subscription',
        cancel_url: process.env.HOST_URL + 'payments/cancel',
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'SubscriptionMonth',
                sku: req.user.userId,
                price: '6.99',
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: '6.99',
          },
          description: 'One month subscription buying',
        },
      ],
    };

    // return 1;
    payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            console.log(payment.links[i].href);
            const url = new URL(payment.links[i].href);
            const paymentPayload = {
              from_user: req.user.userId,
              token: url.searchParams.get('token'),
              payment_type: 'subscription_month',
            };
            Payment.create(paymentPayload).save();
            // await User.update(req.user.userId, {
            //   subscriptionStatus: () => 'MONTH',
            // });
            res.send(payment.links[i].href);
            // return payment.links[i].href;
            break;
          }
        }
      }
    });
  }

  @Get('success-one-month-subscription')
  async successOneMonthSubscription(@Query() query, @Response() res) {
    const currentPayment = await Payment.findOneOrFail({
      token: query.token,
    });
    // const currentBook = await Book.findOneOrFail({
    //   'id': currentPayment.bookId
    // });
    const payerId = query.PayerID;
    const paymentId = query.paymentId;
    const execute_payment_json = {
      payer_id: payerId,
      // payment_id: paymentId
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: 6.99,
          },
        },
      ],
    };

    await payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment: any) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          const iserror = false;
          if (payment.id == query.paymentId) {
            // if (payment.state != 'approved') {
            //   console.log('payment.state');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.cart != query.token.substring(3)) {
            //   console.log('payment.cart');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.payer.status != 'VERIFIED') {
            //   console.log('payment.payer.status');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.payer.payer_info.payer_id != payerId) {
            //   console.log('payment.payer.payer_info.payer_id');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (parseFloat(payment.transactions[0].amount.total) != 6.99) {
            //   console.log('payment.transactions[0].amount');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if(payment.transactions[0].item_list.items[0].name != 'Book'+currentPayment.bookId){
            //     console.log('payment.item_list.items[0].name');
            //     // res.send('error');
            //     res.redirect(process.env.FRONT_URL);
            //     iserror = true;
            // }
            // if (
            //   payment.transactions[0].item_list.items[0].sku !=
            //   currentPayment.from_user
            // ) {
            //   console.log('payment.item_list.items[0].sku');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.transactions[0].item_list.items[0].price != 6.99) {
            //   console.log('payment.item_list.items[0].price');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   currentPayment.status == 'verified' ||
            //   currentPayment.status == 'cancelled'
            // ) {
            //   console.log('currentPayment.status');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            if (!iserror) {
              currentPayment.status = 'verified';
              currentPayment.payer_email = payment.payer.payer_info.email;

              const start_date = new Date();
              const end_date = new Date(
                start_date.setMonth(start_date.getMonth() + 1),
              );

              const user = await User.findOne(currentPayment.from_user);

              const subscriptionPayload = {
                user,
                subscriptionStatus: 'MONTH',
                start_date: new Date(),
                end_date: end_date,
              };

              const newSubscription = Subscription.create(subscriptionPayload);
              await newSubscription.save();
              await currentPayment.save();

              res.redirect(process.env.FRONT_URL);
            }
          } else {
            // res.send('error');
            res.redirect(process.env.FRONT_URL);
          }
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('buy-subscription-year')
  async buySubscriptionForYear(@Request() req, @Response() res) {
    this.configurePaypal();
    console.log(req.user.userId);

    const subscriptions = await Subscription.createQueryBuilder('subscription')
      .where('userId = :id', { id: req.user.userId })
      .andWhere({
        end_date: MoreThan(Date.now()),
      })
      .getOne();

    if (subscriptions !== undefined) {
      res.send(
        'You already have an active subscription, it will end in ' +
          subscriptions.end_date.toDateString(),
      );
      return 'fail';
    }

    const create_payment_json: IPayment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url:
          process.env.HOST_URL + 'payments/success-one-year-subscription',
        cancel_url: process.env.HOST_URL + 'payments/cancel',
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'SubscriptionYear',
                sku: req.user.userId,
                price: '50.0',
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: '50.0',
          },
          description: 'One year subscription buying',
        },
      ],
    };

    // return 1;
    await payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            console.log(payment.links[i].href);
            const url = new URL(payment.links[i].href);
            const paymentPayload = {
              from_user: req.user.userId,
              token: url.searchParams.get('token'),
              payment_type: 'subscription_year',
            };
            Payment.create(paymentPayload).save();
            // await User.update(req.user.userId, {
            //   subscriptionStatus: () => 'YEAR',
            // });
            res.send(payment.links[i].href);
            // return payment.links[i].href;
            break;
          }
        }
      }
    });
  }

  @Get('success-one-year-subscription')
  async successOneYearSubscription(@Query() query, @Response() res) {
    const currentPayment = await Payment.findOneOrFail({
      token: query.token,
    });
    // const currentBook = await Book.findOneOrFail({
    //   'id': currentPayment.bookId
    // });
    const payerId = query.PayerID;
    const paymentId = query.paymentId;
    const execute_payment_json = {
      payer_id: payerId,
      // payment_id: paymentId
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: 50.0,
          },
        },
      ],
    };

    await payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment: any) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          const iserror = false;
          if (payment.id == query.paymentId) {
            // if (payment.state != 'approved') {
            //   console.log('payment.state');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.cart != query.token.substring(3)) {
            //   console.log('payment.cart');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.payer.status != 'VERIFIED') {
            //   console.log('payment.payer.status');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.payer.payer_info.payer_id != payerId) {
            //   console.log('payment.payer.payer_info.payer_id');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (parseFloat(payment.transactions[0].amount.total) != 50.0) {
            //   console.log('payment.transactions[0].amount');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if(payment.transactions[0].item_list.items[0].name != 'Book'+currentPayment.bookId){
            //     console.log('payment.item_list.items[0].name');
            //     // res.send('error');
            //     res.redirect(process.env.FRONT_URL);
            //     iserror = true;
            // }
            // if (
            //   payment.transactions[0].item_list.items[0].sku !=
            //   currentPayment.from_user
            // ) {
            //   console.log('payment.item_list.items[0].sku');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (payment.transactions[0].item_list.items[0].price != 50.0) {
            //   console.log('payment.item_list.items[0].price');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            // if (
            //   currentPayment.status == 'verified' ||
            //   currentPayment.status == 'cancelled'
            // ) {
            //   console.log('currentPayment.status');
            //   // res.send('error');
            //   res.redirect(process.env.FRONT_URL);
            //   iserror = true;
            // }
            if (!iserror) {
              currentPayment.status = 'verified';
              currentPayment.payer_email = payment.payer.payer_info.email;

              const start_date = new Date();
              const end_date = new Date(
                start_date.setFullYear(start_date.getFullYear() + 1),
              );

              const user = await User.findOne(currentPayment.from_user);

              const subscriptionPayload = {
                user,
                subscriptionStatus: 'YEAR',
                start_date: new Date(),
                end_date: end_date,
              };

              const newSubscription = Subscription.create(subscriptionPayload);
              newSubscription.save();

              currentPayment.save();
              // res.send('success');
              res.redirect(process.env.FRONT_URL);
            }
          } else {
            // res.send('error');
            res.redirect(process.env.FRONT_URL);
          }
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user-subscription')
  async getUserSubscription(@Request() req, @Response() res) {
    const subscriptions = await Subscription.createQueryBuilder('subscription')
      .where('userId = :id', { id: req.user.userId })
      .andWhere({
        end_date: MoreThan(Date.now()),
      })
      .getOne();

    const donations = await Payment.find({
      from_user: req.user.userId,
      payment_type: 'donation_to_project',
    });

    let donated = 0;
    const donatedToBooks = {};

    donations.forEach((donation) => {
      donated += donation.amount;
      donation.bookId in donatedToBooks
        ? (donatedToBooks[donation.bookId] += donation.amount)
        : (donatedToBooks[donation.bookId] = donation.amount);
    });

    const payload: any = {
      userId: req.user.userId,
      userName: req.user.userName,
      userRole: req.user.userRole,
      userEmail: req.user.userEmail,
      avatar: req.user.avatar || '',
      userDonations: donated,
      userDonationsToBooks: donatedToBooks,
    };

    if (subscriptions !== undefined) {
      payload.userSubscriptionDueTo = subscriptions.end_date;
      payload.userSubscriptionActive = true;
    } else {
      payload.userSubscriptionDueTo = '';
      payload.userSubscriptionActive = false;
    }

    res.json({
      access_token: await this.authService.signJWT(payload),
    });
  }
}
