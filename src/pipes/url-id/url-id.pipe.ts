import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomError } from 'src/error-handler/error-handler';

@Injectable()
export class UrlIdPipe implements PipeTransform {
  transform(value: {id: string}, metadata: ArgumentMetadata) {
    const { id } = value
    const extn = id.split('.')[1]
    if((extn == type.video) || (extn == type.audio)){
      return value;
    }
    throw new CustomError(400,'invalid media type')
  }
}

enum type{
  video = 'mp4',
  audio = 'mp3'
}
