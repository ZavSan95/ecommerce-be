import { RpcException } from '@nestjs/microservices';
import { ApiError } from '../interfaces/api-error.interface';

export function mapMongoError(
  error: any,
  fallbackError: ApiError,
): never {

  // Duplicate key (unique index)
  if (error?.code === 11000) {
    throw new RpcException({
      statusCode: 409,
      ...fallbackError,
      meta: {
        field: Object.keys(error.keyPattern || {}),
        value: error.keyValue,
      },
    });
  }

  // Error genérico Mongo
  throw new RpcException({
    statusCode: 500,
    ...fallbackError,
  });
}
