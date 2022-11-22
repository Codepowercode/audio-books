import { Test, TestingModule } from '@nestjs/testing';
import { NarratorsService } from './narrators.service';

describe('NarratorsService', () => {
  let service: NarratorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NarratorsService],
    }).compile();

    service = module.get<NarratorsService>(NarratorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
