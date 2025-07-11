// Using Bible API (bible-api.com) - free and simple
const BIBLE_API_BASE = "https://bible-api.com"

export interface BibleVerse {
  reference: string
  verses: Array<{
    book_id: string
    book_name: string
    chapter: number
    verse: number
    text: string
  }>
  text: string
  translation_id: string
  translation_name: string
  translation_note: string
}

export interface BibleBook {
  id: string
  name: string
  chapters: number
}

// Common Bible books for quick selection
export const BIBLE_BOOKS = [
  { id: "genesis", name: "Genesis", chapters: 50 },
  { id: "exodus", name: "Exodus", chapters: 40 },
  { id: "psalms", name: "Psalms", chapters: 150 },
  { id: "proverbs", name: "Proverbs", chapters: 31 },
  { id: "ecclesiastes", name: "Ecclesiastes", chapters: 12 },
  { id: "isaiah", name: "Isaiah", chapters: 66 },
  { id: "jeremiah", name: "Jeremiah", chapters: 52 },
  { id: "matthew", name: "Matthew", chapters: 28 },
  { id: "mark", name: "Mark", chapters: 16 },
  { id: "luke", name: "Luke", chapters: 24 },
  { id: "john", name: "John", chapters: 21 },
  { id: "acts", name: "Acts", chapters: 28 },
  { id: "romans", name: "Romans", chapters: 16 },
  { id: "1corinthians", name: "1 Corinthians", chapters: 16 },
  { id: "2corinthians", name: "2 Corinthians", chapters: 13 },
  { id: "galatians", name: "Galatians", chapters: 6 },
  { id: "ephesians", name: "Ephesians", chapters: 6 },
  { id: "philippians", name: "Philippians", chapters: 4 },
  { id: "colossians", name: "Colossians", chapters: 4 },
  { id: "1thessalonians", name: "1 Thessalonians", chapters: 5 },
  { id: "2thessalonians", name: "2 Thessalonians", chapters: 3 },
  { id: "1timothy", name: "1 Timothy", chapters: 6 },
  { id: "2timothy", name: "2 Timothy", chapters: 4 },
  { id: "titus", name: "Titus", chapters: 3 },
  { id: "hebrews", name: "Hebrews", chapters: 13 },
  { id: "james", name: "James", chapters: 5 },
  { id: "1peter", name: "1 Peter", chapters: 5 },
  { id: "2peter", name: "2 Peter", chapters: 3 },
  { id: "1john", name: "1 John", chapters: 5 },
  { id: "2john", name: "2 John", chapters: 1 },
  { id: "3john", name: "3 John", chapters: 1 },
  { id: "jude", name: "Jude", chapters: 1 },
  { id: "revelation", name: "Revelation", chapters: 22 },
]

export async function searchVerses(query: string): Promise<BibleVerse | null> {
  try {
    const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(query)}?translation=kjv`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching verse:", error)
    return null
  }
}

export async function getVerse(book: string, chapter: number, verse: string): Promise<BibleVerse | null> {
  const reference = `${book} ${chapter}:${verse}`
  return searchVerses(reference)
}

export function formatVerseText(bibleVerse: BibleVerse): { reference: string; text: string } {
  // Clean up the text by removing verse numbers and extra whitespace
  const cleanText = bibleVerse.text
    .replace(/^\d+\s+/, "") // Remove leading verse number
    .replace(/\s+\d+\s+/g, " ") // Remove verse numbers in the middle
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()

  return {
    reference: bibleVerse.reference,
    text: cleanText,
  }
}

// Popular memory verses for quick selection
export const POPULAR_MEMORY_VERSES = [
  "John 3:16",
  "Romans 8:28",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Psalm 23:1",
  "Isaiah 41:10",
  "Matthew 28:19-20",
  "2 Timothy 3:16",
  "Romans 3:23",
  "Ephesians 2:8-9",
  "1 John 1:9",
  "Proverbs 3:5-6",
  "Joshua 1:9",
  "Psalm 119:11",
  "Matthew 6:33",
  "Romans 12:2",
  "Galatians 2:20",
  "1 Corinthians 10:13",
  "Hebrews 11:1",
  "James 1:2-3",
]
