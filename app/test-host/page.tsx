"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/lib/socket-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestHostPage() {
  const { socket, isConnected } = useSocket()
  const [sessionCode, setSessionCode] = useState<string | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [status, setStatus] = useState<string>("Not started")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    if (!socket) return

    socket.on('quiz-hosted', (data) => {
      addLog(`Quiz hosted with session code: ${data.sessionCode}`)
      setSessionCode(data.sessionCode)
      setStatus("Waiting for participants")
    })

    socket.on('participant-joined', (data) => {
      addLog(`Participant joined: ${data.participant.name}`)
      setParticipants(prev => [...prev, data.participant])
    })

    socket.on('connect', () => {
      addLog('Socket connected')
    })

    socket.on('disconnect', () => {
      addLog('Socket disconnected')
    })

    socket.on('connect_error', (error) => {
      addLog(`Connection error: ${error.message}`)
    })

    return () => {
      socket.off('quiz-hosted')
      socket.off('participant-joined')
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
    }
  }, [socket])

  const testHostQuiz = () => {
    if (!socket) {
      addLog('Socket not available')
      return
    }

    const testQuiz = {
      id: 'test-quiz-id',
      title: 'Test Quiz',
      description: 'A test quiz for debugging',
      questions: [
        {
          id: '1',
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          timeLimit: 30
        }
      ]
    }

    addLog('Attempting to host quiz...')
    socket.emit('host-quiz', testQuiz)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Host Quiz Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "destructive"}>
                Socket: {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline">
                Status: {status}
              </Badge>
              {sessionCode && (
                <Badge variant="secondary">
                  Session Code: {sessionCode}
                </Badge>
              )}
            </div>
            
            <Button onClick={testHostQuiz} disabled={!isConnected}>
              Test Host Quiz
            </Button>
            
            <div>
              <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
              {participants.map((p, i) => (
                <div key={i} className="text-sm">{p.name}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}