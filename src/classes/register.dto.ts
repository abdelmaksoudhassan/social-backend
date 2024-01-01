import { IsEmail,MinLength, MaxLength, Length } from "class-validator"


export class RegisterDto{
    @IsEmail()
    email: string

    @MinLength(8)
    @MaxLength(25)
    password: string

    @Length(6)
    otp: number
}