import { IsAlpha, MaxLength, MinLength } from "class-validator"

export class UserNameDto{
    @IsAlpha()
    @MinLength(3)
    @MaxLength(25)
    
    firstName: string
    @IsAlpha()
    @MinLength(3)
    @MaxLength(25)
    lastName: string
}