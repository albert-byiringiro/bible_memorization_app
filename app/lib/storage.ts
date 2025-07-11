export interface Verse {
  id: string
  reference: string
  text: string
  notes?: string
  dateAdded: string
}

export interface VerseProgress {
  verseId: string
  currentStep: number // 0: reading, 1: reciting, 2: daily review, 3: mastered
  readingCount: number
  recitingCount: number
  lastPracticed: string
  dailyReviewStreak: number
  notes: string[]
}

const VERSES_KEY = "bible-memorization-verses"
const PROGRESS_KEY = "bible-memorization-progress"

export function getStoredVerses(): Verse[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(VERSES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveVerse(verse: Verse): void {
  const verses = getStoredVerses()
  const existingIndex = verses.findIndex((v) => v.id === verse.id)

  if (existingIndex >= 0) {
    verses[existingIndex] = verse
  } else {
    verses.push(verse)
  }

  localStorage.setItem(VERSES_KEY, JSON.stringify(verses))
}

export function deleteVerse(verseId: string): void {
  const verses = getStoredVerses().filter((v) => v.id !== verseId)
  localStorage.setItem(VERSES_KEY, JSON.stringify(verses))

  // Also delete progress
  const allProgress = getAllProgress()
  const filteredProgress = allProgress.filter((p) => p.verseId !== verseId)
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(filteredProgress))
}

export function getAllProgress(): VerseProgress[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(PROGRESS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getVerseProgress(verseId: string): VerseProgress | null {
  const allProgress = getAllProgress()
  return allProgress.find((p) => p.verseId === verseId) || null
}

export function saveVerseProgress(progress: VerseProgress): void {
  const allProgress = getAllProgress()
  const existingIndex = allProgress.findIndex((p) => p.verseId === progress.verseId)

  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress
  } else {
    allProgress.push(progress)
  }

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress))
}

export function initializeVerseProgress(verseId: string): VerseProgress {
  const progress: VerseProgress = {
    verseId,
    currentStep: 0,
    readingCount: 0,
    recitingCount: 0,
    lastPracticed: new Date().toISOString(),
    dailyReviewStreak: 0,
    notes: [],
  }

  saveVerseProgress(progress)
  return progress
}
