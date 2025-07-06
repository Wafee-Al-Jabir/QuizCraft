const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
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
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })

  // Store active quiz sessions
  const quizSessions = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

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
      const { sessionCode, participantName } = data
      const session = quizSessions.get(sessionCode)
      
      if (!session) {
        socket.emit('join-error', { message: 'Quiz session not found' })
        return
      }
      
      if (session.isActive) {
        socket.emit('join-error', { message: 'Quiz has already started' })
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
      socket.emit('joined-quiz', { 
        sessionCode, 
        participantId, 
        quiz: {
          title: session.quiz.title,
          description: session.quiz.description,
          questionCount: session.quiz.questions.length
        }
      })
      
      // Notify host and other participants
      io.to(`quiz-${sessionCode}`).emit('participant-joined', {
        participant: {
          id: participant.id,
          name: participant.name,
          score: participant.score
        },
        totalParticipants: session.participants.size
      })
      
      console.log(`${participantName} joined quiz ${sessionCode}`)
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
            settings: question.settings
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
        questionType: currentQuestion.type,
        answer,
        correctAnswers,
        questionSettings: currentQuestion.settings
      })
      
      if (currentQuestion.type === 'single-choice' || currentQuestion.type === 'true-false') {
        // For single choice, answer should be a number and should be in correctAnswers array
        isCorrect = correctAnswers.includes(answer)
      } else if (currentQuestion.type === 'multiple-choice') {
        // For multiple choice, answer should be an array
        const answerArray = Array.isArray(answer) ? answer : [answer]
        isCorrect = JSON.stringify(correctAnswers.sort()) === JSON.stringify(answerArray.sort())
      }
      
      console.log('Is answer correct?', isCorrect)
      
      if (isCorrect) {
        // Award points based on question settings and time bonus
        const basePoints = currentQuestion.settings?.points || 1000
        const timeLimit = currentQuestion.settings?.timeLimit || 30
        const timeBonus = Math.max(0, (timeLimit - timeSpent) / timeLimit)
        points = Math.round(basePoints + (timeBonus * basePoints * 0.5))
        console.log('Points awarded:', points, 'Base:', basePoints, 'Time bonus:', timeBonus)
      }
      
      participant.answers.push({
        questionId,
        answer,
        isCorrect,
        points,
        timeSpent
      })
      participant.score += points
      
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
            settings: question.settings
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