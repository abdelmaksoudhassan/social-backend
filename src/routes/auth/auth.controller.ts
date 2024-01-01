import { Body, Headers, Controller, HttpStatus, Post, Get, Patch, Req, Res, UseGuards, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/classes/register.dto';
import { Response, Request } from 'express'
import { Login } from 'src/classes/login';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { JwtPayload } from 'src/classes/jwt-payload';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UserNameDto } from 'src/classes/user-name.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarPipe } from 'src/pipes/avatar/avatar.pipe';
import { diskStorage } from 'multer';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('signup')
    async signup(@Body() registerDto:RegisterDto): Promise<Object>{
        return this.authService.signup(registerDto)
    }

    @Post('signin')
    async signin(
        @Res({ passthrough: true }) res: Response,
        @Body() login: Login
    ): Promise<any>{
        res.status(HttpStatus.OK)
        const user = await this.authService.signin(login)
        const payload: JwtPayload = { _id: user._id, email: user.email } 
        const {access, refresh} = await this.authService.generateJwt(payload)
        return { user, access, refresh}
    }

    @Get('refresh')
    refrshToken(@Req() req: Request, @Headers('refresh') refresh: string): string{
        return this.authService.generateNewToken(refresh)
    }


    @Post('auto-login')
    @UseGuards(AuthGuard())
    autoLogin(@GetUser() user: User,@Res({ passthrough: true }) res: Response){
        res.status(HttpStatus.OK)
        return user
    }

    @Get('user/:id')
    getUserData(@Param('id') id:Types.ObjectId):Promise<User>{
        return this.authService.getUserById(id)
    }

    @Patch('user-name')
    @UseGuards(AuthGuard())
    async updateName(@Body() userNameDto:UserNameDto,@GetUser() user: UserDocument):Promise<User>{
        const {_id} = user
        return this.authService.updateUserName(userNameDto,_id)
    }

    @Patch('avatar')
    @UseGuards(AuthGuard())
    @UseInterceptors(
        FileInterceptor('avatar',{
            storage: diskStorage({
                filename: function (req, file, cb) {
                    cb(null, (Date.now()+'-social-'+file.originalname).replace(/ /g,""))
                },
                destination: function (req, file, cb) {
                    cb(null, 'uploads/avatars')
                },
            })
        })
    )
    async uploadAvatar(
        @GetUser() user: UserDocument,
        @UploadedFile(AvatarPipe) file:Express.Multer.File
    ):Promise<User>{
        return this.authService.updateAvatar(user,file.filename)
    }
}
