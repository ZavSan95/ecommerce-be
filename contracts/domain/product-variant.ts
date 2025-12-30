import { ProductImage } from "./product-image";

export interface ProductVariant {
  id: string;
  productId: string;

  sku: string;
  price: number;
  stock?: number;

  attributes: Record<string, string>; 

  images: ProductImage[];

  active: boolean;
}