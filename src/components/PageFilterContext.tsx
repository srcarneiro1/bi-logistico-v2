import { createContext, useContext, type ReactNode } from 'react'

const PageFilterContext=createContext<ReactNode>(null)

export function PageFilterProvider({children,value}:{children:ReactNode;value:ReactNode}){
  return <PageFilterContext.Provider value={value}>{children}</PageFilterContext.Provider>
}

export function usePageFilter(){
  return useContext(PageFilterContext)
}
