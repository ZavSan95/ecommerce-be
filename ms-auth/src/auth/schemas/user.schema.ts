import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  providers?: {
    google?: string;
    facebook?: string;
  };

  @Prop({
    type: [
      {
        tokenHash: String,
        createdAt: Date,
      },
    ],
    default: [],
  })
  refreshTokens: {
    tokenHash: string;
    createdAt: Date;
  }[];

}

export const UserSchema = SchemaFactory.createForClass(User);
