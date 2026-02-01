import { ApiError } from "../interfaces/api-error.interface";


/* =======================
   CATEGORY
======================= */
export const CategoryErrors: Record<string, ApiError> = {
  CATEGORY_CREATE_FAILED: {
    code: 'CATEGORY_CREATE_FAILED',
    message: 'No se pudo crear la categoría',
  },

  CATEGORY_DELETE_FAILED: {
    code: 'CATEGORY_DELETE_FAILED',
    message: 'No se pudo eliminar la categoría',
  },
};

/* =======================
   PRODUCT
======================= */
export const ProductErrors: Record<string, ApiError> = {
  PRODUCT_CREATE_FAILED: {
    code: 'PRODUCT_CREATE_FAILED',
    message: 'No se pudo crear el producto',
  },

  PRODUCT_UPDATE_FAILED: {
    code: 'PRODUCT_UPDATE_FAILED',
    message: 'No se pudo actualizar el producto',
  },
};

/* =======================
   FAVORITES
======================= */
export const FavoriteErrors: Record<string, ApiError> = {
  FAVORITE_ADD_ERROR: {
    code: 'FAVORITE_ADD_ERROR',
    message: 'No se pudo añadir a favoritos',
  },

  FAVORITE_ALREADY_EXISTS: {
    code: 'FAVORITE_ALREADY_EXISTS',
    message: 'El producto ya está en favoritos',
  },

  FAVORITE_REMOVE_ERROR: {
    code: 'FAVORITE_REMOVE_ERROR',
    message: 'No se pudo quitar de favoritos',
  }
};
