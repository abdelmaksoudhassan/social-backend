import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { MailService } from './mail.service';
import { Response } from 'express'
@Controller('mail')
export class MailController {
    constructor(private mailService: MailService){}

    @Post('/otp')
    async confirmMail(@Body('email') email: string,@Res() res:Response){
        const returned = await this.mailService.Send_OTP_Mail(email)
        res.status(HttpStatus.OK).send(returned)
    }

    @Post('/password')
    async sendPassword(@Body('email') email: string,@Res() res:Response){
        const returned = await this.mailService.Send_Password_Mail(email)
        res.status(HttpStatus.OK).send(returned)
    }
}
