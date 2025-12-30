import { Injectable } from '@nestjs/common';
import { Product } from '@ecommerce/contracts';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  create(data: { name: string; description?: string }): Product {
    const product: Product = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      active: true,
      createdAt: new Date().toISOString(),
    };

    this.products.push(product);
    return product;
  }

  findAll(): Product[] {
    return this.products;
  }
}
