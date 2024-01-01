import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomError, returnError } from 'src/error-handler/error-handler';
import { deleteFile } from 'src/helpers/helpers';

@Injectable()
export class AvatarPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    try {
      if(! value){
        throw new CustomError(400,'please select file')
      }
      if((value.mimetype != 'image/png')&&(value.mimetype != 'image/jpeg')&&(value.mimetype != 'image/jpg')){
        deleteFile(value.path)
        throw new CustomError(415,'This media not supported')
      }
      if(value.size > 1024*1024){
        deleteFile(value.path)
        throw new CustomError(413,'avatar size is too large')
      }
      return value;
    } catch (error) {
      throw returnError(error)
    }
  }
}