import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Variant {
  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ type: Map, of: String })
  attributes: Record<string, string>;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isDefault: boolean;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
