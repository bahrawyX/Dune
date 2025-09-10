import React, { Suspense } from 'react'
type Props ={
    condition : () => Promise<boolean>;
    children : React.ReactNode;  
    loadingFallback : React.ReactNode;
    otherwise : React.ReactNode;
}
const AyncIf = async ({condition, children, loadingFallback, otherwise}: Props) => {

  return (
    <Suspense fallback={loadingFallback}>
        <SuspendedComponent condition={condition} otherwise={otherwise}>
          {children}
        </SuspendedComponent>
    </Suspense>
  )
}

export default AyncIf

const SuspendedComponent = async ({condition, children, otherwise}: {condition: () => Promise<boolean>, children: React.ReactNode, otherwise: React.ReactNode}) => {
    const isConditionMet = await condition();
    if(!isConditionMet) return otherwise;
    return children;
}
