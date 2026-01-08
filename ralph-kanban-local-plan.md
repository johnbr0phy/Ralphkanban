# Ralph Kanban Visualizer (Local) - Project Plan

## Overview

A local Kanban dashboard that visualizes Ralph loop progress. You upload a PRD, it converts to stories, then **Claude Code** executes each story while the dashboard shows real-time progress via file watching.

**Key insight**: No backend needed. Claude Code IS the execution engine. The dashboard just watches files that Claude Code updates.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Local React Dashboard                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ PRD Upload  │  │   Kanban    │  │     Execution Log       │ │
│  │   + Parse   │  │    Board    │  │    (file watcher)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Watches files
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Local File System                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ prd.json    │  │ progress.txt│  │     learnings.md        │ │
│  │ (stories)   │  │  (log)      │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└───────────────────────────▲─────────────────────────────────────┘
                            │ Reads/Writes
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                       Claude Code                                │
│         Runs Ralph loop, updates files, commits code             │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

1. **You start the dashboard** - `npm run dev` serves local React app
2. **Upload PRD** - Paste or upload your brief
3. **Convert to stories** - Dashboard calls Claude API to convert PRD → prd.json
4. **prd.json saved locally** - In your project's `.ralph/` directory
5. **You trigger Claude Code** - Run the Ralph prompt in Claude Code
6. **Claude Code executes** - Picks stories, implements, updates prd.json + progress.txt
7. **Dashboard watches files** - Shows real-time Kanban updates as files change

---

## File Structure (What Gets Watched)

```
your-project/
├── .ralph/
│   ├── prd.json           # Stories with status (dashboard + Claude Code read/write)
│   ├── progress.txt       # Execution log (Claude Code writes, dashboard reads)
│   ├── learnings.md       # Accumulated learnings (Claude Code writes)
│   └── session.json       # Session metadata (iteration count, timestamps)
├── CLAUDE.md              # Project context for Claude Code
└── ... your code ...
```

### prd.json Schema
```json
{
  "title": "Feature Name",
  "createdAt": "2025-01-08T...",
  "stories": [
    {
      "id": "story-1",
      "title": "Add priority field to database",
      "description": "As a user...",
      "acceptanceCriteria": [
        "Priority column exists with default 'medium'",
        "API accepts priority parameter"
      ],
      "status": "backlog" | "in_progress" | "testing" | "done" | "failed",
      "passes": false,
      "iteration": null,
      "startedAt": null,
      "completedAt": null,
      "filesChanged": [],
      "notes": ""
    }
  ]
}
```

### progress.txt Format
```
=== ITERATION 1 ===
Timestamp: 2025-01-08T10:30:00Z
Story: story-1 - Add priority field to database
Status: STARTED

[10:30:15] Analyzing acceptance criteria...
[10:31:02] Creating migration file: db/migrations/001_add_priority.sql
[10:31:45] Updating model: src/models/task.ts
[10:32:30] Running tests...
[10:33:00] All acceptance criteria passed

Status: COMPLETED
Files Changed:
  - db/migrations/001_add_priority.sql (created)
  - src/models/task.ts (modified)

Learnings:
  - Database uses Drizzle ORM, migrations in db/migrations/

---
```

### session.json Schema
```json
{
  "id": "uuid",
  "status": "idle" | "running" | "paused" | "completed",
  "currentIteration": 3,
  "maxIterations": 10,
  "startedAt": "2025-01-08T...",
  "lastUpdated": "2025-01-08T..."
}
```

---

## Dashboard Features

### 1. PRD Input Panel
- Text area for pasting brief
- File upload (.md, .txt)
- "Convert to Stories" button
- Uses Claude API directly from browser (API key stored in localStorage)

### 2. Kanban Board
- 4 columns: Backlog | In Progress | Testing | Done
- Cards show: title, acceptance criteria preview, iteration #, files changed
- Real-time updates via file watcher
- Click card to expand full details

### 3. Execution Log
- Streams progress.txt content
- Auto-scrolls to latest
- Syntax highlighting for file paths
- Collapsible iteration blocks

### 4. Controls
- "Copy Ralph Prompt" button - copies the prompt to run in Claude Code
- Iteration counter display
- "Reset Session" button
- Settings: API key, max iterations, project path

