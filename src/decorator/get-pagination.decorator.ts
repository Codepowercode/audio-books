import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetPagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const query = request.query;

    const page = Math.abs(query.page) || 1;
    const limit: number = Math.abs(query.limit) || 10;
    const skip: number = (page - 1) * limit;

    delete query.page;
    delete query.limit;

    return {
      skip,
      limit,
    };
  },
);
