const wait=(ms,...params)=>new Promise(resolve=>setTimeout(resolve,ms,params))

let t1=800
let t2=3000
let t3=5000
let t4=3000

window.insertAfter=(element,previousElement)=>{
    let offsetHeight=element.offsetHeight
    if(offsetHeight){
        let nextElementSibling=element.nextElementSibling
        let gap=element.offsetTop-previousElement.offsetTop-previousElement.offsetHeight
        previousElement.insertAdjacentElement('afterend',element)
        element.style.marginTop=gap+'px'
        element.style.marginBottom=-gap+'px'
        if(nextElementSibling){
            nextElementSibling.style.marginTop=offsetHeight+'px'
	    nextElementSibling.style.marginBottom=-offsetHeight+'px'
            moveUp(nextElementSibling,offsetHeight)
        }
        if(element.nextElementSibling){
            element.nextElementSibling.style.marginTop=-offsetHeight-gap+'px'
            // moveDown(element.nextElementSibling,offsetHeight)
        }
        wait(t4*0.2,element,gap).then(params=>{
            console.log(params)
            let a=params[0].animate([
                {
                    transform:'translate3d(0,0,0)',
                    zIndex:1
                },
                {
                    transform:'translate3d(0,-'+params[1]+'px,0)',
                    zIndex:1
                }
            ],{
                duration:t3
            })
            a.finished.then(a=>{
                let element=a.effect.target
                element.style.marginTop=''
                element.style.marginBottom=''
            })
        })
    }else{
        element.style.boxSizing='border-box'
        element.style.height=0
        element.style.overflowY='hidden'
        element.style.opacity=0
        previousElement.insertAdjacentElement('afterend',element)
        offsetHeight=element.scrollHeight
        element.style.boxSizing=''
        element.style.height=''
        element.style.overflowY=''
        if(element.nextElementSibling){
            element.nextElementSibling.style.marginTop=-offsetHeight+'px'
            moveDown(element.nextElementSibling,offsetHeight)
        }
        wait(t4*1.2).then(params=>{
            let a=element.animate([
                {
                    opacity:0,
                    zIndex:-1,
                    transform:'perspective(1000px) translate3d(0,40px,-60px)'
                },
                {
                    opacity:1,
                    zIndex:-1,
                    transform:'perspective(1000px) translate3d(0,20px,-50px)'
                },
                {
                    opacity:1,
                    zIndex:-1,
                    transform:'perspective(1000px) translate3d(0,0,0)'
                }
            ],{
                duration:t3
            })
            a.finished.then(a=>{
                a.effect.target.style.opacity=''
            })
        })
    }
}

window.move=(element,distance)=>{
    if(element.myAnimation){
	element.myAnimation.pause()
	let transform=getComputedStyle(element).transform
	console.log(transform)
	let transformType=transform.substring(0,transform.indexOf('('))
	console.log(transformType)
	let end=''
	if(transformType=='matrix'){
	    end='matrix(1,0,0,1,0,0)'
	}else if(transformType=='matrix3d'){
	    end='matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)'
	}
	element.myAnimation.cancel()
	element.myAnimation=element.animate([{
	    transform:transform
	},{
	    transform:end
	}],{
	    duration:t4,
	    easing:'ease-in-out'
	})
    }else{
	element.style.marginTop=distance+'px'
	element.style.marginBottom=-distance+'px'
	element.myAnimation=element.animate([{
	    transform:'translate3d(0,'+(-distance)+'px,0)'
	},{
	    transform:'translate3d(0,0,0)'
	}],{
	    duration:t4,
	    easing:'ease-in-out'
	})
	element.myAnimation.finished.then(a=>{
	    let element=a.effect.target
	    // cleanup
	    if(element.style.marginTop && element.previousElement && element.previousElement.style.marginBottom){
		let marginBottom=parseFloat(element.previousElement.style.marginBottom)
		let marginTop=parseFloat(element.style.marginTop)
		if(marginTop&&marginBottom&&marginTop*marginBottom<0){
		    // So no collapsing margin
		    if(Math.abs(marginTop)==Math.abs(marginBottom)){
			element.previousElement.style.marginBottom=''
			element.style.marginTop=''
		    }else if(Math.abs(marginTop)>Math.abs(marginBottom)){
			element.previousElement.style.marginBottom=''
			element.style.marginTop=marginTop+marginBottom+'px'
		    }else{
			element.previousElement.style.marginBottom=marginTop+marginBottom+'px'
			element.style.marginTop=''
		    }
		}
	    }
	    delete element.myAnimation
	}).catch(reason=>{
	    // console.log(reason)
	})
    }
}

