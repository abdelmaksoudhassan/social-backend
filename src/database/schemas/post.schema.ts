import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ versionKey: false, timestamps: true })
export class Post {
  @Prop()
  text: string;

  @Prop({ required: false, ref: 'Media' })
  attached: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ default: [], ref: 'Comment' })
  comments: Array<Types.ObjectId>

  @Prop({ default: [], ref: 'Like' })
  likes: Array<Types.ObjectId>
}

export const PostSchema = SchemaFactory.createForClass(Post);
