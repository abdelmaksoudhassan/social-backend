import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from 'src/database/schemas/otp.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                service: 'gmail',
                auth: {
                    user: 'privateperson9082@gmail.com',
                    pass: 'qkek qqrj odyv ovai'
                }
            },
            defaults: {
              from: '"No Reply" <noreply@gmail.com>',
            },
            template: {
              dir: join(__dirname, 'templates'),
              adapter: new HandlebarsAdapter(),
              options: {
                strict: true,
              },
            },
        }),
        MongooseModule.forFeature([
          { name: Otp.name, schema: OtpSchema },
          { name: User.name, schema: UserSchema }
        ]),
    ],
    controllers: [MailController],
    providers: [MailService]
})
export class MailModule {}
