"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus } from "lucide-react"

interface VerseSuggestion {
  reference: string
  text: string
  category: string
  description: string
}

const VERSE_SUGGESTIONS: VerseSuggestion[] = [
  {
    reference: "Psalm 119:11",
    text: "Thy word have I hid in mine heart, that I might not sin against thee.",
    category: "Scripture Memory",
    description: "The foundational verse about hiding God's word in our hearts",
  },
  {
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:",
    category: "Scripture",
    description: "About the inspiration and purpose of Scripture",
  },
  {
    reference: "Joshua 1:8",
    text: "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.",
    category: "Meditation",
    description: "God's command to meditate on His word day and night",
  },
  {
    reference: "Colossians 3:16",
    text: "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the Lord.",
    category: "Scripture Memory",
    description: "Letting Christ's word dwell richly within us",
  },
  {
    reference: "Romans 10:17",
    text: "So then faith cometh by hearing, and hearing by the word of God.",
    category: "Faith",
    description: "How faith grows through God's word",
  },
  {
    reference: "Hebrews 4:12",
    text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
    category: "Scripture",
    description: "The power and effectiveness of God's word",
  },
]

interface VerseSuggestionsProps {
  onSelectVerse: (reference: string, text: string) => void
}

export default function VerseSuggestions({ onSelectVerse }: VerseSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(VERSE_SUGGESTIONS.map((v) => v.category)))
  const filteredSuggestions = selectedCategory
    ? VERSE_SUGGESTIONS.filter((v) => v.category === selectedCategory)
    : VERSE_SUGGESTIONS

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">Suggested Verses for Memorization</h3>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Suggestions */}
      <div className="grid gap-4">
        {filteredSuggestions.map((suggestion) => (
          <Card key={suggestion.reference} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-blue-800">{suggestion.reference}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {suggestion.category}
                  </Badge>
                </div>
                <Button size="sm" onClick={() => onSelectVerse(suggestion.reference, suggestion.text)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-3 italic">"{suggestion.text}"</p>
              <p className="text-sm text-gray-600">{suggestion.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
