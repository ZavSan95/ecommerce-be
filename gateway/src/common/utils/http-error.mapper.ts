import { HttpException, HttpStatus } from '@nestjs/common';

export function mapAxiosError(error: any): never {

  // 🔹 Error HTTP del microservicio
  if (error.response) {
    throw new HttpException(
      error.response.data,   // 👈 lo que devuelve ms-catalog
      error.response.status, // 👈 409
    );
  }

  // 🔹 Timeout / conexión / ms caído
  if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
    throw new HttpException(
      {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Servicio no disponible',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  // 🔹 Fallback
  throw new HttpException(
    {
      code: 'GATEWAY_ERROR',
      message: 'Error inesperado en el gateway',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
