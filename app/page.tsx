"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Plus, Clock, Heart, Target, Search, Menu, X, Flame } from "lucide-react"
import AddVerseModal from "./components/add-verse-modal"
import PracticeSession from "./components/practice-session"
import ReviewCards from "./components/review-cards"
import { type Verse, getStoredVerses, getVerseProgress, saveVerse, initializeVerseProgress } from "./lib/storage"
import VerseSuggestions from "./components/verse-suggestions"

export default function BibleMemorizationApp() {
  const [verses, setVerses] = useState<Verse[]>([])
  const [filteredVerses, setFilteredVerses] = useState<Verse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentView, setCurrentView] = useState<"dashboard" | "add" | "practice" | "review">("dashboard")
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const storedVerses = getStoredVerses()
    setVerses(storedVerses)
    setFilteredVerses(storedVerses)
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = verses.filter(
        (verse) =>
          verse.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          verse.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          verse.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredVerses(filtered)
    } else {
      setFilteredVerses(verses)
    }
  }, [searchTerm, verses])

  const handleVerseAdded = (newVerse: Verse) => {
    setVerses((prev) => [...prev, newVerse])
    setShowAddModal(false)
  }

  const handleStartPractice = (verse: Verse) => {
    setSelectedVerse(verse)
    setCurrentView("practice")
  }

  const getProgressStats = () => {
    const total = verses.length
    const inProgress = verses.filter((v) => {
      const progress = getVerseProgress(v.id)
      return progress && progress.currentStep < 4
    }).length
    const mastered = verses.filter((v) => {
      const progress = getVerseProgress(v.id)
      return progress && progress.currentStep >= 4
    }).length

    // Calculate streak
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const hasStudiedToday = verses.some((v) => {
      const progress = getVerseProgress(v.id)
      return progress && new Date(progress.lastPracticed).toDateString() === today
    })
    const hasStudiedYesterday = verses.some((v) => {
      const progress = getVerseProgress(v.id)
      return progress && new Date(progress.lastPracticed).toDateString() === yesterday
    })

    const currentStreak = hasStudiedToday ? (hasStudiedYesterday ? 2 : 1) : 0

    return { total, inProgress, mastered, currentStreak, hasStudiedToday }
  }

  const stats = getProgressStats()

  const handleSuggestionSelect = (reference: string, text: string) => {
    const newVerse: Verse = {
      id: Date.now().toString(),
      reference,
      text,
      dateAdded: new Date().toISOString(),
    }

    saveVerse(newVerse)
    initializeVerseProgress(newVerse.id)
    setVerses((prev) => [...prev, newVerse])
    setShowSuggestions(false)
  }

  if (currentView === "practice" && selectedVerse) {
    return (
      <PracticeSession
        verse={selectedVerse}
        onComplete={() => {
          setCurrentView("dashboard")
          setSelectedVerse(null)
          setVerses(getStoredVerses())
        }}
        onBack={() => {
          setCurrentView("dashboard")
          setSelectedVerse(null)
        }}
      />
    )
  }

  if (currentView === "review") {
    return <ReviewCards verses={verses} onBack={() => setCurrentView("dashboard")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">Scripture Memory</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden">
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="border-t bg-white p-4 space-y-3">
            <Button onClick={() => setShowAddModal(true)} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Verse
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView("review")}
              disabled={verses.length === 0}
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Review Cards
            </Button>
            <Button variant="outline" onClick={() => setShowSuggestions(!showSuggestions)} className="w-full">
              <Heart className="h-4 w-4 mr-2" />
              {showSuggestions ? "Hide" : "Browse"} Suggestions
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 lg:h-12 lg:w-12 text-blue-600" />
            Scripture Memory
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            "Let the word of Christ dwell in you richly" - Colossians 3:16
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 lg:p-6 text-center">
              <Target className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-xs lg:text-sm text-gray-600">Total Verses</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 lg:p-6 text-center">
              <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xl lg:text-2xl font-bold text-gray-800">{stats.inProgress}</div>
              <div className="text-xs lg:text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 lg:p-6 text-center">
              <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl lg:text-2xl font-bold text-gray-800">{stats.mastered}</div>
              <div className="text-xs lg:text-sm text-gray-600">Mastered</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 lg:p-6 text-center">
              <Flame className="h-6 w-6 lg:h-8 lg:w-8 text-red-500 mx-auto mb-2" />
              <div className="text-xl lg:text-2xl font-bold text-gray-800">{stats.currentStreak}</div>
              <div className="text-xs lg:text-sm text-gray-600">Day Streak</div>
              {stats.hasStudiedToday && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Today ✓
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex flex-wrap gap-4 mb-8 justify-center">
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Verse
          </Button>
          <Button variant="outline" onClick={() => setCurrentView("review")} disabled={verses.length === 0}>
            <BookOpen className="h-4 w-4 mr-2" />
            Review Cards
          </Button>
          <Button variant="outline" onClick={() => setShowSuggestions(!showSuggestions)}>
            <Heart className="h-4 w-4 mr-2" />
            {showSuggestions ? "Hide" : "Browse"} Suggestions
          </Button>
        </div>

        {/* Search Bar */}
        {verses.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search verses, references, or notes..."
                className="pl-10"
              />
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="mb-8">
            <VerseSuggestions onSelectVerse={handleSuggestionSelect} />
          </div>
        )}

        {/* Verses List */}
        <div className="space-y-4">
          {verses.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 lg:p-12 text-center">
                <BookOpen className="h-16 w-16 lg:h-20 lg:w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-600 mb-3">Begin Your Journey</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start memorizing Scripture today. Add your first verse and begin hiding God's Word in your heart.
                </p>
                <Button onClick={() => setShowAddModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Verse
                </Button>
              </CardContent>
            </Card>
          ) : filteredVerses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No verses found</h3>
                <p className="text-gray-500">Try adjusting your search terms.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:gap-6">
              {filteredVerses.map((verse) => {
                const progress = getVerseProgress(verse.id)
                const stepNames = ["Reading", "Reciting", "Daily Review", "Mastered"]
                const currentStep = progress?.currentStep || 0
                const progressPercentage = ((currentStep + 1) / 4) * 100

                return (
                  <Card key={verse.id} className="hover:shadow-lg transition-all duration-200 group">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg lg:text-xl text-blue-800 mb-2">{verse.reference}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={currentStep >= 4 ? "default" : "secondary"}>
                              {currentStep >= 4 ? "Mastered" : stepNames[currentStep]}
                            </Badge>
                            {progress && progress.dailyReviewStreak > 0 && (
                              <Badge variant="outline" className="text-orange-600">
                                <Flame className="h-3 w-3 mr-1" />
                                {progress.dailyReviewStreak} days
                              </Badge>
                            )}
                          </div>
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartPractice(verse)}
                          size="sm"
                          className="w-full sm:w-auto group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        >
                          Practice
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-3 text-sm lg:text-base">{verse.text}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs lg:text-sm text-gray-500">
                        {progress && (
                          <span>Last practiced: {new Date(progress.lastPracticed).toLocaleDateString()}</span>
                        )}
                        <span>Added: {new Date(verse.dateAdded).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Verse Modal */}
        <AddVerseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onVerseAdded={handleVerseAdded} />
      </div>
    </div>
  )
}
