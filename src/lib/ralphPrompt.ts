export function getRalphPrompt(_projectPath: string, maxIterations: number): string {
  return `# Ralph Autonomous Loop

You are running a Ralph loop. Read the PRD and execute stories autonomously.

## Setup
1. Read \`.ralph/prd.json\` for the story list
2. Read \`.ralph/progress.txt\` for previous context
3. Read \`.ralph/learnings.md\` for accumulated knowledge
4. Read \`CLAUDE.md\` for project context

## Loop (repeat until all stories pass or max iterations reached)

For each iteration:

1. **Pick a story**: Find first story with \`"passes": false\` and \`"status": "backlog"\`
2. **Update status**: Set story status to \`"in_progress"\`, update \`.ralph/prd.json\`
3. **Log start**: Append to \`.ralph/progress.txt\`:
   \`\`\`
   === ITERATION {n} ===
   Timestamp: {ISO date}
   Story: {id} - {title}
   Status: STARTED
   \`\`\`
4. **Implement**: Complete the story, satisfying all acceptance criteria
5. **Test**: Verify each acceptance criterion
6. **Log progress**: Append file changes and test results to progress.txt
7. **Update story**: In prd.json, set:
   - \`status\`: "done" if all criteria pass, "failed" if not
   - \`passes\`: true/false
   - \`iteration\`: current iteration number
   - \`completedAt\`: ISO timestamp
   - \`filesChanged\`: array of modified files
8. **Commit**: \`git commit -m "Ralph: {story title}"\`
9. **Log learnings**: If you learned something important, append to \`.ralph/learnings.md\`
10. **Update session**: Increment iteration in \`.ralph/session.json\`

## Rules
- One story per iteration
- Each story must be small enough to complete in one context window
- Always update files BEFORE moving to next story
- If a story fails twice, mark as "failed" and move on
- Stop at max iterations: ${maxIterations}

## Output Format for prd.json updates
When updating a story, preserve all other fields and only modify:
\`\`\`json
{
  "status": "done",
  "passes": true,
  "iteration": 1,
  "completedAt": "2025-01-08T...",
  "filesChanged": ["path/to/file.ts"],
  "notes": "Optional notes about implementation"
}
\`\`\`

Begin by reading the files and starting iteration 1.`
}
