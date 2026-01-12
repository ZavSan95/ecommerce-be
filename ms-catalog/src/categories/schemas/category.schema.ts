import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CategoryStatus } from '../enum/category-status.enum';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true, // createdAt / updatedAt
})
export class Category {

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: false,
    trim: true,
  })
  description?: string;

  @Prop({
    type: String,
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    required: true,
  })
  status: CategoryStatus;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
