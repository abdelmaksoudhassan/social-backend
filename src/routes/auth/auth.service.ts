import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Otp, OtpDocument } from 'src/database/schemas/otp.schema';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { Login } from 'src/classes/login';
import { RegisterDto } from 'src/classes/register.dto';
import { JwtPayload } from 'src/classes/jwt-payload';
import { JwtService } from '@nestjs/jwt'
import { Tokens } from 'src/classes/tokens';
import { UserNameDto } from 'src/classes/user-name.dto';
import { deleteFile } from 'src/helpers/helpers';
import { CustomError, returnError } from 'src/error-handler/error-handler';
import { join } from 'path';

@Injectable()
export class AuthService {
    constructor(
      @InjectModel(User.name) private User:Model<UserDocument>,
      @InjectModel(Otp.name) private Otp:Model<OtpDocument>,
      private jwtService: JwtService,
    ){}

     async signup(registerDto: RegisterDto): Promise<Object>{
      const {email, password, otp} = registerDto
      try {
        const exist = await this.User.findOne({email})
        if(exist){
          throw new CustomError(406,`${email} is already registered`)
        }
        const pending = await this.Otp.findOne({email})
        if(! pending){
          throw new CustomError(400,`${email} is wrong`)
        }
        const verify = await this.Otp.findOne({email,otp})
        if(! verify){
          throw new CustomError(404,`${otp} is wrong`)
        }
        await this.Otp.deleteOne({email, otp})
        await this.User.create({email,password})
        return { message: 'Registered successfully' }
      } catch (error) {
        throw returnError(error)
      }
     }

     async signin(login: Login): Promise<UserDocument>{
      const {email, password} = login
      try {
        const user = await this.User.findOne({email})
        if(! user){
          throw new CustomError(404,`email ${email} not found`)
        }
        const equaled = await this.validatePassword(password,user.password)
        if(! equaled){
          throw new CustomError(401,'wrong password')
        }
        return user
      } catch (error) {
        throw returnError(error)
      }
     }

     async generateJwt(payload :JwtPayload):Promise<Tokens>{
      try {
        const accesToken = await this.jwtService.sign(payload,{ expiresIn: '1d' })
        const refreshToken = await this.jwtService.sign(payload, { expiresIn: '7d' });
        const tokens: Tokens = { access: accesToken,refresh: refreshToken }
        return tokens
      } catch (error) {
        throw returnError(error)
      }
     }

     generateNewToken(refreshToken: string): string{
      try {
        if(! refreshToken){
          throw new CustomError(401,'Access Denied. No refresh token provided')
        }
        const decoded = this.jwtService.verify(refreshToken)
        const jwtPayload: JwtPayload = {_id: decoded._id, email: decoded.email}
        const newToken = this.jwtService.sign(jwtPayload ,{ expiresIn: '1d' })
        return newToken
      } catch (error) {
        throw returnError(error)
      }
     }
     
     private async validatePassword(password: string, hashed: string): Promise<Boolean>{
      return await compare(password,hashed)
     }

     async validateUser(jwtpayload:JwtPayload):Promise<User>{
        const { _id, email} = jwtpayload
        const user = await this.User.findOne({ _id: new Types.ObjectId(_id), email })
        return user
     }

     async updateUserName(userNameDto:UserNameDto,_id:Types.ObjectId): Promise<User>{
      const {firstName, lastName} = userNameDto
      try {
        const updated = await this.User.findOneAndUpdate({_id},{$set:{firstName,lastName}},{new: true})
        return updated
      } catch (error) {
        throw returnError(error)
      }
     }

     async updateAvatar(user:UserDocument,url: string):Promise<User>{
      try {
        const { avatar, _id} = user
        const updated = await this.User.findOneAndUpdate({_id},{$set:{avatar: url}},{new: true})
        if(avatar){
          deleteFile(join(__dirname,'../../../','/uploads/avatars',avatar))
        }
        return updated
      } catch (error) {
        console.log(error)
        throw returnError(error)
      }
     }

     async getUserById(id: Types.ObjectId): Promise<User>{
      try {
        if(! isValidObjectId(id)){
          throw new CustomError(400,`${id} is invalid id`)
        }
        const user = await this.User.findById(id)
        if(! user){
          throw new CustomError(404,`user with id ${id} not exist`)
        }
        return user
      } catch (error) {
        throw returnError(error)
      }
     }
}
