import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Variant, VariantSchema } from './variant.schema';
import { Category } from '../../categories/schemas/category.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: [VariantSchema],
    validate: [
      (v: Variant[]) => v.length > 0,
      'Product must have at least one variant',
    ],
  })
  variants: Variant[];

  @Prop({ default: 'active' })
  status: 'active' | 'inactive';
}

export const ProductSchema = SchemaFactory.createForClass(Product);
