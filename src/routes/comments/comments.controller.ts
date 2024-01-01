import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UserDocument } from 'src/database/schemas/user.schema';
import { Comment } from 'src/database/schemas/comment.schema';
import { CommentDto } from 'src/classes/comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private commentsService: CommentsService){}

    @Post('post/:id')
    @UseGuards(AuthGuard())
    async createComment(
        @GetUser() user: UserDocument,
        @Body() commentDto: CommentDto,
        @Param('id') id: string
    ): Promise<Comment>{
        return this.commentsService.createComment(id,user,commentDto)
    }

    @Patch(':id')
    @UseGuards(AuthGuard())
    async updateComment(
        @Param('id') id: string,
        @GetUser() user: UserDocument,
        @Body() commentDto: CommentDto
    ):Promise<Comment> {
        return this.commentsService.updateComment(id,user,commentDto)
    }

    @Delete(':id/post/:_id')
    @UseGuards(AuthGuard())
    async deleteComment(@Param() params: any, @GetUser() user: UserDocument): Promise<Object>{
        const {id,_id} = params
        return this.commentsService.deleteComment(id,_id,user)
    }

    @Get('post/:id')
    async getPostComments(@Param('id') id: string): Promise<Comment[]>{
        return this.commentsService.getPostComments(id)
    }
}
