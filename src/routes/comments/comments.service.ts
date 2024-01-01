import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { CommentDto } from 'src/classes/comment.dto';
import { Comment, CommentDocument } from 'src/database/schemas/comment.schema';
import { Post, PostDocument } from 'src/database/schemas/post.schema';
import { UserDocument } from 'src/database/schemas/user.schema';
import { CustomError, returnError } from 'src/error-handler/error-handler';
import { SocketGateWay } from 'src/socket-gateway/socket-gateway';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private Comment:Model<CommentDocument>,
        @InjectModel(Post.name) private Post:Model<PostDocument>,
        private socketGateWay: SocketGateWay
    ){}

    async createComment(_id: string, user: UserDocument, commentDto: CommentDto): Promise<Comment>{
        try {
            if(! isValidObjectId(_id)){
                throw new CustomError(400,`${_id} is invalid id`)
            }
            const post = await this.Post.findById(_id)
            if(! post){
                throw new CustomError(404,`post with id ${_id} not exist`)
            }
            const { text } = commentDto
            const comment = await(await this.Comment.create({text, owner: user._id})).populate("owner")
            await post.updateOne({ $addToSet:{ comments: comment._id } })
            this.socketGateWay.emitNewComment({ post, comment: comment})
            return comment
        } catch (error) {
            throw returnError(error)
        }
    }

    async updateComment(_id: string,user: UserDocument,commentDto: CommentDto): Promise<Comment>{
        try {
            if(! isValidObjectId(_id)){
                throw new CustomError(400,`${_id} is invalid id`)
            }
            const { text } = commentDto
            const comment = await this.Comment.findOne({_id,owner: user._id})
            if(! comment){
                throw new CustomError(404,`comment with id ${_id} not exist`)
            }
            comment.text = text
            return await comment.save()
        } catch (error) {
            throw returnError(error)
        }
    }

    async deleteComment(id: string, _id: string, user: UserDocument){
        try {
            if(! isValidObjectId(id)){
                throw new CustomError(400,`${id} is invalid id`)
            }
            if(! isValidObjectId(_id)){
                throw new CustomError(400,`${_id} is invalid id`)
            }
            const post = await this.Post.findById(_id)
            if(! post){
                throw new CustomError(404,`Post with id ${_id} not found`)
            }
            const deletedComment = await this.Comment.findOneAndDelete({_id: id, owner: user._id})
            if(! deletedComment){
                throw new CustomError(404,`Comment with id ${id} not found`)
            }
            await post.updateOne({ $pull: {comments: new Types.ObjectId(id)} })
            return { message: 'Comment deleted successfully' }
        } catch (error) {
            throw returnError(error)
        }
    }

    async getPostComments(id: string): Promise<any[]>{
        try {
            if(! isValidObjectId(id)){
                throw new CustomError(404,`${id} is invalid id`)
            }
            const post = await this.Post.findById(id).select('comments')
            if(! post){
                throw new CustomError(404,`Post with id ${id} not found`)
            }
            const { comments } = await post.populate({ path: 'comments', populate: { path: 'owner' } })
            return comments
        } catch (error) {
            throw returnError(error)
        }
    }
}
