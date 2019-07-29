if(Animation){
    if(!('finished' in Animation)){
        Object.defineProperty(Animation.prototype,'finished',{
            get(){
                return this.playStat==='finished'?
                    Promise.resolve():
                    new Promise((resolve,reject)=>{
                        this.addEventListener('finish',e=>resolve(this),{once:true})
                        this.addEventListener('cancel',e=>reject(this),{once:true})
                    })
            }
        })
    }
}