const moveDown=(element,height)=>{
    if(element.nextElementSibling){
        element.style.marginBottom=height+'px'
        element.nextElementSibling.style.marginTop=-height+'px'
    }
    let a=element.animate([
        {
            transform:'translate3d(0,0,0)'
        },
        {
            transform:'translate3d(0,'+height+'px,0)'
        }
    ],{
        duration:t4,
        easing:'ease-in-out'
    })
    a.finished.then(a=>{
        let element=a.effect.target
        element.style.marginTop=''
        element.style.marginBottom=''
    })
    wait(t4*0.1,a,height).then(params=>{
        let a=params[0]
        let element=a.effect.target
        if(a.playState=='running'){
            if(element.nextElementSibling){
                let height=params[1]
                moveDown(element.nextElementSibling,height)
            }
        }
    })
}

const moveUp=(element,height)=>{
    if(element.nextElementSibling){
        element.style.marginBottom=-height+'px'
        element.nextElementSibling.style.marginTop=height+'px'
    }
    let a=element.animate([
        {
            transform:'translate3d(0,0,0)'
        },
        {
            transform:'translate3d(0,-'+height+'px,0)'
        }
    ],{
        duration:t2,
        easing:'ease-in-out'
    })
    a.finished.then(a=>{
        let element=a.effect.target
        element.style.marginTop=''
        element.style.marginBottom=''
    })
    wait(t2*0.6,a,height).then(params=>{
        let a=params[0]
        let element=a.effect.target
        if(a.playState=='running'){
            if(element.nextElementSibling){
                moveUp(element.nextElementSibling,params[1])
            }
        }
    })
}

window.remove1=element=>{
    console.log(element.offsetHeight)
    let a=element.animate([
        {
            opacity:1,
            transform: 'scale3d(1,1, 1)'
        },
        {
            opacity:0,
            transform: 'scale3d(0.8, 0.8, 1)'
        }
    ],{
        duration:t1,
        fill:'forwards'
    })
    a.finished.then(a=>{
        console.log(a)
        a.effect.target.remove()
    })
    wait(t1*0.9,a,element).then(params=>{
        let a=params[0]
        let element=params[1]
        if(a.playState=='running'){
            if(element.nextElementSibling){
                console.log(element.offsetHeight)
                let offsetHeight=element.offsetHeight
                element.style.marginBottom=-offsetHeight+'px'
                element.nextElementSibling.style.marginTop=offsetHeight+'px'
                moveUp(element.nextElementSibling,offsetHeight)
            }
        }
        wait(3000,params[0]).then(params=>{
            console.log(params[0].playState)
        })
    })
}

window.remove=element=>{
    console.log(element.offsetHeight)
    let offsetHeight=element.offsetHeight
    let a=element.animate([
        {
            opacity:1,
            transform: 'scale3d(1,1, 1)'
        },
        {
            opacity:0,
            transform: 'scale3d(0.8, 0.8, 1)'
        }
    ],{
        duration:t1,
        fill:'forwards'
    })
    a.finished.then(a=>{
        console.log(a)
        //a.effect.target.remove()
    })
    wait(t1*0.9,element,offsetHeight).then(params=>{
	let element=params[0]
        let offsetHeight=params[1]
        if(element.nextElementSibling){
	    move(element.nextElementSibling,-offsetHeight)
        }
        wait(3000,element).then(params=>{
            console.log(params[0].playState)
        })
    })
}

const getSpace=element=>parseFloat(element.style.marginTop)||0

const setSpace=(element,space)=>{
    if(space==0){
	element.style.marginTop=''
    }else{
	element.style.marginTop=space+'px'
    }
}

const changeSpace=(element,change)=>{
    setSpace(element,getSpace(element)+change)
}

