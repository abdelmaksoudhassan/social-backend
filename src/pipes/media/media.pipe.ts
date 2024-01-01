import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomError, returnError } from 'src/error-handler/error-handler';
import { deleteFile } from 'src/helpers/helpers';

@Injectable()
export class MediaPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if(! value){
      return
    }
    try {
      if(value.size > 1024*1024*5){
        deleteFile(value.path)
        throw new CustomError(413,'media size is too large')
      }
      if(
        (value.mimetype != 'image/png')&&(value.mimetype != 'image/jpeg')&&(value.mimetype != 'image/jpg')
        &&(value.mimetype != 'video/mp4')&&(value.mimetype != 'audio/mpeg')
      ){
        deleteFile(value.path)
        throw new CustomError(415,'This media not supported')
      }
      return value;
    } catch (error) {
      throw returnError(error)
    }
  }
}