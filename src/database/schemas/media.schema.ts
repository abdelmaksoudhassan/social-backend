import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { join } from 'path';
import { deleteFile } from 'src/helpers/helpers';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ versionKey: false })
export class Media {
  @Prop({ required: true, type: String })
  url: string;

  @Prop({ required: true, type: String })
  type: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media).post('findOneAndDelete',function(doc,next){
  if(doc && doc.url){
    deleteFile(join(__dirname,'../../../','/uploads/media',doc.url))
  }
  next()
}).post('findOneAndUpdate',function(doc,next){
  if(doc){
    deleteFile(join(__dirname,'../../../','/uploads/media',doc.url))
  }
  next()
});