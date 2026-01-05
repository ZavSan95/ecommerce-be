export interface CheckoutValidatedItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  availableStock: number;
}

export interface CheckoutValidationResponse {
  items: CheckoutValidatedItem[];
}