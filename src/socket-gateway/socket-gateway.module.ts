import { Module } from '@nestjs/common';
import { SocketGateWay } from './socket-gateway';
import { PassportModule } from '@nestjs/passport';
import * as config from 'config';

const {strategy} = config.get('jwt')
@Module({
    imports: [PassportModule.register({defaultStrategy: strategy}),],
    providers: [SocketGateWay],
    exports: [SocketGateWay]
})
export class SocketGeteWayModule {}