import { PassportStrategy } from "@nestjs/passport";
import { Strategy,ExtractJwt } from 'passport-jwt'
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "src/routes/auth/auth.service";
import { JwtPayload } from "./jwt-payload";
import * as config from 'config';

const {secret} = config.get('jwt')
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService){
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: secret
        });
    }

    async validate(jwtpayload:JwtPayload): Promise<any> {
      const user = await this.authService.validateUser(jwtpayload);
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    }
}