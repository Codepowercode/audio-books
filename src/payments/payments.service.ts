import {
  HttpException,
  HttpStatus,
  Injectable,
  SerializeOptions,
} from '@nestjs/common';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { configure, payment } from 'paypal-rest-sdk';
import { Payment } from './entities/payments.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class PaymentsService {
  async updateCard(
    updateCardInfo: UpdateCardDto,
    user: { userId: number; userName: string; userRole: string },
  ) {
    try {
      const currentCard = await Card.findOne({ userId: user.userId });
      if (!currentCard) {
        updateCardInfo['userId'] = user.userId;
        const newCard = await Card.create(updateCardInfo).save();
        if (newCard) {
          return 'success';
        } else {
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Card creating error',
            },
            HttpStatus.FORBIDDEN,
          );
        }
      }
      currentCard.cardNumber = updateCardInfo.cardNumber;
      currentCard.cardExpiring = updateCardInfo.cardExpiring;
      currentCard.cardCVV = updateCardInfo.cardCVV;
      currentCard.cardOwner = updateCardInfo.cardOwner;
      await currentCard.save();
      return 'success';
    } catch (error) {
      throw new HttpException(
        { status: error?.response?.status, error: error?.response?.error },
        error?.response?.status,
      );
    }
  }

  async getBookDonations(id: number) {
    // const donations = await Payment.find({
    //   bookId: id,
    //   status: 'verified'
    // });

    const donations = await Payment.createQueryBuilder('payment')
      .where('payment.bookId = :id', { id })
      .andWhere("payment.payment_type = 'donation_to_project'")
      .select([
        'payment.amount',
        'payment.updatedAt',
        'u.name',
        'u.isAvatarSet',
        'u.avatarExtension',
        'u.id',
      ])
      .andWhere('payment.status = :status', { status: 'verified' })
      .andWhere('u.id = payment.from_user')
      .innerJoin(User, 'u')
      .getRawMany();

    // return donations;

    if (!donations) {
      return {
        pledgers: [],
        total: {
          count: 0,
          amount: 0,
        },
      };
    }

    var amount = 0;
    var pledgers = [];

    donations.forEach((element) => {
      amount += element['payment_amount'];
      var pledgersObject = {};
      pledgersObject['image'] =
        process.env.HOST_URL +
        'usersimages/' +
        (element['u_isAvatarSet']
          ? element['u_id'] + '.' + element['u_avatarExtension']
          : 'default.png');
      pledgersObject['name'] = element['u_name'];
      pledgersObject['amount'] = element['payment_amount'];
      var donationDate = new Date(element['payment_updatedAt']);
      const month = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ];
      pledgersObject['date'] =
        (donationDate.getDate() < 10 ? '0' : '') +
        donationDate.getDate() +
        ' ' +
        month[donationDate.getMonth()] +
        ' ' +
        donationDate.getFullYear();
      pledgers.push(pledgersObject);
    });

    return {
      pledgers: pledgers,
      total: {
        count: donations.length,
        amount: amount,
      },
    };
  }
}
