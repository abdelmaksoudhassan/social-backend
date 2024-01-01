import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { createReadStream, existsSync, statSync } from 'fs';
import { UrlIdPipe } from './pipes/url-id/url-id.pipe';
import { CustomError, returnError } from './error-handler/error-handler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/media/:id')
  readMedia(@Param(UrlIdPipe) params: {id: string}, @Req() req: Request, @Res() res:Response){
    try {
      const { id } = params
      const extn = id.split('.')[1]
      const range = req.headers.range;
      if (!range) {
        throw new CustomError(404,"Requires Range header")
      }
      const mediaPath = `uploads/media/${id}`;
      const exist = existsSync(mediaPath)
      if(! exist){
        throw new CustomError(404,'no media for this url')
      }
      const file = statSync(mediaPath)
      const mediaSize = file.size;
      const CHUNK_SIZE = 10 ** 6; 
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, mediaSize - 1);
      const contentLength = end - start + 1;
      const headers = {
          "Content-Range": `bytes ${start}-${end}/${mediaSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": extn == 'mp4' ? "video/mp4" : "audio/mp3",
      };
      res.writeHead(206, headers);
      const mediaStream = createReadStream(mediaPath, { start, end });
      mediaStream.pipe(res);
    } catch (error) {
      throw returnError(error)
    }
  }
}