import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: { updatedAt: false }, versionKey: false })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp).index(
  {'createdAt': 1},
  {expireAfterSeconds: 60*60*24 } //expires after 1 day
);
