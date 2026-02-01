export class FavoriteResponseDto {
  id: string;
  productId: string;
  sku: string;

  product: {
    name: string;
    image?: string;
    category?: string;
  };
}
