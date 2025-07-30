const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : true,
      methods: ['GET', 'POST']
    },
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 15 * 60 * 1000,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
    // transports: ['websocket'], // Force websocket only
    // allowEIO3: true,
    // pingTimeout: 60000,
    // pingInterval: 25000
  })

  // Store active quiz sessions
  const quizSessions = new Map()

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id)
    
    // Debug: Log all incoming events
    socket.onAny((eventName, ...args) => {
      console.log('📨 Socket event received:', eventName, 'from:', socket.id, 'data:', args)
    })

    // Host creates a quiz session
    socket.on('host-quiz', (data) => {
      const { quizId, hostId, quiz } = data
      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const session = {
        id: sessionCode,
        quizId,
        hostId,
        hostSocketId: socket.id,
        quiz,
        participants: new Map(),
        currentQuestion: -1, // -1 means lobby
        isActive: false,
        startTime: null
      }
      
      quizSessions.set(sessionCode, session)
      socket.join(`quiz-${sessionCode}`)
      
      socket.emit('quiz-hosted', { sessionCode, session })
      console.log(`Quiz hosted with code: ${sessionCode}`)
    })

    // Participant joins quiz
    socket.on('join-quiz', (data) => {
      console.log('🔵 join-quiz event received:', data)
      const { sessionCode, participantName } = data
      const session = quizSessions.get(sessionCode)
      console.log('🔍 Session lookup result:', session ? 'Found' : 'Not found', 'for code:', sessionCode)
      
      if (!session) {
        socket.emit('join-error', { message: 'Quiz session not found' })
        return
      }
      
      const participantId = socket.id
      const participant = {
        id: participantId,
        name: participantName,
        socketId: socket.id,
        score: 0,
        answers: [],
        joinedAt: Date.now()
      }
      
      session.participants.set(participantId, participant)
      socket.join(`quiz-${sessionCode}`)
      
      // Notify participant
      const joinResponse = { 
        sessionCode, 
        participantId, 
        quizInfo: {
          title: session.quiz.title,
          description: session.quiz.description,
          totalQuestions: session.quiz.questions.length,
          timePerQuestion: 30
        },
        participants: Array.from(session.participants.values()).map(p => ({
          id: p.id,
          name: p.name,
          score: p.score
        }))
      }
      
      // If quiz is active, send current question immediately
      if (session.isActive && session.currentQuestion >= 0) {
        const currentQuestion = session.quiz.questions[session.currentQuestion]
        const questionData = {
          questionNumber: session.currentQuestion + 1,
          totalQuestions: session.quiz.questions.length,
          question: {
            id: currentQuestion.id,
            text: currentQuestion.question,
            question: currentQuestion.question,
            type: currentQuestion.type,
            options: currentQuestion.options,
            timeLimit: currentQuestion.settings?.timeLimit || 30,
            correctAnswers: currentQuestion.correctAnswers,
            settings: currentQuestion.settings,
            image: currentQuestion.image
          }
        }
        
        joinResponse.isActive = true
        joinResponse.currentQuestion = questionData
        
        socket.emit('joined-quiz', joinResponse)
        // Send quiz-started event to sync with current question
        socket.emit('quiz-started', questionData)
      } else {
        joinResponse.isActive = false
        socket.emit('joined-quiz', joinResponse)
      }
      
      // Notify host and other participants
      socket.to(`quiz-${sessionCode}`).emit('participant-joined', {
        participant: {
          id: participant.id,
          name: participant.name,
          score: participant.score
        },
        totalParticipants: session.participants.size
      })
      
      console.log(`${participantName} joined quiz ${sessionCode}${session.isActive ? ' (quiz in progress)' : ''}`)
    })

    // Host starts the quiz
    socket.on('start-quiz', (data) => {
      const { sessionCode } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session || session.hostSocketId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized or session not found' })
        return
      }
      
      session.isActive = true
      session.currentQuestion = 0
      session.startTime = Date.now()
      
      const question = session.quiz.questions[0]
      const questionData = {
          questionNumber: 1,
          totalQuestions: session.quiz.questions.length,
          question: {
            id: question.id,
            text: question.question,
            question: question.question,
            type: question.type,
            options: question.options,
            timeLimit: question.settings?.timeLimit || 30,
            correctAnswers: question.correctAnswers,
            settings: question.settings,
            image: question.image
          }
        }
      
      io.to(`quiz-${sessionCode}`).emit('quiz-started', questionData)
      console.log(`Quiz ${sessionCode} started`)
    })

    // Participant submits answer
    socket.on('submit-answer', (data) => {
      const { sessionCode, questionId, answer, timeSpent } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session || !session.isActive) {
        socket.emit('error', { message: 'Quiz session not active' })
        return
      }
      
      const participant = session.participants.get(socket.id)
      if (!participant) {
        socket.emit('error', { message: 'Participant not found' })
        return
      }
      
      const currentQuestion = session.quiz.questions[session.currentQuestion]
      if (currentQuestion.id !== questionId) {
        socket.emit('error', { message: 'Invalid question' })
        return
      }
      
      // Calculate score
      let isCorrect = false
      let points = 0
      
      const correctAnswers = currentQuestion.correctAnswers || []
      
      console.log('Scoring debug:', {
        participantId: socket.id,
        participantName: participant.name,
        questionType: currentQuestion.type,
        answer,
        correctAnswers,
        questionSettings: currentQuestion.settings,
        previousScore: participant.score
      })
      
      if (currentQuestion.type === 'single-choice' || currentQuestion.type === 'true-false') {
        // For single choice, answer should be a number and should be in correctAnswers array
        isCorrect = correctAnswers.includes(answer)
      } else if (currentQuestion.type === 'multiple-choice') {
        // For multiple choice, answer should be an array
        const answerArray = Array.isArray(answer) ? answer : [answer]
        // Check if all correct answers are selected and no incorrect ones
        const allCorrectSelected = correctAnswers.every(idx => answerArray.includes(idx))
        const noIncorrectSelected = answerArray.every(idx => correctAnswers.includes(idx))
        isCorrect = allCorrectSelected && noIncorrectSelected && answerArray.length > 0
      }
      
      console.log('Is answer correct?', isCorrect)
      
      if (isCorrect) {
        // Award points based on question settings and time bonus
        const basePoints = currentQuestion.settings?.points || 500
        const timeLimit = currentQuestion.settings?.timeLimit || 30
        
        // Calculate time bonus (scaled to keep total in 500-900 range)
        let timeBonus = 0
        if (timeLimit && timeSpent < timeLimit) {
          // Time bonus can add up to 400 points (making max 900)
          timeBonus = Math.floor((1 - timeSpent / timeLimit) * 400)
        }
        
        points = basePoints + timeBonus
        
        console.log('Points calculation:', {
          basePoints,
          timeLimit,
          timeSpent,
          timeBonus,
          finalPoints: points,
          participantName: participant.name
        })
      }
      
      participant.answers.push({
        questionId,
        answer,
        isCorrect,
        points,
        timeSpent
      })
      participant.score += points
      
      console.log('Score update:', {
        participantName: participant.name,
        participantId: socket.id,
        pointsEarned: points,
        newTotalScore: participant.score,
        sessionCode
      })
      
      socket.emit('answer-submitted', { isCorrect, points, totalScore: participant.score })
      
      // Notify host of answer submission
      io.to(session.hostSocketId).emit('participant-answered', {
        participantId: participant.id,
        participantName: participant.name,
        isCorrect,
        points,
        totalScore: participant.score
      })
    })

    // Host moves to next question
    socket.on('next-question', (data) => {
      const { sessionCode } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session || session.hostSocketId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized or session not found' })
        return
      }
      
      session.currentQuestion++
      
      if (session.currentQuestion >= session.quiz.questions.length) {
        // Quiz finished
        const leaderboard = Array.from(session.participants.values())
          .sort((a, b) => b.score - a.score)
          .map(p => ({
            id: p.id,
            name: p.name,
            score: p.score
          }))
        
        io.to(`quiz-${sessionCode}`).emit('quiz-finished', { leaderboard })
        console.log(`Quiz ${sessionCode} finished`)
      } else {
        // Send next question
        const question = session.quiz.questions[session.currentQuestion]
        const questionData = {
          questionNumber: session.currentQuestion + 1,
          totalQuestions: session.quiz.questions.length,
          question: {
            id: question.id,
            text: question.question,
            question: question.question,
            type: question.type,
            options: question.options,
            timeLimit: question.settings?.timeLimit || 30,
            correctAnswers: question.correctAnswers,
            settings: question.settings,
            image: question.image
          }
        }
        
        io.to(`quiz-${sessionCode}`).emit('next-question', questionData)
      }
    })

    // Host starts a poll
    socket.on('start-poll', (data) => {
      const { sessionCode, poll } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session || session.hostSocketId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized or session not found' })
        return
      }
      
      // Store poll in session
      session.activePoll = {
        question: poll.question,
        options: poll.options,
        responses: new Map() // participantId -> selectedOption
      }
      
      // Send poll to all participants
      io.to(`quiz-${sessionCode}`).emit('poll-started', {
        question: poll.question,
        options: poll.options
      })
      
      console.log(`Poll started in session ${sessionCode}: ${poll.question}`)
    })

    // Participant responds to poll
    socket.on('poll-response', (data) => {
      const { sessionCode, option } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session || !session.activePoll) {
        socket.emit('error', { message: 'No active poll found' })
        return
      }
      
      const participant = session.participants.get(socket.id)
      if (!participant) {
        socket.emit('error', { message: 'Participant not found' })
        return
      }
      
      // Store participant's response
      session.activePoll.responses.set(socket.id, option)
      
      // Notify host of the response
      io.to(session.hostSocketId).emit('poll-response', {
        participantId: socket.id,
        participantName: participant.name,
        option: option
      })
      
      console.log(`Poll response from ${participant.name}: ${option}`)
    })

    // Host ends poll
    socket.on('end-poll', (data) => {
      const { sessionCode } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session || session.hostSocketId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized or session not found' })
        return
      }
      
      if (session.activePoll) {
        // Calculate final results
        const results = {}
        session.activePoll.options.forEach(option => {
          results[option] = 0
        })
        
        session.activePoll.responses.forEach(selectedOption => {
          if (results.hasOwnProperty(selectedOption)) {
            results[selectedOption]++
          }
        })
        
        // Send final results to all participants
        io.to(`quiz-${sessionCode}`).emit('poll-ended', {
          question: session.activePoll.question,
          results: results
        })
        
        // Clear active poll
        session.activePoll = null
        
        console.log(`Poll ended in session ${sessionCode}`)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // Check if disconnected client was a host
      for (const [sessionCode, session] of quizSessions.entries()) {
        if (session.hostSocketId === socket.id) {
          // Notify participants that host disconnected
          io.to(`quiz-${sessionCode}`).emit('host-disconnected')
          quizSessions.delete(sessionCode)
          console.log(`Quiz session ${sessionCode} ended due to host disconnect`)
        } else if (session.participants.has(socket.id)) {
          // Remove participant
          const participant = session.participants.get(socket.id)
          session.participants.delete(socket.id)
          
          io.to(`quiz-${sessionCode}`).emit('participant-left', {
            participantId: socket.id,
            participantName: participant.name,
            totalParticipants: session.participants.size
          })
        }
      }
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})