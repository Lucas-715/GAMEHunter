import stringSimilarity from 'string-similarity';

/**
 * Normalizes a game title by removing common suffixes, punctuation, and converting to lowercase.
 * This helps in matching games across different stores that might have slightly different names.
 */
export function normalizeTitle(title: string): string {
  if (!title) return '';
  
  let normalized = title.toLowerCase();
  
  // Remove common edition suffixes
  const suffixesToRemove = [
    'standard edition',
    'premium edition',
    'deluxe edition',
    'ultimate edition',
    'game of the year edition',
    'goty edition',
    'goty',
    'director\'s cut',
    'directors cut',
    'remastered',
    'remake',
    'pc',
    'steam',
    'epic',
    'gog'
  ];
  
  // Remove editions typically separated by hyphens, colons, or parentheses
  for (const suffix of suffixesToRemove) {
    // Replace if it's at the end or inside parentheses/brackets
    const regex = new RegExp(`[\\s\\-\\:\\(\\[]*\\b${suffix}\\b[\\s\\)\\]]*`, 'gi');
    normalized = normalized.replace(regex, ' ');
  }
  
  // Remove all non-alphanumeric characters except spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  
  // Replace multiple spaces with a single space and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Matches a target title against a list of candidate titles.
 * Returns the best match if it meets the confidence threshold.
 */
export function matchGameTitle(
  targetTitle: string, 
  candidates: string[], 
  threshold: number = 0.80
): { bestMatch: string; rating: number } | null {
  if (!candidates || candidates.length === 0) return null;
  
  const normalizedTarget = normalizeTitle(targetTitle);
  const normalizedCandidates = candidates.map(normalizeTitle);
  
  const matches = stringSimilarity.findBestMatch(normalizedTarget, normalizedCandidates);
  
  if (matches.bestMatch.rating >= threshold) {
    // Return the original candidate string, not the normalized one
    return {
      bestMatch: candidates[matches.bestMatchIndex],
      rating: matches.bestMatch.rating
    };
  }
  
  return null;
}
