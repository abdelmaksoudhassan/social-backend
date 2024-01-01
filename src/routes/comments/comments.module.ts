import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from 'src/database/schemas/comment.schema';
import { PassportModule } from '@nestjs/passport';
import { Post, PostSchema } from 'src/database/schemas/post.schema';
import * as config from 'config';
import { SocketGeteWayModule } from 'src/socket-gateway/socket-gateway.module';

const {strategy} = config.get('jwt')
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema }
    ]),
    PassportModule.register({defaultStrategy: strategy}),
    SocketGeteWayModule
  ],
  providers: [CommentsService,
  ],
  controllers: [CommentsController]
})
export class CommentsModule {}
