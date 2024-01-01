import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { Like } from 'src/database/schemas/like.schema';

@Controller('likes')
export class LikesController {
    constructor(private likesService: LikesService){}

    @Post('post/:id')
    @UseGuards(AuthGuard())
    async likePost(@GetUser() user: UserDocument, @Param('id') id: string): Promise<Like>{
        return this.likesService.likePost(id,user)
    }

    @Delete('post/:id')
    @UseGuards(AuthGuard())
    async unlikePost(@GetUser() user: UserDocument, @Param('id') id: string): Promise<Like>{
        return this.likesService.unlikePost(id,user)
    }

    @Get('post/:id')
    @UseGuards()
    async postLikes(@Param('id') id: string): Promise<User[]>{
        return this.likesService.getPostLikes(id)
    }
}
