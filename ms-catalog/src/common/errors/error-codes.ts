export const CatalogErrors = {
  SKU_DUPLICATE: {
    code: 'CATALOG_SKU_DUPLICATE',
    message: 'El SKU ya existe',
    status: 409,
  },

  PRODUCT_CREATE_FAILED: {
    code: 'CATALOG_PRODUCT_CREATE_FAILED',
    message: 'No se pudo crear el producto',
    status: 500,
  },
};
