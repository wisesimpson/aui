window.wait=(ms,...params)=>new Promise(resolve=>setTimeout(resolve,ms,params))

window.fadeIn=element=>
    element.animate([{
        opacity:0
    },{
        opacity:1
    }],{
        duration:300
    }).finished.then(a=>a.effect.target)

window.fadeOut=element=>
    element.animate([{
        opacity:1
    },{
        opacity:0
    }],{
        duration:300
    }).finished.then(a=>{
        a.effect.target.style.opacity=0
        return a.effect.target
    })

window.sneakIn=(element,speed=1)=>{
    element.style.opacity=0
    element.style.height=0
    element.style.overflowY='hidden'
    element.removeAttribute('hidden')
    let height=element.scrollHeight
    return element.animate([{
        height:0
    },{
        height:height+'px'
    }],{
        duration:height/speed
    }).finished.then(a=>{
        let element=a.effect.target
        element.style.opacity=''
        element.style.height=''
        element.style.overflowY=''
        return element
    })
}

window.sneakOut=(element,speed=1)=>{
    let height=element.offsetHeight
    return element.animate([{
        height:height+'px',
        overflowY:'hidden'
    },{
        height:0,
        overflowY:'hidden'
    }],{
        duration:height/speed
    }).finished.then(a=>{
        return a.effect.target
    })
}

