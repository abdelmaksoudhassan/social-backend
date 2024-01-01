import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({ versionKey: false, timestamps: true })
export class Like {
  @Prop({ required: true, ref: 'User'  })
  user: Types.ObjectId;

  @Prop({ required: true, ref: 'Post' })
  post: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);