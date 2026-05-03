/**
 * Template Dictionary
 *
 * This is the authoritative catalog of templates available to the AI director.
 * Each entry defines:
 *  - The template ID (matches the component map in DynamicTemplateRenderer)
 *  - What narrative role it plays in a video
 *  - What props the AI must fill in (with types and descriptions)
 *  - Default/fallback values for optional props
 *
 * This dictionary is serialized into the AI prompt so the model can make
 * informed, structured decisions about template selection and prop filling.
 */

export interface TemplatePropDef {
  type: 'text' | 'number' | 'color' | 'boolean'
  desc: string
  required: boolean
  defaultValue?: string | number | boolean
}

export interface TemplateDictEntry {
  id: string
  name: string
  bestFor: string[]          // narrative roles: "hook" | "problem" | "solution" | "features" | "cta" | "data" | "transition"
  description: string        // plain English for the AI
  durationSeconds: number    // how long this clip runs (fixed per template)
  props: Record<string, TemplatePropDef>
}

// ─── The Dictionary ───────────────────────────────────────────────────────────

export const TEMPLATE_DICT: TemplateDictEntry[] = [
  {
    id: 'FutureOfDesign',
    name: 'Future of Design',
    bestFor: ['hook', 'cta'],
    description: 'Blur-slide reveal with a large italic serif hero word flanked by small caps text. Elegant, cinematic, luxury tech feel.',
    durationSeconds: 4,
    props: {
      smallText:       { type: 'text',   desc: '1–2 word label above the hero word (e.g. "THE", "MEET", "BUILD")', required: true },
      mainText:        { type: 'text',   desc: 'The single HERO word displayed large in italic serif. 1–2 words max.', required: true },
      subText:         { type: 'text',   desc: '2–4 word phrase displayed below in small caps', required: true },
      backgroundColor: { type: 'color',  desc: 'Background hex color. Dark recommended (e.g. "#0f172a")', required: false, defaultValue: '#0f172a' },
      textColor:       { type: 'color',  desc: 'Text color. Usually white for dark bg.', required: false, defaultValue: '#FFFFFF' },
      glowColor:       { type: 'color',  desc: 'Glow/accent color around hero word. Use brand primary color.', required: false, defaultValue: '#a855f7' },
      glowIntensity:   { type: 'number', desc: '0–10. Higher = more dramatic glow.', required: false, defaultValue: 5 },
    },
  },
  {
    id: 'EditorialDesign',
    name: 'Editorial Minimalist',
    bestFor: ['hook', 'problem', 'solution'],
    description: 'Left-aligned masked text reveal with Ken Burns background scale. Editorial newspaper aesthetic.',
    durationSeconds: 4,
    props: {
      smallText:       { type: 'text',  desc: '2–4 uppercase words as the label/eyebrow text (e.g. "THE PROBLEM", "INTRODUCING")', required: true },
      mainText:        { type: 'text',  desc: 'The main hero word in large italic serif. 1–2 words.', required: true },
      subText:         { type: 'text',  desc: '3–5 uppercase words below (e.g. "OF DEVELOPER TOOLS")', required: true },
      backgroundColor: { type: 'color', desc: 'Background hex color. Black or very dark recommended.', required: false, defaultValue: '#000000' },
      textColor:       { type: 'color', desc: 'Text color hex. Usually #FFFFFF for dark backgrounds.', required: false, defaultValue: '#FFFFFF' },
    },
  },
  {
    id: 'KineticTunnel',
    name: 'Kinetic Typography Tunnel',
    bestFor: ['hook', 'transition', 'cta'],
    description: 'Perspective text rings flying toward the viewer through a tunnel. High energy, immersive.',
    durationSeconds: 4,
    props: {
      text:            { type: 'text',  desc: 'The repeated phrase flying through the tunnel rings. 3–6 words, ends with a space.', required: true },
      backgroundColor: { type: 'color', desc: 'Background color. Black "#000000" works best.', required: false, defaultValue: '#000000' },
      textColor:       { type: 'color', desc: 'Ring text color.', required: false, defaultValue: '#FFFFFF' },
      accentColor:     { type: 'color', desc: 'Central portal glow color. Use brand primary.', required: false, defaultValue: '#007AFF' },
    },
  },
  {
    id: 'EnergyText',
    name: 'Energy Text',
    bestFor: ['hook', 'solution'],
    description: 'Large words slam in one-by-one with disintegration particle effects. High impact, motivational.',
    durationSeconds: 4,
    props: {
      beText:       { type: 'text',  desc: 'First word (usually a verb like "BUILD", "SHIP", "MEET")', required: true },
      theText:      { type: 'text',  desc: 'Second word (article or adjective like "THE", "YOUR")', required: true },
      mainWord:     { type: 'text',  desc: 'THE BIG HERO WORD — the main concept, displayed largest', required: true },
      youText:      { type: 'text',  desc: 'Fourth word', required: true },
      wantText:     { type: 'text',  desc: 'Fifth word', required: true },
      toText:       { type: 'text',  desc: 'Sixth word (short connector, e.g. "TO", "IN", "FOR")', required: true },
      attractText:  { type: 'text',  desc: 'Seventh word — the closing punch (e.g. "DEVELOPERS", "WORLD")', required: true },
      backgroundColor: { type: 'color', desc: 'Background. White "#ffffff" or black "#000000"', required: false, defaultValue: '#ffffff' },
      textColor:    { type: 'color',  desc: 'Text color.', required: false, defaultValue: '#000000' },
    },
  },
  {
    id: 'SentenceReveal',
    name: 'Sentence Reveal',
    bestFor: ['problem', 'features', 'solution'],
    description: 'A curved vertical stack of words cycles through, with the active word highlighted. Like a slot machine of concepts.',
    durationSeconds: 5,
    props: {
      word1: { type: 'text', desc: 'First word/phrase in the cycling list', required: true },
      word2: { type: 'text', desc: 'Second word/phrase', required: true },
      word3: { type: 'text', desc: 'Third word/phrase', required: true },
      word4: { type: 'text', desc: 'Fourth word/phrase', required: true },
      word5: { type: 'text', desc: 'Fifth word/phrase', required: true },
      word6: { type: 'text', desc: 'Sixth word/phrase', required: true },
      word7: { type: 'text', desc: 'Seventh word/phrase', required: true },
      backgroundColor:  { type: 'color', desc: 'Background color', required: false, defaultValue: '#fcfcfc' },
      mutedTextColor:   { type: 'color', desc: 'Color of non-active words (muted)', required: false, defaultValue: '#999999' },
      activeTextColor:  { type: 'color', desc: 'Color of the active/highlighted word', required: false, defaultValue: '#1a1a1a' },
    },
  },
  {
    id: 'ListOfThings',
    name: 'List of Things',
    bestFor: ['features', 'solution'],
    description: 'Four staggered cards each with an icon and label, sliding in from the left. Great for feature lists.',
    durationSeconds: 5,
    props: {
      venue1Icon:  { type: 'text', desc: 'Emoji icon for item 1 (e.g. "⚡", "🔒", "🛠️")', required: true },
      venue1Label: { type: 'text', desc: 'Short label for item 1 (2–4 words)', required: true },
      venue2Icon:  { type: 'text', desc: 'Emoji icon for item 2', required: true },
      venue2Label: { type: 'text', desc: 'Short label for item 2', required: true },
      venue3Icon:  { type: 'text', desc: 'Emoji icon for item 3', required: true },
      venue3Label: { type: 'text', desc: 'Short label for item 3', required: true },
      venue4Icon:  { type: 'text', desc: 'Emoji icon for item 4', required: true },
      venue4Label: { type: 'text', desc: 'Short label for item 4', required: true },
      backgroundColor: { type: 'color', desc: 'Background color', required: false, defaultValue: '#ffffff' },
      textColor:       { type: 'color', desc: 'Text color', required: false, defaultValue: '#111827' },
      accentColor:     { type: 'color', desc: 'Icon/accent color', required: false, defaultValue: '#3b82f6' },
    },
  },
  {
    id: 'TerminalShowcase',
    name: 'Terminal Showcase',
    bestFor: ['solution', 'features', 'cta'],
    description: 'Animated macOS-style terminal window with typed command and scrolling output. Perfect for CLI and dev tools.',
    durationSeconds: 5,
    props: {
      command:     { type: 'text', desc: 'The shell command to display (e.g. "npm install mylib" or "npx create-app")', required: true },
      outputBody:  { type: 'text', desc: 'Multi-line terminal output separated by \\n (newline). Show 3–5 lines of realistic output.', required: true },
      promptSymbol: { type: 'text', desc: 'Shell prompt symbol (e.g. "~", "$", ">")', required: false, defaultValue: '~' },
      backgroundColor: { type: 'color', desc: 'Outer background color', required: false, defaultValue: '#f8fafc' },
      terminalBg:  { type: 'color', desc: 'Terminal window background', required: false, defaultValue: '#ffffff' },
      textColor:   { type: 'color', desc: 'Terminal text color', required: false, defaultValue: '#333333' },
      promptColor: { type: 'color', desc: 'Prompt symbol color', required: false, defaultValue: '#2ecc71' },
      accentColor: { type: 'color', desc: 'Accent/highlight color', required: false, defaultValue: '#3d9970' },
    },
  },
  {
    id: 'TerminalTyping',
    name: 'Terminal Typing',
    bestFor: ['solution', 'cta'],
    description: 'VS Code style editor with animated syntax-highlighted code being typed. For developer-oriented repos.',
    durationSeconds: 4,
    props: {
      variableName: { type: 'text', desc: 'Variable name being assigned (e.g. "result", "app", "client")', required: true },
      typedText:    { type: 'text', desc: 'String value being typed. Keep under 60 characters.', required: true },
      backgroundColor: { type: 'color', desc: 'Outer background color', required: false, defaultValue: '#1ca7e3' },
      editorColor:  { type: 'color', desc: 'Editor background (usually dark)', required: false, defaultValue: '#0a0a0a' },
    },
  },
  {
    id: 'GithubStars1',
    name: 'GitHub Stars Chart',
    bestFor: ['data', 'cta'],
    description: 'Animated line chart showing GitHub star growth over time. Great social proof moment.',
    durationSeconds: 5,
    props: {
      repoName:        { type: 'text',   desc: 'Repository name (owner/repo format, e.g. "samirpatil2000/claude-pulse")', required: true },
      targetStars:     { type: 'number', desc: 'Current star count (used as the chart peak)', required: true },
      backgroundColor: { type: 'color',  desc: 'Background color', required: false, defaultValue: '#ffffff' },
      lineColor:       { type: 'color',  desc: 'Chart line color', required: false, defaultValue: '#e85d3b' },
      textColor:       { type: 'color',  desc: 'Text color', required: false, defaultValue: '#1a1a1a' },
    },
  },
  {
    id: 'BarChart',
    name: 'Bar Chart',
    bestFor: ['data', 'features'],
    description: 'Animated vertical bar chart with glowing bars. Abstract data visualization.',
    durationSeconds: 4,
    props: {
      backgroundColor: { type: 'color',  desc: 'Background color (black works best)', required: false, defaultValue: '#000000' },
      barColor:        { type: 'color',  desc: 'Bar fill color', required: false, defaultValue: '#ffffff' },
      accentColor:     { type: 'color',  desc: 'Accent/highlight color', required: false, defaultValue: '#22c55e' },
      barCount:        { type: 'number', desc: 'Number of bars (5–9)', required: false, defaultValue: 7 },
    },
  },
  {
    id: 'ScatteredText',
    name: 'Scattered Text',
    bestFor: ['hook', 'transition'],
    description: 'A phrase repeated across scattered rows in alternating directions, cycling continuously. Energetic scrolling.',
    durationSeconds: 4,
    props: {
      phrase:          { type: 'text',   desc: 'Short repeating phrase in ALL CAPS (3–5 words)', required: true },
      rowCount:        { type: 'number', desc: 'Number of text rows (8–14)', required: false, defaultValue: 10 },
      backgroundColor: { type: 'color',  desc: 'Background color', required: false, defaultValue: '#0f0f0f' },
      textColor:       { type: 'color',  desc: 'Text color', required: false, defaultValue: '#ffffff' },
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the dictionary entry for a given template ID, or undefined */
export function getDictEntry(id: string): TemplateDictEntry | undefined {
  return TEMPLATE_DICT.find((t) => t.id === id)
}

/** Serialized form suitable for embedding in AI prompts */
export function getDictionaryForPrompt(): string {
  return JSON.stringify(
    TEMPLATE_DICT.map((t) => ({
      id: t.id,
      name: t.name,
      bestFor: t.bestFor,
      description: t.description,
      durationSeconds: t.durationSeconds,
      props: Object.fromEntries(
        Object.entries(t.props).map(([k, v]) => [
          k,
          { type: v.type, desc: v.desc, required: v.required, ...(v.defaultValue !== undefined ? { default: v.defaultValue } : {}) },
        ])
      ),
    })),
    null,
    2
  )
}

/** Returns an entry's default props (for fallback rendering) */
export function getDefaultProps(id: string): Record<string, string | number | boolean> {
  const entry = getDictEntry(id)
  if (!entry) return {}
  return Object.fromEntries(
    Object.entries(entry.props)
      .filter(([, v]) => v.defaultValue !== undefined)
      .map(([k, v]) => [k, v.defaultValue!])
  )
}
