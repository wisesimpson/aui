import './utilities.js'

window.scrollSwitch=(element,direction=1)=>{
    let distance=element.offsetHeight+10
    if(direction>0){
	let elementToShow=element
	while(direction>0){
	    elementToShow=elementToShow.nextElementSibling
	    direction--
	}
        element.style.position='absolute'
        elementToShow.removeAttribute('hidden')
        elementToShow.style.opacity=0
        return Promise.all([
            element.animate([{
                opacity:1,
                transform:'translate3d(0,0,0)'
            },{
                opacity:0,
                transform:'translate3d(0,-'+distance+'px,0)'
            }],{
                duration:300,
                easing:'ease-in-out',
                fill:'forwards'
            }).finished,
            elementToShow.animate([{
                opacity:0,
                transform:'translate3d(0,'+distance+'px,0)'
            },{
                opacity:1,
                transform:'translate3d(0,0,0)'
            }],{
                duration:300,
                easing:'ease-in-out',
                fill:'forwards'
            }).finished
        ]).then(values=>{
            values[0].effect.target.setAttribute('hidden','')
            values[0].effect.target.style.position=''
            values[0].cancel()
            values[1].effect.target.style.opacity=''
            values[1].cancel()
        })
    }else if(direction<0){
	let elementToShow=element
	while(direction<0){
	    elementToShow=elementToShow.previousElementSibling
	    direction++
	}
        elementToShow.removeAttribute('hidden')
        elementToShow.style.position='absolute'
        elementToShow.style.opacity=0
        return Promise.all([
            element.animate([{
                opacity:1,
                transform:'translate3d(0,0,0)'
            },{
                opacity:0,
                transform:'translate3d(0,'+distance+'px,0)'
            }],{
                duration:300,
                easing:'ease-in-out',
                fill:'forwards'
            }).finished,
            elementToShow.animate([{
                opacity:0,
                transform:'translate3d(0,-'+distance+'px,0)'
            },{
                opacity:1,
                transform:'translate3d(0,0,0)'
            }],{
                duration:300,
                easing:'ease-in-out',
                fill:'forwards'
            }).finished
        ]).then(values=>{
            values[0].effect.target.setAttribute('hidden','')
            values[0].cancel()
            values[1].effect.target.style.position=''
            values[1].effect.target.style.opacity=''
            values[1].cancel()
        })
    }
}
