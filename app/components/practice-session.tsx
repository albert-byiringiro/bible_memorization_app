"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, EyeOff, RotateCcw, CheckCircle, BookOpen, Mic, Lightbulb, Target } from "lucide-react"
import {
  type Verse,
  type VerseProgress,
  getVerseProgress,
  saveVerseProgress,
  initializeVerseProgress,
} from "../lib/storage"

interface PracticeSessionProps {
  verse: Verse
  onComplete: () => void
  onBack: () => void
}

export default function PracticeSession({ verse, onComplete, onBack }: PracticeSessionProps) {
  const [progress, setProgress] = useState<VerseProgress | null>(null)
  const [currentPhase, setCurrentPhase] = useState<"reading" | "reciting" | "review">("reading")
  const [showText, setShowText] = useState(true)
  const [userRecitation, setUserRecitation] = useState("")
  const [sessionNotes, setSessionNotes] = useState("")
  const [highlightedWords, setHighlightedWords] = useState<number[]>([])

  useEffect(() => {
    let existingProgress = getVerseProgress(verse.id)
    if (!existingProgress) {
      existingProgress = initializeVerseProgress(verse.id)
    }
    setProgress(existingProgress)

    // Determine current phase based on progress
    if (existingProgress.currentStep === 0) {
      setCurrentPhase("reading")
    } else if (existingProgress.currentStep === 1) {
      setCurrentPhase("reciting")
      setShowText(false)
    } else {
      setCurrentPhase("review")
    }
  }, [verse.id])

  const updateProgress = (updates: Partial<VerseProgress>) => {
    if (!progress) return

    const updatedProgress = {
      ...progress,
      ...updates,
      lastPracticed: new Date().toISOString(),
    }

    setProgress(updatedProgress)
    saveVerseProgress(updatedProgress)
  }

  const handleReadingComplete = () => {
    if (!progress) return

    const newReadingCount = progress.readingCount + 1
    updateProgress({
      readingCount: newReadingCount,
      currentStep: newReadingCount >= 10 ? 1 : 0,
    })

    if (newReadingCount >= 10) {
      setCurrentPhase("reciting")
      setShowText(false)
    }
  }

  const handleRecitingAttempt = () => {
    if (!progress) return

    const newRecitingCount = progress.recitingCount + 1
    updateProgress({
      recitingCount: newRecitingCount,
      currentStep: newRecitingCount >= 10 ? 2 : 1,
    })

    setUserRecitation("")

    if (newRecitingCount >= 10) {
      setCurrentPhase("review")
      setShowText(true)
    }
  }

  const handleAddNote = () => {
    if (!progress || !sessionNotes.trim()) return

    const newNotes = [...progress.notes, sessionNotes.trim()]
    updateProgress({ notes: newNotes })
    setSessionNotes("")
  }

  const handleMarkMastered = () => {
    if (!progress) return

    updateProgress({
      currentStep: 4,
      dailyReviewStreak: progress.dailyReviewStreak + 1,
    })

    onComplete()
  }

  const toggleWordHighlight = (wordIndex: number) => {
    setHighlightedWords((prev) =>
      prev.includes(wordIndex) ? prev.filter((i) => i !== wordIndex) : [...prev, wordIndex],
    )
  }

  const renderHighlightableText = (text: string) => {
    const words = text.split(" ")
    return (
      <div className="leading-relaxed">
        {words.map((word, index) => (
          <span
            key={index}
            className={`cursor-pointer transition-colors ${
              highlightedWords.includes(index)
                ? "bg-yellow-200 text-yellow-900 px-1 rounded"
                : "hover:bg-yellow-100 px-1 rounded"
            }`}
            onClick={() => toggleWordHighlight(index)}
          >
            {word}{" "}
          </span>
        ))}
      </div>
    )
  }

  if (!progress) return null

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case "reading":
        return "Reading Phase"
      case "reciting":
        return "Recitation Phase"
      case "review":
        return "Daily Review"
      default:
        return "Practice"
    }
  }

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case "reading":
        return `Read this verse carefully ${10 - progress.readingCount} more times. Click words to highlight key phrases.`
      case "reciting":
        return `Try to recite the verse from memory ${10 - progress.recitingCount} more times. Use the toggle to check your accuracy.`
      case "review":
        return "Review this verse and reflect on its meaning. Add personal notes about how God is speaking to you."
      default:
        return ""
    }
  }

  const overallProgress = ((progress.readingCount + progress.recitingCount + progress.dailyReviewStreak) / 25) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg font-bold text-gray-800 truncate">{verse.reference}</h1>
            <Badge variant="secondary" className="text-xs">
              {getPhaseTitle()}
            </Badge>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{verse.reference}</h1>
            <Badge variant="secondary" className="mt-1">
              {getPhaseTitle()}
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <Target className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>

              {/* Individual Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Reading</div>
                  <Progress value={(progress.readingCount / 10) * 100} className="mb-1" />
                  <div className="text-xs text-gray-500">{progress.readingCount}/10 times</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Reciting</div>
                  <Progress value={(progress.recitingCount / 10) * 100} className="mb-1" />
                  <div className="text-xs text-gray-500">{progress.recitingCount}/10 times</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Review Streak</div>
                  <div className="text-2xl font-bold text-green-600">{progress.dailyReviewStreak}</div>
                  <div className="text-xs text-gray-500">days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Practice Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">{getPhaseTitle()}</CardTitle>
            <p className="text-gray-600 text-sm lg:text-base">{getPhaseDescription()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Verse Display */}
            <div className="relative">
              {showText ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-lg border-l-4 border-blue-500">
                  <div className="text-lg lg:text-xl leading-relaxed text-gray-800 font-medium mb-4">
                    {currentPhase === "reading" ? renderHighlightableText(verse.text) : verse.text}
                  </div>
                  <p className="text-right text-blue-700 font-semibold">— {verse.reference}</p>
                  {currentPhase === "reading" && highlightedWords.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Lightbulb className="h-4 w-4" />
                        <span>{highlightedWords.length} words highlighted for focus</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 p-6 lg:p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                  <p className="text-gray-500 mb-4">Verse text is hidden. Try to recite from memory.</p>
                  <Button variant="outline" onClick={() => setShowText(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Text
                  </Button>
                </div>
              )}

              {currentPhase === "reciting" && (
                <div className="absolute top-4 right-4">
                  <Button variant="outline" size="sm" onClick={() => setShowText(!showText)}>
                    {showText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>

            {/* Phase-specific Actions */}
            {currentPhase === "reading" && (
              <div className="text-center">
                <Button onClick={handleReadingComplete} size="lg" className="w-full sm:w-auto">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mark as Read ({progress.readingCount + 1}/10)
                </Button>
              </div>
            )}

            {currentPhase === "reciting" && (
              <div className="space-y-4">
                <Textarea
                  value={userRecitation}
                  onChange={(e) => setUserRecitation(e.target.value)}
                  placeholder="Type your recitation here to check your accuracy..."
                  rows={4}
                  className="text-base"
                />
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleRecitingAttempt} className="flex-1 sm:flex-none">
                    <Mic className="h-4 w-4 mr-2" />
                    Record Attempt ({progress.recitingCount + 1}/10)
                  </Button>
                  <Button variant="outline" onClick={() => setUserRecitation("")} className="flex-1 sm:flex-none">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {currentPhase === "review" && (
              <div className="text-center">
                <Button
                  onClick={handleMarkMastered}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Reviewed Today
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Reflection & Notes</CardTitle>
            <p className="text-gray-600 text-sm lg:text-base">
              Record insights, applications, or thoughts about this verse.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What is God teaching you through this verse? How can you apply it to your life?"
              rows={3}
              className="text-base"
            />
            <Button onClick={handleAddNote} disabled={!sessionNotes.trim()} className="w-full sm:w-auto">
              Add Note
            </Button>

            {progress.notes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Previous Notes:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {progress.notes.map((note, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                      <p className="text-sm text-gray-700">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
