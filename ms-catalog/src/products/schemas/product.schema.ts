    import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
    import { Document } from 'mongoose';
    import { Variant, VariantSchema } from './variant.schema';

    export type ProductDocument = Product & Document;

    @Schema({ timestamps: true })
    export class Product {
      @Prop({ required: true })
      name: string;

      @Prop()
      description?: string;

      @Prop({ required: true })
      category: string;

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
