import * as React from 'react'
export function Progress({value=0,className='',...props}: any){
  return <div className={`w-full h-2 bg-slate-200 rounded ${className}`} {...props}>
    <div className='h-2 rounded' style={{width:`${value}%`, background:'#10B981'}} />
  </div>
}
