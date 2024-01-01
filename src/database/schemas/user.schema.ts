import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  avatar: string;

  @Prop({ required: true, unique: true})
  email: string;

  @Prop({ required: true, minlength: 8, maxlength: 25 })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User).pre('save',async function (next){
  if (this.isModified('password')) {
      const salt = await genSalt(10)
      const hashedPassword = await hash(this.password,salt)
      this.password = hashedPassword
  }
  next()
});

UserSchema.methods.toJSON = function(){
  const user = this.toObject()
  delete user.password
  return user
}