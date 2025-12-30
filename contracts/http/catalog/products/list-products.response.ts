import { Product } from "../../../domain/product";

export interface ListProductsResponse {
  items: Product[];
  total: number;
}