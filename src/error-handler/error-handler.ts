import { BadRequestException, ConflictException, InternalServerErrorException, NotAcceptableException, NotFoundException, PayloadTooLargeException, UnauthorizedException, UnsupportedMediaTypeException } from "@nestjs/common"

export class CustomError extends Error{
    code: number

    constructor(code,message){
        super(message)
        this.code = code
    }
}

export function returnError(err) {
    if(err.code == 404){
        return new NotFoundException(err.message)
    }else if(err.code == 401){
        return new UnauthorizedException(err.message)
    }else if(err.code == 406){
        return new NotAcceptableException(err.message)
    }else if(err.code == 400){
        return new BadRequestException(err.message)
    }else if(err.code == 409){
        return new ConflictException(err.message)
    }else if(err.code == 413){
        return new PayloadTooLargeException(err.message)
    }else if(err.code == 415){
        return new UnsupportedMediaTypeException(err.message)
    }else{
        return new InternalServerErrorException(err)
    }
}