### 5. Learnings Panel
- Displays learnings.md content
- Shows accumulated patterns/gotchas

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React + TypeScript + Vite |
| Styling | Tailwind + shadcn/ui |
| State | Zustand |
| File Watching | chokidar (via simple Express server) OR polling |
| PRD Conversion | Claude API (browser fetch) |
| Drag-drop | @dnd-kit/core |
| Storage | localStorage + local .ralph/ files |

**Note**: For file watching, two options:
1. **Polling** (simpler) - Dashboard polls files every 1-2 seconds
2. **Tiny local server** - Node script watches files, pushes via WebSocket

I recommend **polling** for simplicity since file changes aren't that frequent.

---

## Claude Code Integration

### The Ralph Prompt (what you run in Claude Code)

```markdown
# Ralph Autonomous Loop

You are running a Ralph loop. Read the PRD and execute stories autonomously.

## Setup
1. Read `.ralph/prd.json` for the story list
2. Read `.ralph/progress.txt` for previous context
3. Read `.ralph/learnings.md` for accumulated knowledge
4. Read `CLAUDE.md` for project context

## Loop (repeat until all stories pass or max iterations reached)

For each iteration:

1. **Pick a story**: Find first story with `"passes": false` and `"status": "backlog"`
2. **Update status**: Set story status to `"in_progress"`, update `.ralph/prd.json`
3. **Log start**: Append to `.ralph/progress.txt`:
   ```
   === ITERATION {n} ===
   Timestamp: {ISO date}
   Story: {id} - {title}
   Status: STARTED
   ```
4. **Implement**: Complete the story, satisfying all acceptance criteria
5. **Test**: Verify each acceptance criterion
6. **Log progress**: Append file changes and test results to progress.txt
7. **Update story**: In prd.json, set:
   - `status`: "done" if all criteria pass, "failed" if not
   - `passes`: true/false
   - `iteration`: current iteration number
   - `completedAt`: ISO timestamp
   - `filesChanged`: array of modified files
8. **Commit**: `git commit -m "Ralph: {story title}"`
9. **Log learnings**: If you learned something important, append to `.ralph/learnings.md`
10. **Update session**: Increment iteration in `.ralph/session.json`

## Rules
- One story per iteration
- Each story must be small enough to complete in one context window
- Always update files BEFORE moving to next story
- If a story fails twice, mark as "failed" and move on
- Stop at max iterations (check session.json)

## Output Format for prd.json updates
When updating a story, preserve all other fields and only modify:
```json
{
  "status": "done",
  "passes": true,
  "iteration": 1,
  "completedAt": "2025-01-08T...",
  "filesChanged": ["path/to/file.ts"],
  "notes": "Optional notes about implementation"
}
```

Begin by reading the files and starting iteration 1.
```

---

## Work Chunks

### Phase 1: Project Setup (Session 1)

#### Chunk 1.1: Initialize Project
```
- Create Vite + React + TypeScript project
- Install: tailwindcss, @shadcn/ui, zustand, @dnd-kit/core, date-fns
- Set up Tailwind config
- Add shadcn components: Card, Button, Badge, ScrollArea, Textarea, Dialog, Input
- Create folder structure
```

**Acceptance Criteria:**
- `npm run dev` starts the app
- Tailwind classes work
- shadcn Button renders correctly
- No TypeScript errors

#### Chunk 1.2: Type Definitions
```
Create /src/types/index.ts with:
- Story interface
- PRD interface  
- Session interface
- ProgressEntry interface
```

**Acceptance Criteria:**
- All interfaces exported
- No `any` types
- Status uses union type literals

#### Chunk 1.3: Zustand Stores
```
Create stores:
- /src/stores/prdStore.ts - stories state + actions
- /src/stores/sessionStore.ts - session state
- /src/stores/settingsStore.ts - API key, project path, max iterations
```

**Acceptance Criteria:**
- Stores initialize with default state
- Actions update state correctly
- Settings persist to localStorage

---

### Phase 2: PRD Input Flow (Session 2)

#### Chunk 2.1: Layout Shell
```
- Create Header component with title + settings button
- Create 3-panel layout: PRD input | Kanban | Log
- Make panels resizable or use fixed proportions
```

**Acceptance Criteria:**
- Layout renders with 3 distinct panels
- Responsive down to 1200px width
- Header shows app title

#### Chunk 2.2: PRD Upload Component
```
- Textarea for pasting PRD
- File drop zone for .md/.txt
- "Convert to Stories" button
- Loading state during conversion
- Error handling
```

**Acceptance Criteria:**
- Can paste text into textarea
- Can drag-drop .md file
- Button disabled when empty
- Shows spinner during API call

