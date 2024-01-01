import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { PostDto } from 'src/classes/post.dto';
import { Comment ,CommentDocument } from 'src/database/schemas/comment.schema';
import { Like, LikeDocument } from 'src/database/schemas/like.schema';
import { Media, MediaDocument } from 'src/database/schemas/media.schema';
import { Post, PostDocument } from 'src/database/schemas/post.schema';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { CustomError, returnError } from 'src/error-handler/error-handler';
import { SocketGateWay } from 'src/socket-gateway/socket-gateway';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name) private Post:Model<PostDocument>,
        @InjectModel(Media.name) private Media:Model<MediaDocument>,
        @InjectModel(Like.name) private Like:Model<LikeDocument>,
        @InjectModel(Comment.name) private Comment:Model<CommentDocument>,
        private socketGateWay: SocketGateWay
    ){}

    async createPost(user: User,postDto: PostDto):Promise<Post>{
        try {
            const { text, media } = postDto
            var post
            if(media){
                const attached = await this.Media.create({...media})
                post = await this.Post.create({ text,attached,owner: user })
            }else{
                post = await this.Post.create({ text, owner: user })
            }
            this.socketGateWay.emitAddedPost(post)
            return post
        } catch (error) {
            throw returnError(error)
        }
    }

    async getAllPosts(page: number, limit: number): Promise<Post[]>{
        try {
            const posts = await this.Post.find({})
                                    .sort({createdAt: -1})
                                    .limit(limit)
                                    .skip((page-1)*limit)
                                    .populate('attached')
                                    .populate('owner')
                                    .populate('likes')
                                    .exec()
            return posts
        } catch (error) {
            throw returnError(error)
        }
    }

    async getUserPosts(_id: Types.ObjectId, page: number, limit: number): Promise<Post[]>{
        try {
            if(! isValidObjectId(_id)){
                throw new CustomError(400,`${_id} is invalid id`)
            }
            const posts = await this.Post.find({owner: _id})
                                    .sort({createdAt: -1})
                                    .limit(limit)
                                    .skip((page-1)*limit)
                                    .populate('attached')
                                    .populate('owner')
                                    .populate('likes')
                                    .exec()
            return posts
        } catch (error) {
            throw returnError(error)
        }
    }

    async getPost(id:string): Promise<Post>{
        try {
            if(! isValidObjectId(id)){
                throw new CustomError(400,`${id} is invalid id`)
            }
            const post = await this.Post.findById(id)
                                        .populate('attached')
                                        .populate('owner')
                                        .populate('likes')
                                        .exec()
            if(! post){
                throw new CustomError(404,`post with id ${id} not exist`)
            }
            return post
        } catch (error) {
            throw returnError(error)
        }
    }
    
    async deletePost(_id: string, owner: Types.ObjectId): Promise<Object>{
        try {
            if(! isValidObjectId(_id)){
                throw new CustomError(400,`${_id} is invalid id`)
            }
            const post = await this.Post.findOne({_id, owner})
            if(! post){
                throw new CustomError(404,`post with id ${_id} not exist`)
            }
            await post.deleteOne()
            if(post.attached){
                await this.Media.findOneAndDelete({_id: post.attached._id})
            }
            await this.Like.deleteMany({_id: {$in: post.likes}})
            await this.Comment.deleteMany({_id: {$in: post.comments}})
            this.socketGateWay.emitDeletedPost({ id: _id })
            return { message: 'Post deleted successfully' }
        } catch (error) {
            throw returnError(error)
        }
    }

    async editPost(_id: string,user: UserDocument,postDto: PostDto,oldMedia: String):Promise<Post>{
        try {
            if(! isValidObjectId(_id)){
                throw new CustomError(400,`${_id} is invalid id`)
            }
            const post = await this.Post.findOne({_id, owner: user._id})
            if(! post){
                throw new CustomError(404,`post with id ${_id} not exist`)
            }
            const { text, media } = postDto
            var updated
            if(media && ! post.attached){
                const attach = await this.Media.create({...media})
                post.text = text
                post.attached = attach._id
                updated = await(await post.save()).populate('attached')
            }else if(media && post.attached){
                await this.Media.findOneAndUpdate({_id: post.attached},{...media})
                post.text = text
                updated = await(await post.save()).populate('attached')
            }
            else{
                if(oldMedia && oldMedia == 'DELETE'){
                    await this.Media.findOneAndDelete({_id: post.attached})
                    post.set('attached',undefined, { strict: false })
                    post.text = text
                    updated = await post.save()
                }else{
                    post.text = text
                    updated = await(await post.save()).populate('attached')
                }
            }
            // if(! media && post.attached){
            //     await this.Media.findOneAndDelete({_id: post.attached})
            //     post.set('attached',undefined, { strict: false })
            //     post.text = text
            //     updated = await post.save()
            // }else if(media && ! post.attached){
            //     const attach = await this.Media.create({...media})
            //     post.text = text
            //     post.attached = attach._id
            //     updated = await(await post.save()).populate('attached')
            // }
            // else if(media && post.attached){
            //     await this.Media.findOneAndUpdate({_id: post.attached},{...media})
            //     post.text = text
            //     updated = await(await post.save()).populate('attached')
            // }else{
            //     post.text = text
            //     updated = await(await post.save()).populate('attached')
            // }
            const PostDetails = await updated.populate('owner')
            this.socketGateWay.emitEditPost(PostDetails)
            return PostDetails
        } catch (error) {
            throw returnError(error)
        }
    }
}
