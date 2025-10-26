import * as React from 'react'
export function Button({className='',variant='default',...props}: any){
  const base='inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition';
  const styles= variant==='secondary' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-black text-white hover:opacity-90';
  return <button className={`${base} ${styles} ${className}`} {...props}/>
}
