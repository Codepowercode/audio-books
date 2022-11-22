import { Test, TestingModule } from '@nestjs/testing';
import { NarratorsController } from './narrators.controller';
import { NarratorsService } from './narrators.service';

describe('NarratorsController', () => {
  let controller: NarratorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NarratorsController],
      providers: [NarratorsService],
    }).compile();

    controller = module.get<NarratorsController>(NarratorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
