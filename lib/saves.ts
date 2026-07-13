export type SaveKind = "Post" | "Reply"

export type SaveItem = {
  id: string
  kind: SaveKind
  title: string
  author: string
  savedAt: string
  relative: string
  tag: string
  sourceUrl: string
  snippet: string
  body: string[]
}

export const folders = [
  { name: "General", count: 42 },
  { name: "Religion", count: 18 },
  { name: "Tech", count: 27 },
  { name: "Stories", count: 11 },
]

export const saves: SaveItem[] = [
  {
    id: "1",
    kind: "Post",
    title: "What are the habits that quietly changed my life the most?",
    author: "Smooaa Mhara",
    savedAt: "March 3, 2026",
    relative: "2h ago",
    tag: "General",
    sourceUrl: "quora.com/q/habits-life",
    snippet:
      "The biggest shifts never felt dramatic. They were small, boring decisions repeated on days I did not feel like showing up at all.",
    body: [
      "The biggest shifts never felt dramatic. They were small, boring decisions repeated on days I did not feel like showing up at all. Nobody claps for you when you go to bed on time or when you read ten pages instead of scrolling. But those unglamorous choices compound.",
      "I used to think transformation required a single heroic moment — a resignation letter, a move across the country, a grand gesture. In reality, the people I admire most simply refused to break tiny promises to themselves.",
      "If I had to distill it: protect your mornings, write things down, and treat your future self like someone you actually respect. The rest tends to follow.",
    ],
  },
  {
    id: "2",
    kind: "Reply",
    title: "Re: Is it rational to believe in something you cannot prove?",
    author: "Idris Fadel",
    savedAt: "March 2, 2026",
    relative: "Yesterday",
    tag: "Religion",
    sourceUrl: "quora.com/q/rational-belief",
    snippet:
      "Rationality is not the same as certainty. We act on incomplete information constantly — trust, love, and hope all live in that gap.",
    body: [
      "Rationality is not the same as certainty. We act on incomplete information constantly — trust, love, and hope all live in that gap between what we know and what we choose.",
      "The demand for absolute proof before belief would paralyze ordinary life. You board planes you cannot inspect and eat meals you did not cook. Faith, in the broad sense, is simply how finite minds move forward.",
      "So the honest question is not 'can you prove it?' but 'is this belief coherent, humane, and lived with integrity?'",
    ],
  },
  {
    id: "3",
    kind: "Post",
    title: "The one architecture decision I regret most as a senior engineer",
    author: "Lena Okafor",
    savedAt: "Feb 28, 2026",
    relative: "3d ago",
    tag: "Tech",
    sourceUrl: "quora.com/q/architecture-regret",
    snippet:
      "We optimized for a scale we never reached and paid for it every single sprint with complexity nobody could hold in their head.",
    body: [
      "We optimized for a scale we never reached and paid for it every single sprint with complexity nobody could hold in their head. Twelve microservices for a product with four thousand users.",
      "The seduction was real: it felt responsible, future-proof, senior. But every feature now touched three repos, two queues, and a deploy pipeline that took forty minutes to fail.",
      "If I could go back, I would build the boring monolith and split it only when a real bottleneck screamed at me — not when a diagram looked impressive on a whiteboard.",
    ],
  },
  {
    id: "4",
    kind: "Reply",
    title: "Re: What is a short story that has stayed with you for years?",
    author: "Marco Vitelli",
    savedAt: "Feb 26, 2026",
    relative: "1w ago",
    tag: "Stories",
    sourceUrl: "quora.com/q/short-story",
    snippet:
      "A lighthouse keeper who kept the lamp lit for a ship that had already sunk. He knew. He lit it anyway, for the next one.",
    body: [
      "A lighthouse keeper who kept the lamp lit for a ship that had already sunk. He knew. He lit it anyway, for the next one.",
      "The story never explains whether anyone noticed his devotion, and that is exactly why it lingers. Meaning did not depend on an audience.",
      "I think about it whenever my work feels invisible. Some lamps are lit for ships we will never see arrive.",
    ],
  },
  {
    id: "5",
    kind: "Post",
    title: "Why does compound interest feel like magic but budgeting feels like punishment?",
    author: "Priya Nandakumar",
    savedAt: "Feb 24, 2026",
    relative: "1w ago",
    tag: "General",
    sourceUrl: "quora.com/q/compound-magic",
    snippet:
      "Both are the same math. One promises you a future reward, the other reminds you of a present limit — and our brains hate limits.",
    body: [
      "Both are the same math. One promises you a future reward, the other reminds you of a present limit — and our brains hate limits far more than they love gains.",
      "The trick that finally worked for me was reframing a budget as a plan for the things I actually want, rather than a list of things I am forbidden.",
      "Automate the boring part, then let compounding do the quiet, magical work in the background.",
    ],
  },
  {
    id: "6",
    kind: "Reply",
    title: "Re: How do you stay curious after decades in the same field?",
    author: "Dr. Amina Sow",
    savedAt: "Feb 20, 2026",
    relative: "2w ago",
    tag: "Tech",
    sourceUrl: "quora.com/q/stay-curious",
    snippet:
      "I keep a running list of questions I cannot yet answer. As long as that list grows faster than I can shrink it, I never get bored.",
    body: [
      "I keep a running list of questions I cannot yet answer. As long as that list grows faster than I can shrink it, I never get bored.",
      "Expertise is dangerous precisely because it feels complete. The antidote is to deliberately wander into the edges of your field where you feel like a beginner again.",
      "Teaching helps too — students ask the naive questions that experts have trained themselves to stop asking.",
    ],
  },
]
