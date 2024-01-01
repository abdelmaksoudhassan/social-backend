import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Like, LikeDocument } from 'src/database/schemas/like.schema';
import { Post, PostDocument } from 'src/database/schemas/post.schema';
import { UserDocument } from 'src/database/schemas/user.schema';
import { CustomError, returnError } from 'src/error-handler/error-handler';
import { SocketGateWay } from 'src/socket-gateway/socket-gateway';

@Injectable()
export class LikesService {
    constructor(
        @InjectModel(Like.name) private like: Model<LikeDocument>,
        @InjectModel(Post.name) private post: Model<PostDocument>,
        private socketGateWay: SocketGateWay
    ){}

    async likePost(id: string, user: UserDocument): Promise<Like>{
        try {
            if(! isValidObjectId(id)){
                throw new CustomError(400,`${id} is invalid id`)
            }
            const post = await this.post.findById(id)
            if(! post){
                throw new CustomError(404,`Post with id ${id} not exist`)
            }
            const liked = await this.like.findOne({ user: user._id, post: id })
            if(liked){
                throw new CustomError(409,`User already liked this post before`)
            }
            const like = await this.like.create({ user: user._id, post: id })
            await post.updateOne({ $addToSet:{ likes: like._id } })
            this.socketGateWay.emitLikePost({owner: post.owner._id, user })
            return like
        } catch (error) {
            throw returnError(error)
        }
    }

    async unlikePost(id: string, user: UserDocument): Promise<Like>{
        try {
            if(! isValidObjectId(id)){
                throw new CustomError(400,`${id} is invalid id`)
            }
            const post = await this.post.findById(id)
            if(! post){
                throw new CustomError(404,`Post with id ${id} not found`)
            }
            const {_id} = user
            const unlike = await this.like.findOneAndDelete({ user: _id, post: id },{returnOriginal: true})
            if(! unlike){
                throw new CustomError(404,`like with id ${id} not found`)
            }
            await post.updateOne({ $pull: {likes: unlike._id} })
            return unlike
        } catch (error) {
            throw returnError(error)
        }
    }

    async getPostLikes(id: string): Promise<any[]>{
        try {
            if(! isValidObjectId(id)){
                throw new CustomError(400,`${id} is invalid id`)
            }
            const docs = await this.like.find({post: id},{post: 0,_id: 0}).populate('user').exec()
            return docs
        } catch(error) {
            throw returnError(error)
        }
    }
}
