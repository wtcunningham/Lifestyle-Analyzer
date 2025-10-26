import * as React from 'react'
export function Alert({className='',...props}: any){return <div className={`border rounded-md p-4 bg-red-50 border-red-200 ${className}`} {...props}/> }
export function AlertTitle({className='',...props}: any){return <div className={`font-semibold mb-1 ${className}`} {...props}/> }
export function AlertDescription({className='',...props}: any){return <div className={`${className}`} {...props}/> }
