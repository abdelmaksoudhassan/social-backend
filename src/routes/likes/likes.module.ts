import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from 'src/database/schemas/like.schema';
import { Post, PostSchema } from 'src/database/schemas/post.schema';
import { PassportModule } from '@nestjs/passport';
import * as config from 'config';
import { SocketGeteWayModule } from 'src/socket-gateway/socket-gateway.module';

const {strategy} = config.get('jwt')
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    PassportModule.register({defaultStrategy: strategy}),
    SocketGeteWayModule
  ],
  controllers: [LikesController],
  providers: [LikesService]
})
export class LikesModule {}
