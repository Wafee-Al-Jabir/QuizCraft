import { Medal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuizParticipant } from "@/lib/types"

interface LeaderboardProps {
  participants: QuizParticipant[]
  currentParticipantId?: string
  title?: string
  description?: string
}

export function Leaderboard({
  participants,
  currentParticipantId,
  title = "Leaderboard",
  description,
}: LeaderboardProps) {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)

  return (
    <Card>
      <CardHeader className="text-center pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm sm:text-base">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {sortedParticipants.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">No participants yet</div>
        ) : (
          sortedParticipants.slice(0, 10).map((participant, index) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                participant.id === currentParticipantId
                  ? "bg-indigo-100 border border-indigo-300"
                  : index % 2 === 0
                    ? "bg-gray-50"
                    : "bg-white"
              }`}
            >
              <div className="flex items-center min-w-0 flex-1">
                <span className="w-6 sm:w-8 text-center font-bold shrink-0">
                  {index === 0 && <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 inline" />}
                  {index === 1 && <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 inline" />}
                  {index === 2 && <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700 inline" />}
                  {index > 2 && `${index + 1}.`}
                </span>
                <span className="font-medium ml-1 sm:ml-2 text-sm sm:text-base truncate">{participant.name}</span>
                {participant.id === currentParticipantId && (
                  <span className="ml-1 sm:ml-2 text-xs bg-indigo-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">You</span>
                )}
              </div>
              <span className="font-bold text-sm sm:text-base shrink-0">{participant.score} pts</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
