import { HttpException, HttpStatus } from '@nestjs/common';

export function mapAxiosError(error: any): never {

  // 🔹 Error RPC directo
  if (error?.statusCode && error?.message) {
    throw new HttpException(
      {
        code: error.code,
        message: error.message,
        meta: error.meta,
      },
      error.statusCode,
    );
  }

  // 🔹 Error RPC envuelto (MUY común)
  if (error?.error?.statusCode && error?.error?.message) {
    throw new HttpException(
      {
        code: error.error.code,
        message: error.error.message,
        meta: error.error.meta,
      },
      error.error.statusCode,
    );
  }

  // 🔹 Servicio caído
  if (
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT'
  ) {
    throw new HttpException(
      {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Servicio no disponible',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  // 🔹 Fallback REAL (ahora sí)
  throw new HttpException(
    {
      code: 'GATEWAY_ERROR',
      message: 'Error inesperado en el gateway',
      raw: error?.message ?? error,
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
