import { MinLength } from "class-validator";

export class CommentDto{
    @MinLength(1)
    text: string
}