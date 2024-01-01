import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';
import { Model } from 'mongoose';
import { generate } from 'otp-generator'
import { Otp, OtpDocument } from 'src/database/schemas/otp.schema';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { CustomError, returnError } from 'src/error-handler/error-handler';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        @InjectModel(User.name) private User: Model<UserDocument>,
        @InjectModel(Otp.name) private Otp: Model<OtpDocument>
    ){}

    async Send_OTP_Mail(email: string): Promise<Object>{
        try {
            if(! isEmail(email)){
                throw new CustomError(400,'invalid email to send confirmation')
            }
            const exist = await this.User.findOne({email})
            const pending = await this.Otp.findOne({email})
            if(exist || pending){
                throw new CustomError(406,`${email} is already registered`)
            }
            const name = email.split('@')[0]
            const otp = generate(6, { lowerCaseAlphabets: false,  upperCaseAlphabets: false, specialChars: false }) 
            await this.mailerService.sendMail({
                to: email,
                subject: 'Confirm your Email',
                template: './confirmation',
                context: { name, otp },
            })
            await this.Otp.create({ email, otp})
            return { message: 'OTP code sent, Check your email' }
        } catch (error) {
            throw returnError(error)
        }
    }

    async Send_Password_Mail(email: string): Promise<Object>{
        try {
            if(! isEmail(email)){
                throw new CustomError(400,'invalid email to send password')
            }
            const user = await this.User.findOne({email})
            if(! user){
                throw new CustomError(404,`${email} not registered`)
            }
            const newPassword = generate(10, { lowerCaseAlphabets: false,  upperCaseAlphabets: false, specialChars: false }) 
            user.password = newPassword
            await user.save()
            const name = email.split('@')[0]
            await this.mailerService.sendMail({
                to: email,
                subject: 'New Password',
                template: './newpassword',
                context: { name, newPassword },
            })
            return { message: 'New password sent, Check your email' }
        } catch (error) {
            throw returnError(error)
        }
    }
}
