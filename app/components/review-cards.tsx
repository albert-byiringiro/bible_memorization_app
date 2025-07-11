"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Shuffle, RotateCcw, Menu } from "lucide-react"
import { type Verse, getVerseProgress } from "../lib/storage"

interface ReviewCardsProps {
  verses: Verse[]
  onBack: () => void
}

export default function ReviewCards({ verses, onBack }: ReviewCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showText, setShowText] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [verseOrder, setVerseOrder] = useState(verses)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
        case " ":
          e.preventDefault()
          handleNext()
          break
        case "Enter":
          setShowText(!showText)
          break
        case "s":
          handleShuffle()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [showText])

  const currentVerse = verseOrder[currentIndex]
  const progress = currentVerse ? getVerseProgress(currentVerse.id) : null

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % verseOrder.length)
    setShowText(false)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + verseOrder.length) % verseOrder.length)
    setShowText(false)
  }

  const handleShuffle = () => {
    const shuffledVerses = [...verses].sort(() => Math.random() - 0.5)
    setVerseOrder(shuffledVerses)
    setCurrentIndex(0)
    setShowText(false)
    setShuffled(true)
  }

  const handleReset = () => {
    setVerseOrder(verses)
    setCurrentIndex(0)
    setShowText(false)
    setShuffled(false)
  }

  if (verses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No verses to review</h2>
          <p className="text-gray-600 mb-6">Add some verses first to start reviewing.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

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
            <h1 className="text-lg font-bold text-gray-800">Memory Cards</h1>
            <p className="text-sm text-gray-600">
              {currentIndex + 1} of {verseOrder.length}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Controls */}
        {showControls && (
          <div className="border-t bg-white p-4 space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={shuffled ? handleReset : handleShuffle}
                className="flex-1 bg-transparent"
              >
                {shuffled ? <RotateCcw className="h-4 w-4 mr-2" /> : <Shuffle className="h-4 w-4 mr-2" />}
                {shuffled ? "Reset" : "Shuffle"}
              </Button>
              <Button variant="outline" onClick={() => setShowText(!showText)} className="flex-1">
                {showText ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showText ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Memory Cards</h1>
            <p className="text-gray-600">
              Card {currentIndex + 1} of {verseOrder.length}
              {shuffled && (
                <Badge variant="secondary" className="ml-2">
                  Shuffled
                </Badge>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={shuffled ? handleReset : handleShuffle}>
              {shuffled ? <RotateCcw className="h-4 w-4 mr-2" /> : <Shuffle className="h-4 w-4 mr-2" />}
              {shuffled ? "Reset" : "Shuffle"}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="hidden lg:block text-center mb-4">
          <p className="text-sm text-gray-500">Use ← → to navigate, Enter to toggle text, S to shuffle</p>
        </div>

        {/* Main Card */}
        <Card className="mb-6 min-h-[400px] lg:min-h-[500px] shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl lg:text-2xl text-blue-800 mb-2">{currentVerse.reference}</CardTitle>
                {progress && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={progress.currentStep >= 4 ? "default" : "secondary"}>
                      {progress.currentStep >= 4 ? "Mastered" : "In Progress"}
                    </Badge>
                    <Badge variant="outline">{progress.dailyReviewStreak} day streak</Badge>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => setShowText(!showText)} className="w-full sm:w-auto">
                {showText ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showText ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showText ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-lg border-l-4 border-blue-500">
                  <p className="text-lg lg:text-xl leading-relaxed text-gray-800 font-medium">{currentVerse.text}</p>
                </div>
                {currentVerse.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-medium text-gray-700 mb-2">Personal Notes:</h4>
                    <p className="text-gray-700">{currentVerse.notes}</p>
                  </div>
                )}
                {progress && progress.notes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Recent Reflections:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {progress.notes.slice(-3).map((note, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <p className="text-sm text-gray-700">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 lg:h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-500 mb-4 text-lg">Try to recite this verse from memory</p>
                  <p className="text-2xl lg:text-3xl font-bold text-blue-600">{currentVerse.reference}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={verseOrder.length <= 1}
            className="w-20 lg:w-auto bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-0 lg:mr-2" />
            <span className="hidden lg:inline">Previous</span>
          </Button>

          {/* Progress Dots */}
          <div className="flex gap-1 lg:gap-2 max-w-xs overflow-x-auto">
            {verseOrder.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setShowText(false)
                }}
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-colors flex-shrink-0 ${
                  index === currentIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
            {verseOrder.length > 10 && (
              <span className="text-gray-400 text-sm self-center">+{verseOrder.length - 10}</span>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={verseOrder.length <= 1}
            className="w-20 lg:w-auto bg-transparent"
          >
            <span className="hidden lg:inline">Next</span>
            <ArrowRight className="h-4 w-4 ml-0 lg:ml-2" />
          </Button>
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="lg:hidden mt-4 flex gap-2">
          <Button onClick={handlePrevious} disabled={verseOrder.length <= 1} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={verseOrder.length <= 1} className="flex-1">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
