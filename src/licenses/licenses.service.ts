import { Injectable } from '@nestjs/common';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { License } from './entities/license.entity';

@Injectable()
export class LicensesService {
  create(createLicenseDto: CreateLicenseDto) {
    return 'This action adds a new license';
  }

  async findAll() {
    // return `This action returns all Licenses`;
    return await License.createQueryBuilder("license").getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} license`;
  }

  update(id: number, updateLicenseDto: UpdateLicenseDto) {
    return `This action updates a #${id} license`;
  }

  remove(id: number) {
    return `This action removes a #${id} license`;
  }
}
