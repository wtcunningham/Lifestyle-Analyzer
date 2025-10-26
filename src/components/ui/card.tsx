import * as React from 'react'
export function Card({className='',...props}: any){return <div className={`border rounded-xl bg-white ${className}`} {...props}/> }
export function CardHeader({className='',...props}: any){return <div className={`p-4 border-b ${className}`} {...props}/> }
export function CardContent({className='',...props}: any){return <div className={`p-4 ${className}`} {...props}/> }
export function CardTitle({className='',...props}: any){return <h3 className={`font-semibold ${className}`} {...props}/> }
export function CardDescription({className='',...props}: any){return <p className={`text-sm text-muted-foreground ${className}`} {...props}/> }
