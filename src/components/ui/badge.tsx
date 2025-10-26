import * as React from 'react'
export function Badge({className='',variant='secondary',...props}: any){
  const styles = variant==='secondary' ? 'bg-slate-100 border border-slate-200 text-slate-700' : 'bg-black text-white';
  return <span className={`inline-flex items-center px-2 py-1 text-xs rounded-md ${styles} ${className}`} {...props}/>
}
