const wait=(ms,...params)=>new Promise(resolve=>setTimeout(resolve,ms,params))

const speed=0.8
const reactionTime=50

const getSpace=element=>parseFloat(getComputedStyle(element).marginTop)||0

const getBottomSpace=element=>parseFloat(getComputedStyle(element).marginBottom)||0

const setSpace=(element,space,defaultSpace=0)=>{
    if(space==defaultSpace){
        element.style.marginTop=''
    }else{
        element.style.marginTop=space+'px'
    }
}

const setBottomSpace=(element,space)=>{
    if(space==0){
        element.style.marginBottom=''
    }else{
        element.style.marginBottom=space+'px'
    }
}

const changeSpace=(element,change,defaultSpace=0)=>{
    setSpace(element,getSpace(element)+change,defaultSpace)
}

const setOffset=(element,offset,defaultSpace=0)=>{
    setSpace(element,getSpace(element)+offset,defaultSpace)
    setBottomSpace(element,getBottomSpace(element)-offset)
}

const getTranslateY=element=>{
    let transform=getComputedStyle(element).transform
    let i=transform.indexOf('(')
    let j=transform.indexOf(')')
    let transformType=transform.substring(0,i)
    let content=transform.substring(i+1,j).split(',')
    if(transformType=='matrix'){
        return parseFloat(content[5])
    }else if(transformType=='matrix3d'){
        return parseFloat(content[13])
    }else{
        console.log('error')
        return null
    }
}

const isAttached=element=>getBottomSpace(element)==0

const nextAttachedElement=element=>{
    let next=element.nextElementSibling
    if(next){
        if(isAttached(next)){
            return next
        }else{
            return nextAttachedElement(next)
        }
    }else{
        return null
    }
}

const detach=(element,defaultSpace=0)=>{
    if(isAttached(element)){
        let space=getSpace(element)
        let height=element.offsetHeight
        setBottomSpace(element,-space-height)
        let next=nextAttachedElement(element)
        if(next){
            changeSpace(element.nextElementSibling,space+height,defaultSpace)
        }
    }else{
        console.log('Already detached')
    }
}

const attach=(element,defaultSpace=0)=>{
    if(isAttached(element)){
        console.log('Already attached')
    }else{
        let bottomSpace=getBottomSpace(element)
        let next=nextAttachedElement(element)
        setBottomSpace(element,0)
        if(next){
            changeSpace(next,bottomSpace,defaultSpace)
        }
    }
}

const neutralizeWithoutDisturbing=(element,defaultSpace=0)=>{
    if(isAttached(element)){
        let space=getSpace(element)
        if(space!=defaultSpace){
            let next=nextAttachedElement(element)
            setSpace(element,defaultSpace,defaultSpace)
            if(next){
                changeSpace(next,space-defaultSpace)
            }
            
            if(element.myAnimation){
                element.myAnimation.pause()
                let translateY=getTranslateY(element)
                element.myAnimation.cancel()
                element.myAnimation=element.animate([{
                    transform:'translate3d(0,'+(space-defaultSpace+translateY)+'px,0)'
                },{
                    transform:'translate3d(0,0,0)'
                }],{
                    duration:Math.abs(space-defaultSpace+translateY)/speed
                })
            }else{
                element.myAnimation=element.animate([{
                    transform:'translate3d(0,'+(space-defaultSpace)+'px,0)'
                },{
                    transform:'translate3d(0,0,0)'
                }],{
                    duration:Math.abs(space-defaultSpace)/speed
                })
            }
            element.myAnimation.finished.then(a=>{
                delete a.effect.target.myAnimation
            }).catch(reason=>{
                console.log([1,reason])
            })
        }
    }
}

const chainNeutralize=(element,defaultSpace=0)=>{
    if(element){
        neutralizeWithoutDisturbing(element,defaultSpace)
        let next=nextAttachedElement(element)
        if(next){
            wait(reactionTime,next,defaultSpace).then(params=>{
                chainNeutralize(params[0],params[1])
            })
        }
    }
}

window.remove=(element,defaultSpace=0)=>{
    detach(element,defaultSpace)
    if(element.myAnimation){
        element.myAnimation.pause()
    }
    element.animate([{
        opacity:1
    },{
        opacity:0
    }],{
        duration:300
    }).finished.then(a=>{
        chainNeutralize(nextAttachedElement(a.effect.target),defaultSpace)
        a.effect.target.remove()
    })
}

window.insertAfter=(element,previousElement,defaultSpace=0)=>{
    let height=element.offsetHeight
    if(height){
        if(element!=previousElement.nextElementSibling){
            let nextElementSibling=element.nextElementSibling
            let offset=element.offsetTop-previousElement.offsetTop-previousElement.offsetHeight-getSpace(element)

            detach(element,defaultSpace)
            previousElement.insertAdjacentElement('afterend',element)
            setOffset(element,offset,defaultSpace)
            attach(element,defaultSpace)

            chainNeutralize(nextElementSibling,defaultSpace)
            chainNeutralize(element,defaultSpace)
        }
    }else{
        element.style.opacity=0

        element.style.height=0
        element.style.overflowY='hidden'
        previousElement.insertAdjacentElement('afterend',element)
        height=element.scrollHeight
        setSpace(element,defaultSpace)
        element.style.height=''
        element.style.overflowY=''
        setBottomSpace(-defaultSpace-height)
        attach(element,defaultSpace)

        chainNeutralize(element.nextElementSibling,defaultSpace)
        
        wait(height/speed,element).then(params=>{
            let element=params[0]
            element.style.opacity=''
            element.myAnimation=element.animate([{
                opacity:0
            },{
                opacity:1
            }],{
                duration:300,
            })
            element.myAnimation.finished.then(a=>{
                delete a.effect.target.myAnimation
            }).catch(reason=>{
                console.log([2,reason])
            })
        })
    }
}


