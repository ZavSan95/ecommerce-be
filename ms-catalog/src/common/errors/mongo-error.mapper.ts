import { RpcException } from '@nestjs/microservices';
import { CatalogErrors } from './error-codes';

export function mapMongoError(error: any): never {

  if (error?.code === 11000) {
    throw new RpcException({
      statusCode: 409,
      ...CatalogErrors.SKU_DUPLICATE,
      meta: {
        field: Object.keys(error.keyPattern || {}),
        value: error.keyValue,
      },
    });
  }

  throw new RpcException({
    statusCode: 500,
    ...CatalogErrors.PRODUCT_CREATE_FAILED,
  });
}
