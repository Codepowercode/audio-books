import { Test, TestingModule } from '@nestjs/testing';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';

describe('LicensesController', () => {
  let controller: LicensesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicensesController],
      providers: [LicensesService],
    }).compile();

    controller = module.get<LicensesController>(LicensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});