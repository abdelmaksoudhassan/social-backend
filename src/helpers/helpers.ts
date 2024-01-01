import { unlink } from "fs"

export function deleteFile(path:string){
    unlink(path,(err)=>{
        (err) ? console.log(err) : console.log(`${path} deleted from storage`)
    })
}