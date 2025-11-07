import { useRef, useCallback } from 'react'

export const useSound = (soundFile = '/sounds/notification.wav') => {
    const audioRef = useRef(null)

    const playSound = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(soundFile)
            audioRef.current.volume = 0.2
        }

        audioRef.current.currentTime = 0
        
        audioRef.current.play().catch(error => {
            console.warn('Audio play failed:', error)
        })
    }, [soundFile])

    const stopSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }, [])

    return {
        playSound,
        stopSound
    }
}