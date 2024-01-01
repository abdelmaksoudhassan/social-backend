import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { Otp, OtpSchema } from 'src/database/schemas/otp.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/classes/jwt-strategy';
import { MulterModule } from '@nestjs/platform-express';
import * as config from 'config';

const {strategy,secret} = config.get('jwt')
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Otp.name, schema: OtpSchema }
        ]),
        JwtModule.register({
            secret
        }),
        PassportModule.register({defaultStrategy: strategy}),
        MulterModule.register({ dest: './uploads/avatars' })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
