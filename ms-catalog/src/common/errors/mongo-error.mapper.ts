import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CatalogErrors } from './error-codes';

export function mapMongoError(error: any): never {

  if (error?.code === 11000) {
    throw new ConflictException({
      ...CatalogErrors.SKU_DUPLICATE,
      meta: {
        field: Object.keys(error.keyPattern || {}),
        value: error.keyValue,
      },
    });
  }

  throw new InternalServerErrorException(
    CatalogErrors.PRODUCT_CREATE_FAILED,
  );
}