#### Chunk 2.3: Claude API Integration
```
- Create /src/lib/claude.ts
- convertPrdToStories(prdText, apiKey) function
- System prompt for conversion
- Parse JSON response
- Handle errors gracefully
```

**Acceptance Criteria:**
- Returns properly structured stories array
- Handles malformed JSON response
- Throws descriptive errors
- Works with Opus 4.5

#### Chunk 2.4: Story Review Modal
```
- Show converted stories in editable list
- Edit title, description, criteria
- Reorder stories (drag-drop)
- Add/remove stories
- "Save & Initialize" button
```

**Acceptance Criteria:**
- All story fields editable
- Can reorder via drag
- Can delete story
- Can add new story
- Save writes to store

---

### Phase 3: Kanban Board (Session 3)

#### Chunk 3.1: Kanban Layout
```
- 4-column grid: Backlog | In Progress | Testing | Done
- Column headers with count badges
- Scrollable columns
- Empty state per column
```

**Acceptance Criteria:**
- 4 columns render
- Headers show story counts
- Columns scroll independently
- Shows "No stories" when empty

#### Chunk 3.2: Story Cards
```
- Card shows: title, status badge, iteration #
- Expand on click to show full details
- Color coding by status
- Files changed list (when done)
```

**Acceptance Criteria:**
- Cards render in correct columns
- Click expands card
- Badge colors match status
- Files list shows when available

#### Chunk 3.3: Real-time File Polling
```
- Create useFileWatcher hook
- Poll .ralph/prd.json every 2 seconds
- Update store when file changes
- Detect file existence
```

**Acceptance Criteria:**
- Hook polls at interval
- Store updates on file change
- Handles missing file gracefully
- Cleans up interval on unmount

#### Chunk 3.4: Card Animations
```
- Animate cards moving between columns
- Highlight card when status changes
- Pulse animation for "in_progress"
```

**Acceptance Criteria:**
- Smooth transition between columns
- Brief highlight on status change
- Pulsing border for active story

---

### Phase 4: Execution Log (Session 4)

#### Chunk 4.1: Log Panel Layout
```
- ScrollArea for log content
- Auto-scroll toggle
- Clear visual separation between iterations
```

**Acceptance Criteria:**
- Log scrolls
- Auto-scroll works
- Iterations visually distinct

#### Chunk 4.2: Progress File Parsing
```
- Create parseProgressFile(content) function
- Extract iterations with timestamps
- Extract file changes
- Extract learnings
```

**Acceptance Criteria:**
- Parses sample progress.txt correctly
- Returns structured iteration objects
- Handles empty file

#### Chunk 4.3: Log Display Components
```
- IterationBlock component
- LogLine component with timestamp
- FileChange component
- Syntax highlighting for paths
```

**Acceptance Criteria:**
- Iterations collapsible
- Timestamps formatted nicely
- File paths highlighted
- Learnings styled differently

#### Chunk 4.4: Log Polling
```
- Poll .ralph/progress.txt every 2 seconds
- Append new content only (track last position)
- Scroll to new content
```

**Acceptance Criteria:**
- New log content appears
- Doesn't re-render entire log
- Auto-scrolls to new content

---

### Phase 5: Controls & Settings (Session 5)

#### Chunk 5.1: Control Bar
```
- "Copy Ralph Prompt" button
- Iteration display: "Iteration 3 / 10"
- Status indicator: idle/running/completed
- Reset button
```

**Acceptance Criteria:**
- Prompt copies to clipboard
- Counter reads from session.json
- Status reflects session state
- Reset clears .ralph/ files

#### Chunk 5.2: Settings Dialog
```
- API key input (password field)
- Project path input
- Max iterations slider
- Save to localStorage
```

**Acceptance Criteria:**
- Settings persist across reload
- API key masked
- Path validates existence
- Max iterations 1-50 range

#### Chunk 5.3: Initialize .ralph Directory
```
- "Initialize Project" button
- Creates .ralph/ folder
- Creates empty prd.json, progress.txt, session.json
- Writes converted stories to prd.json
```

**Acceptance Criteria:**
- Creates directory if missing
- Creates all required files
- Writes stories correctly
- Shows success/error toast

#### Chunk 5.4: Copy Prompt Feature
```
- Generate Ralph prompt with current settings
- Include project path
- Copy to clipboard
- Show "Copied!" feedback
```

**Acceptance Criteria:**
- Prompt includes correct paths
- Copies to clipboard
- Toast confirms copy

