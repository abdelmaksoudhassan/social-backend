import { OnModuleInit, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import * as config from 'config'

const {origin} = config.get('cors')
@WebSocketGateway({
  cors: {
    origin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ['Authorization','Content-Type'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class SocketGateWay implements OnModuleInit{

    @WebSocketServer()
    server: Server
    //
    onModuleInit() {
      this.server.on('connection',(socket)=>{
        const { id } = socket
        console.log(`New user connected via #${id} socket`)

        socket.on('join',(roomId)=>{
          socket.join(roomId)
        })

        socket.on('disconnect',(msg)=>{
          console.log(`#${id} ${msg}`)
        })
      })
    }
    // subscribtions
    // @UseGuards(AuthGuard())
    @SubscribeMessage('wave')
    onNewMessage(@MessageBody() msg: any){
      const { room, user } = msg
        room ? this.server.to(room).emit('WaveMessage',user) : this.server.emit('WaveMessage',user)
    }
    // functions
    emitAddedPost(post){
      this.server.emit('PostAdded',post)
    }
    emitDeletedPost(id){
      this.server.emit('PostDeleted',id)
    }
    emitEditPost(post){
      this.server.emit('PostEdited',post)
    }
    emitNewComment(data){
      const { post, comment} = data
      const {owner} = post
      const room = owner.toString()
      this.server.to(room).emit('NewComment',{ post: post._id, comment })
    }
    emitLikePost(data){
      const { owner, user } = data
      const room = owner.toString()
      this.server.to(room).emit('NewLike',user)
    }
}
