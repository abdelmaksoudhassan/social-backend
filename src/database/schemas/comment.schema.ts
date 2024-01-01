import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ versionKey: false, timestamps: true })
export class Comment {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true, ref: 'User' })
  owner: Types.ObjectId;
} 

export const CommentSchema = SchemaFactory.createForClass(Comment);