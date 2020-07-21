import './utilities.js'

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

const firstAttachedChild=list=>Array.from(list.children).find(element=>isAttached(element))

const lastAttachedChild=list=>{
    console.log(list)
    console.log(list.children)
    return Array.from(list.children).reverse().find(element=>isAttached(element))
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

const neutralizeWithoutDisturbing=(element,defaultSpace=0,speed=0.8)=>{
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

const chainNeutralize=(element,defaultSpace=0,speed=0.8)=>{
    if(element){
        neutralizeWithoutDisturbing(element,defaultSpace,speed)
        let next=nextAttachedElement(element)
        if(next){
            wait(reactionTime,next,defaultSpace,speed).then(params=>{
                chainNeutralize(params[0],params[1],params[2])
            })
        }
    }
}

window.remove=(element,defaultSpace=0,speed=0.8)=>{
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
        chainNeutralize(nextAttachedElement(a.effect.target),defaultSpace,speed)
        a.effect.target.remove()
    })
}

window.insert=(newElement,position='after',reference,defaultSpace=0,speed=1)=>{
    newElement.style.opacity=0
    newElement.style.height=0
    newElement.style.overflowY='hidden'
    reference.insertAdjacentElement(position=='after'?'afterend':'beforebegin',newElement)
    let height=newElement.scrollHeight
    setSpace(newElement,defaultSpace)
    newElement.style.height=''
    newElement.style.overflowY=''
    setBottomSpace(newElement,-defaultSpace-height)
    attach(newElement,defaultSpace)

    chainNeutralize(nextAttachedElement(newElement),defaultSpace,speed)
    wait(height/speed,newElement).then(params=>{
        let element=params[0]
        element.style.opacity=''
        element.myAnimation=element.animate([{
            opacity:0
        },{
            opacity:1
        }],{
            duration:300/speed,
        })
        element.myAnimation.finished.then(a=>{
            delete a.effect.target.myAnimation
        }).catch(reason=>{
            console.log([2,reason])
        })
    })
}

window.move=(element,position='after',reference,defaultSpace=0,speed=1)=>{
    if((position=='after'&&element!=nextAttachedElement(reference))||
       (position=='before'&&nextAttachedElement(element)!=reference)){
        let next=nextAttachedElement(element)
        let offset=position=='after'?
            element.offsetTop-reference.offsetTop-reference.offsetHeight-getSpace(element):
            element.offsetTop-reference.offsetTop+getSpace(reference)-getSpace(element)
        detach(element,defaultSpace)
        reference.insertAdjacentElement(position=='after'?'afterend':'beforebegin',element)
        setOffset(element,offset,defaultSpace)
        attach(element,defaultSpace)

        chainNeutralize(next,defaultSpace,speed)
        chainNeutralize(element,defaultSpace,speed)
    }
}

window.append=(container,newElement,defaultSpace=0,speed=1)=>{
    let last=lastAttachedChild(container)
    if(last){
        insert(newElement,'after',last,defaultSpace,speed)
    }else{
        newElement.style.opacity=0
        container.insertAdjacentElement('beforeend',newElement)
        wait(100/speed,newElement).then(params=>{
            let element=params[0]
            element.style.opacity=''
            element.myAnimation=element.animate([{
                opacity:0
            },{
                opacity:1
            }],{
                duration:300/speed,
            })
            element.myAnimation.finished.then(a=>{
                delete a.effect.target.myAnimation
            }).catch(reason=>{
                console.log([3,reason])
            })
        })
    }
}

window.swap=(element1,element2,defaultSpace=0,speed=1)=>{
    let isAfter=false
    let element=element1.nextElementSibling
    while(element){
        if(element==element2){
            isAfter=true
            break
        }else{
            element=element.nextElementSibling
        }
    }
    if(!isAfter){
        let temp=element1
        element1=element2
        element2=temp
    }
    let next=nextAttachedElement(element1)
    move(element1,'after',element2,defaultSpace,speed)
    if(next!=element2){
        move(element2,'before',next,defaultSpace,speed)
    }
}

window.syncList=(data,container,start=0,createElement,key='id',defaultSpace=0,speed=1)=>{
    if(start<=container.childElementCount){
        let element=container.children.item(start)
        data.forEach((item,i)=>{
            if(element){
                if(item[key]==element.dataset[key]){
                    element=element.nextElementSibling
                }else{
                    let j=0
                    let sameElement=false
                    let next=element.nextElementSibling
                    while(next){
                        j++
                        if(item[key]==next.dataset[key]){
                            sameElement=next
                            break
                        }else{
                            next=next.nextElementSibling
                        }
                    }
                    if(sameElement){
                        if(data.length>i+j && data[i+j][key]==element.dataset[key]){
                            swap(element,sameElement,defaultSpace,speed)
                            element=sameElement.nextElementSibling
                        }else{
                            move(sameElement,'before',element,defaultSpace,speed)
                        }
                    }else{
                        let newElement=createElement(item)
                        newElement.dataset[key]=item[key]
                        insert(newElement,'before',element,defaultSpace,speed)
                    }
                }
            }else{
                let newElement=createElement(item)
                newElement.dataset[key]=item[key]
                append(container,newElement,defaultSpace,speed)
            }
        })
        while(element){
            let temp=element
            element=element.nextElementSibling
            remove(temp,defaultSpace,speed)
        }
    }
}
