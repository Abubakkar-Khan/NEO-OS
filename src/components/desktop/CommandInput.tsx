'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, ArrowUp, Sparkles } from 'lucide-react'
import { agentRunner } from '@/agent/runner'
import gsap from 'gsap'

export function CommandInput() {
  const [command, setCommand] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const arrowRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const waveTimelineRef = useRef<gsap.core.Timeline | null>(null)

  // GSAP: Voice recording wave animation
  useEffect(() => {
    if (isRecording) {
      const bars = containerRef.current?.querySelectorAll('.voice-bar')
      if (bars && bars.length > 0) {
        waveTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true })
          .to(bars, {
            scaleY: 2.4,
            duration: 0.25,
            stagger: 0.08,
            ease: 'power1.inOut'
          })
      }
    } else {
      if (waveTimelineRef.current) {
        waveTimelineRef.current.kill()
        waveTimelineRef.current = null
      }
      const bars = containerRef.current?.querySelectorAll('.voice-bar')
      if (bars) {
        gsap.to(bars, { scaleY: 1, duration: 0.15 })
      }
    }
    return () => {
      if (waveTimelineRef.current) {
        waveTimelineRef.current.kill()
      }
    }
  }, [isRecording])

  const handleSend = async () => {
    if (!command.trim() || isRunning) return
    setIsRunning(true)

    // GSAP: Send icon feedback
    if (arrowRef.current) {
      gsap.timeline()
        .to(arrowRef.current, { y: -4, opacity: 0.5, duration: 0.1 })
        .to(arrowRef.current, { y: 0, opacity: 1, duration: 0.15, ease: 'back.out(2)' })
    }

    try {
      await agentRunner.run(command)
      setCommand('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsRunning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not natively supported in this browser. Please type your command.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsRecording(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setCommand(prev => prev ? `${prev} ${transcript}` : transcript)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognition.start()
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-[#111111] border ${
        isRunning ? 'border-[#FFFFFF]' : 'border-[#333333]'
      } flex items-center p-1 shadow-2xl transition-all font-mono`}
    >
      <div className="pl-3 pr-1 text-[#888888] select-none flex items-center gap-1.5 text-xs">
        <Sparkles size={13} className={isRunning ? 'text-[#FFFFFF] animate-spin' : 'text-[#888888]'} />
        <span className="font-bold hidden sm:inline">NEEDLE 2 &gt;</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isRunning 
            ? 'Executing multi-step tool sequence...' 
            : isRecording 
            ? 'Listening to speech...' 
            : 'Type or speak a command (e.g. "What\'s on screen?", "Open editor and create notes.txt")...'
        }
        disabled={isRunning}
        className="flex-1 bg-transparent text-[#FFFFFF] font-mono text-xs px-2 py-2 outline-none placeholder-[#666666]"
      />

      {/* Voice Activity Indicator */}
      {isRecording && (
        <div className="flex items-center gap-0.5 px-2 select-none">
          <div className="voice-bar w-1 h-3 bg-red-500 rounded-full origin-center" />
          <div className="voice-bar w-1 h-3 bg-red-500 rounded-full origin-center" />
          <div className="voice-bar w-1 h-3 bg-red-500 rounded-full origin-center" />
        </div>
      )}

      <div className="flex items-center gap-1 pr-1">
        <button
          onClick={toggleRecording}
          disabled={isRunning}
          className={`p-2 relative rounded-sm transition-colors ${
            isRecording 
              ? 'text-red-400 bg-red-950/30' 
              : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
          }`}
          title={isRecording ? 'Stop Recording' : 'Voice Input (Microphone)'}
        >
          <Mic size={16} />
        </button>

        <button
          ref={arrowRef}
          onClick={handleSend}
          disabled={isRunning || !command.trim()}
          className="p-2 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] rounded-sm disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Send Command (Enter)"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  )
}