---

### Phase 6: Learnings Panel (Session 6)

#### Chunk 6.1: Learnings Display
```
- Read .ralph/learnings.md
- Render as formatted markdown
- Auto-refresh on file change
```

**Acceptance Criteria:**
- Markdown renders correctly
- Updates when file changes
- Shows empty state

#### Chunk 6.2: Export Features
```
- "Export Session" button
- ZIP containing: prd.json, progress.txt, learnings.md
- "Export as CLAUDE.md" - formats learnings for project context
```

**Acceptance Criteria:**
- ZIP downloads correctly
- Contains all files
- CLAUDE.md formatted properly

---

### Phase 7: Polish (Session 7)

#### Chunk 7.1: Error Handling
```
- Toast notifications for errors
- Error boundary for crashes
- Graceful handling of missing files
```

#### Chunk 7.2: Loading States
```
- Skeleton loaders for panels
- Spinner for API calls
- Disabled states during operations
```

#### Chunk 7.3: Visual Polish
```
- Consistent spacing
- Hover states
- Focus states
- Transitions
```

#### Chunk 7.4: Help Content
```
- "How to use" modal
- Sample PRD template
- Tips for writing acceptance criteria
```

---

## CLAUDE.md for This Project

```markdown
# Ralph Kanban Visualizer

## What This Is
Local dashboard for visualizing Ralph autonomous coding loops. Watches .ralph/ files that Claude Code updates.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Zustand for state
- File polling for real-time updates

## Key Files
- `/src/stores/` - Zustand stores (prdStore, sessionStore, settingsStore)
- `/src/lib/claude.ts` - Claude API calls for PRD conversion
- `/src/lib/fileParser.ts` - Parse progress.txt and prd.json
- `/src/hooks/useFileWatcher.ts` - Polling hook for file changes
- `/src/components/kanban/` - Kanban board components
- `/src/components/log/` - Execution log components

## Patterns
- All file reads go through fileParser.ts
- State updates only through store actions
- Components are presentational, logic in hooks/stores
- Use shadcn/ui components, don't reinvent

## File Formats
- `.ralph/prd.json` - Stories with status, updated by Claude Code
- `.ralph/progress.txt` - Execution log, appended by Claude Code
- `.ralph/learnings.md` - Accumulated learnings
- `.ralph/session.json` - Iteration count, session status

## Gotchas
- Poll interval is 2 seconds, don't go lower
- prd.json may have partial writes, handle JSON parse errors
- File paths in progress.txt are relative to project root
```

---

## PRD Conversion Prompt

```markdown
You convert product requirement documents into structured user stories for the Ralph autonomous agent system.

## Input
A product requirements document, feature brief, or description of what to build.

## Output
Return ONLY valid JSON (no markdown, no explanation):

{
  "title": "Feature name",
  "stories": [
    {
      "id": "story-1",
      "title": "Short action-oriented title",
      "description": "As a [user], I want [goal] so that [benefit]",
      "acceptanceCriteria": [
        "Specific, testable criterion that an AI can verify",
        "Another criterion"
      ],
      "status": "backlog",
      "passes": false,
      "iteration": null,
      "startedAt": null,
      "completedAt": null,
      "filesChanged": [],
      "notes": ""
    }
  ]
}

## Rules
1. **Small stories**: Each story completable in ONE Claude Code iteration (15-30 min of work)
2. **Ordered by dependency**: Foundation/setup stories first
3. **Testable criteria**: An AI must be able to verify each criterion without human input
4. **3-8 stories typical**: Break large features into atomic pieces
5. **No vague criteria**: Bad: "Works well". Good: "Returns 200 status with user object"

## Examples of Good Acceptance Criteria
- "Database table 'tasks' has 'priority' column with default 'medium'"
- "GET /api/tasks returns array with priority field"
- "Dropdown shows options: Low, Medium, High"
- "Selecting priority updates task via PATCH request"
- "Priority persists after page reload"

## Examples of Bad Acceptance Criteria
- "Priority feature works" (not specific)
- "User can set priority" (how to verify?)
- "Looks good" (subjective)
```

---

## MVP Scope

**Keep:**
- PRD upload + conversion
- Kanban with 4 columns
- File polling for updates
- Basic execution log
- Copy Ralph prompt
- Settings (API key, path)

**Cut for MVP:**
- Drag-drop story reordering
- Story editing after conversion
- Learnings panel
- Export features
- Card animations
- Help modal
