import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as config from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './routes/mail/mail.module';
import { AuthModule } from './routes/auth/auth.module';
import { PostsModule } from './routes/posts/posts.module';
import { CommentsModule } from './routes/comments/comments.module';
import { LikesModule } from './routes/likes/likes.module';

const {url} = config.get('db')
@Module({
  imports: [
    MongooseModule.forRoot(url),
    MailModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    LikesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
