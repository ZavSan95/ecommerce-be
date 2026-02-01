import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({
  collection: 'favorites',
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
})
export class Favorite {
  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  productId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  sku: string;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index(
  { userId: 1, productId: 1, sku: 1 },
  { unique: true }
);
