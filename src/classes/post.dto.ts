import { MinLength } from "class-validator";

export class PostDto{
    @MinLength(1)
    text: string

    media: Media
}
interface Media{
    url: string
    type: string
}