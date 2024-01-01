import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/database/schemas/post.schema';
import { Media, MediaSchema } from 'src/database/schemas/media.schema';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import * as config from 'config';
import { SocketGeteWayModule } from 'src/socket-gateway/socket-gateway.module';
import { Like, LikeSchema } from 'src/database/schemas/like.schema';
import { Comment, CommentSchema } from 'src/database/schemas/comment.schema';

const {strategy} = config.get('jwt')
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema }
    ]),
    PassportModule.register({defaultStrategy: strategy}),
    MulterModule.register({ dest: './uploads/posts' }),
    SocketGeteWayModule
  ],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
