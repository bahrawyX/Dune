"use client"
import { useEffect, useState } from 'react'

const useIsDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(false)
    
    useEffect(() => {
        if(typeof window === "undefined"){
            return
        }
        
        // Set initial value
        setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
        
        // Listen for changes
        const controller = new AbortController()
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {   
            setIsDarkMode(event.matches)
        },{signal : controller.signal})

        return ()=>{
            controller.abort()
        }
    }, [])
    
    return isDarkMode
}


export default useIsDarkMode