const setOffset=(element,offset)=>{
    let previousMarginTop=parseFloat(element.style.marginTop)||0
    let previousMarginBottom=parseFloat(element.style.marginBottom)||0
    let marginTop=previousMarginTop+offset
    let marginBottom=previousMarginBottom-offset
    if(marginTop==0){
	element.style.marginTop=''
    }else{
	element.style.marginTop=marginTop+'px'
    }
    if(marginBottom==0){
	element.style.marginBottom=''
    }else{
	element.style.marginBottom=marginBottom+'px'
    }
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
    }
}
const setSpaceWithoutDisturbing=(element,space)=>{
    let currentSpace=getSpace(element)
    element.style.marginTop=space+'px'
    if(element.nextElementSibling)
        changeSpace(element.nextElementSibling,currentSpace-space)
    if(element.myAnimation){
	let transform=getComputedStyle(element).transform
	let transformType=transform.substring(0,transform.indexOf('('))
	console.log(transformType)
	let end=''
	if(transformType=='matrix'){
	    end='matrix(1,0,0,1,0,0)'
	}else if(transformType=='matrix3d'){
	    end='matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)'
	}
	element.myAnimation.cancel()
	element.myAnimation=element.animate([{
	    transform:transform
	},{
	    transform:end
	}],{
	    duration:1000,
	    easing:'ease-in-out'
	})
    }else{
	element.myAnimation=element.animate([{
	    transform:'translate3d(0,'+(-space)+'px,0)'
	},{
	    transform:'translate3d(0,0,0)'
	}],{
	    duration:1000,
	    easing:'ease-in-out'
	})
    }
    element.myAnimation.finished.then(a=>{
	delete a.effect.target.myAnimation
    })
}

const detach=element=>{
    let space=getSpace(element)
    let height=element.offsetHeight
    element.style.marginBottom=-(space+height)+'px'
    if(element.nextElementSibling)
	changeSpace(element.nextElementSibling,space+height)
}

const attach=element=>{
    let marginBottom=parseFloat(element.style.marginBottom)||0
    element.style.marginBottom=''
    if(element.nextElementSibling){
	changeSpace(element.nextElementSibling,marginBottom)
    }
}

const neutralizeWithoutDisturbing=(element,defaultSpace=0)=>{
    let space=getSpace(element)
    if(space!=defaultSpace){
	setSpace(element,defaultSpace)
	if(element.nextElementSibling)
            changeSpace(element.nextElementSibling,space-defaultSpace)

	if(element.myAnimation){
	    element.myAnimation.pause()
	    let translateY=getTranslateY(element)
	    element.myAnimation.cancel()
	    element.myAnimation=element.animate([{
		transform:'translate3d(0,'+(space-defaultSpace+translateY)+'px,0)'
	    },{
		transform:'translate3d(0,0,0)'
	    }],{
		duration:1000
	    })
	}else{
	    element.myAnimation=element.animate([{
		transform:'translate3d(0,'+(space-defaultSpace)+'px,0)'
	    },{
		transform:'translate3d(0,0,0)'
	    }],{
		duration:1000
	    })
	}
	element.myAnimation.finished.then(a=>{
	    delete a.effect.target.myAnimation
	}).catch(reason=>{
	    console.log([1,reason])
	})

    }
}

const chainNeutralize=element=>{
    if(element){
        neutralizeWithoutDisturbing(element)
        if(element.nextElementSibling){
            wait(200,element.nextElementSibling).then(params=>{
                chainNeutralize(params[0])
            })
        }
    }
}

window.remove2=element=>{
    detach(element)
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
	chainNeutralize(a.effect.target.nextElementSibling)
	a.effect.target.remove()
    })
}

window.insertAfter2=(element,previousElement,defaultSpace=0)=>{
    let height=element.offsetHeight
    if(height){
	if(element!=previousElement.nextElementSibling){
	    let nextElementSibling=element.nextElementSibling
	    let offset=element.offsetTop-previousElement.offsetTop-previousElement.offsetHeight-getSpace(element)

	    detach(element)
	    previousElement.insertAdjacentElement('afterend',element)
	    setOffset(element,offset)
	    attach(element)

	    chainNeutralize(nextElementSibling)
	    chainNeutralize(element)
	}
    }else{
        element.style.height=0
        element.style.overflowY='hidden'
        element.style.opacity=0
	previousElement.insertAdjacentElement('afterend',element)
        height=element.scrollHeight
	setSpace(element,defaultSpace)
	element.style.height=''
	element.style.overflowY=''
	if(-defaultSpace-height==0){
	    element.style.marginBottom=''
	}else{
	    element.style.marginBottom=-defaultSpace-height+'px'
	}
	attach(element)

	chainNeutralize(element.nextElementSibling)
	
	wait(1000,element).then(params=>{
	    let element=params[0]
	    element.style.opacity=''
	    element.myAnimation=element.animate([{
		opacity:0
	    },{
		opacity:1
	    }],{
		duration:1000,
	    })
	    element.myAnimation.finished.then(a=>{
		delete a.effect.target.myAnimation
	    }).catch(reason=>{
		console.log([2,reason])
	    })
	})
    }
}
	
	
