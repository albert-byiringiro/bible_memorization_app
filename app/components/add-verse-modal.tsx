"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, BookOpen, Edit3, Loader2, Star } from "lucide-react"
import { type Verse, saveVerse, initializeVerseProgress } from "../lib/storage"
import {
  searchVerses,
  getVerse,
  formatVerseText,
  BIBLE_BOOKS,
  POPULAR_MEMORY_VERSES,
  type BibleVerse,
} from "../lib/bible-api"

interface AddVerseModalProps {
  isOpen: boolean
  onClose: () => void
  onVerseAdded: (verse: Verse) => void
}

export default function AddVerseModal({ isOpen, onClose, onVerseAdded }: AddVerseModalProps) {
  // Manual input state
  const [reference, setReference] = useState("")
  const [text, setText] = useState("")
  const [notes, setNotes] = useState("")

  // Bible API state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBook, setSelectedBook] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedVerse, setSelectedVerse] = useState("")
  const [searchResults, setSearchResults] = useState<BibleVerse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedApiVerse, setSelectedApiVerse] = useState<{ reference: string; text: string } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  const handleSearchVerses = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const result = await searchVerses(searchQuery)
      setSearchResults(result)
      if (result) {
        const formatted = formatVerseText(result)
        setSelectedApiVerse(formatted)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGetSpecificVerse = async () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) return

    setIsSearching(true)
    try {
      const result = await getVerse(selectedBook, Number.parseInt(selectedChapter), selectedVerse)
      setSearchResults(result)
      if (result) {
        const formatted = formatVerseText(result)
        setSelectedApiVerse(formatted)
      }
    } catch (error) {
      console.error("Verse fetch failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePopularVerseSelect = async (verseRef: string) => {
    setSearchQuery(verseRef)
    setIsSearching(true)
    try {
      const result = await searchVerses(verseRef)
      setSearchResults(result)
      if (result) {
        const formatted = formatVerseText(result)
        setSelectedApiVerse(formatted)
      }
    } catch (error) {
      console.error("Popular verse fetch failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let verseData: { reference: string; text: string }

    if (activeTab === "search" && selectedApiVerse) {
      verseData = selectedApiVerse
    } else if (activeTab === "manual") {
      if (!reference.trim() || !text.trim()) return
      verseData = { reference: reference.trim(), text: text.trim() }
    } else {
      return
    }

    setIsSubmitting(true)

    const newVerse: Verse = {
      id: Date.now().toString(),
      reference: verseData.reference,
      text: verseData.text,
      notes: notes.trim() || undefined,
      dateAdded: new Date().toISOString(),
    }

    saveVerse(newVerse)
    initializeVerseProgress(newVerse.id)
    onVerseAdded(newVerse)

    // Reset form
    resetForm()
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setReference("")
    setText("")
    setNotes("")
    setSearchQuery("")
    setSelectedBook("")
    setSelectedChapter("")
    setSelectedVerse("")
    setSearchResults(null)
    setSelectedApiVerse(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedBookData = BIBLE_BOOKS.find((book) => book.id === selectedBook)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Verse to Memorize</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Bible
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Manual Input
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Popular Verses */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4" />
                Popular Memory Verses
              </Label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_MEMORY_VERSES.slice(0, 10).map((verse) => (
                  <Badge
                    key={verse}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handlePopularVerseSelect(verse)}
                  >
                    {verse}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Search by Reference */}
            <div>
              <Label htmlFor="search">Search by Reference</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., John 3:16, Romans 8:28-30, Psalm 23"
                  onKeyDown={(e) => e.key === "Enter" && handleSearchVerses()}
                />
                <Button onClick={handleSearchVerses} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Browse by Book/Chapter/Verse */}
            <div>
              <Label>Browse by Book, Chapter & Verse</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Book" />
                  </SelectTrigger>
                  <SelectContent>
                    {BIBLE_BOOKS.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBookData &&
                      Array.from({ length: selectedBookData.chapters }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Chapter {i + 1}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    value={selectedVerse}
                    onChange={(e) => setSelectedVerse(e.target.value)}
                    placeholder="Verse(s)"
                    disabled={!selectedChapter}
                  />
                  <Button
                    onClick={handleGetSpecificVerse}
                    disabled={isSearching || !selectedBook || !selectedChapter || !selectedVerse}
                    size="sm"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {selectedApiVerse && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">{selectedApiVerse.reference}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{selectedApiVerse.text}</p>
                  <Badge variant="secondary">Ready to add</Badge>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label htmlFor="manual-reference">Scripture Reference</Label>
              <Input
                id="manual-reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., John 3:16, Romans 8:28"
              />
            </div>

            <div>
              <Label htmlFor="manual-text">Verse Text</Label>
              <Textarea
                id="manual-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the complete verse text..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes Section (common to both tabs) */}
        <div>
          <Label htmlFor="notes">Personal Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why is this verse meaningful to you? What context or insights would help your memorization?"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (activeTab === "search" && !selectedApiVerse) ||
              (activeTab === "manual" && (!reference.trim() || !text.trim()))
            }
          >
            {isSubmitting ? "Adding..." : "Add Verse"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
