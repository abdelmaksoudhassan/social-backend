import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostDto } from 'src/classes/post.dto';
import * as Schema from 'src/database/schemas/post.schema';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaPipe } from 'src/pipes/media/media.pipe';
import { Paginate } from 'src/classes/paginate';
import { Types } from 'mongoose';
import { Request } from 'express';

@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService){}

    @Post()
    @UseGuards(AuthGuard())
    @UseInterceptors(
        FileInterceptor('media',{
            storage: diskStorage({
                filename: function (req, file, cb) {
                    var parts = file.originalname.split('.');
                    const name = parts.slice(0,-1).join('') + '.' + parts.slice(-1)
                    cb(null, (Date.now()+'-social-'+name).replace(/ /g,""))
                },
                destination: function (req, file, cb) {
                    cb(null, 'uploads/media')
                },
            })
        })
    )
    async createPost(
        @Body() postDto: PostDto,
        @GetUser() user: User,
        @UploadedFile(MediaPipe) file:Express.Multer.File
    ):Promise<Schema.Post>{
        file ? postDto.media = {url: file.filename, type: file.mimetype} : postDto.media = null
        return this.postsService.createPost(user,postDto)
    }

    @Get()
    async readAllPosts(
        @Query() paginate: Paginate
    ): Promise<Schema.Post[]>{
        const {page,limit} = paginate
        return this.postsService.getAllPosts(+page,+limit)
    }

    // @Get()
    // @UseGuards(AuthGuard())
    // async readMyPosts(
    //     @GetUser() user: UserDocument,
    //     @Query() paginate: Paginate
    // ): Promise<Schema.Post[]>{
    //     const {page,limit} = paginate
    //     const {_id} = user
    //     return this.postsService.getUserPosts(_id,+page,+limit)
    // }

    @Get('user/:id')
    async readUserPosts(
        @Param('id') id:string,
        @Query() paginate: Paginate
    ): Promise<Schema.Post[]>{
        const {page,limit} = paginate
        const _id = new Types.ObjectId(id)
        return this.postsService.getUserPosts(_id,+page,+limit)
    }

    @Get(':id')
    async readPost(@Param('id') id:string):Promise<Schema.Post>{
        return this.postsService.getPost(id)
    }

    @Delete(':id')
    @UseGuards(AuthGuard())
    async deletePost(@Param('id') id:string, @GetUser() user: UserDocument):Promise<Object>{
        const {_id} = user
        return this.postsService.deletePost(id,_id)
    }

    @Patch(':id')
    @UseGuards(AuthGuard())
    @UseInterceptors(
        FileInterceptor('media',{
            storage: diskStorage({
                filename: function (req, file, cb) {
                    cb(null, (Date.now()+'-social-'+file.originalname).replace(/ /g,""))
                },
                destination: function (req, file, cb) {
                    cb(null, 'uploads/media')
                },
            })
        })
    )
    async updatePost(
        @Req() request: Request,
        @Param('id') id: string,
        @GetUser() user: UserDocument,
        @Body() postDto: PostDto,
        @UploadedFile(MediaPipe) file:Express.Multer.File
    ):Promise<Schema.Post>{
        file ? postDto.media = {url: file.filename, type: file.mimetype} : postDto.media = null
        const oldMedia = request.header('Old-Media')
        return this.postsService.editPost(id,user,postDto,oldMedia)
    }
}
