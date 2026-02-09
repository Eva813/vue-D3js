#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const COPILOT_BIN = process.env.COPILOT_BIN || 'copilot'
const model = process.env.COPILOT_MODEL || 'gpt-5.1-codex'
const agentPath = process.env.AGENT_PATH || '.github/agents/code-review.md'

const resolveShas = () => {
  if (process.env.REVIEW_BASE_SHA && process.env.REVIEW_HEAD_SHA) {
    return {
      base: process.env.REVIEW_BASE_SHA,
      head: process.env.REVIEW_HEAD_SHA,
    }
  }

  const eventName = process.env.GITHUB_EVENT_NAME
  const eventPath = process.env.GITHUB_EVENT_PATH
  const currentSha = process.env.GITHUB_SHA

  if (eventName === 'pull_request' && eventPath) {
    try {
      const payload = JSON.parse(readFileSync(eventPath, 'utf8'))
      const base = payload?.pull_request?.base?.sha
      const head = payload?.pull_request?.head?.sha
      if (base && head) return { base, head }
    } catch (error) {
      console.warn('[copilot-agent] Failed to parse event payload for PR SHAs:', error)
    }
  }

  if (!currentSha) {
    throw new Error('[copilot-agent] Unable to determine HEAD sha (GITHUB_SHA missing).')
  }

  return { base: `${currentSha}~1`, head: currentSha }
}

const readAgent = () => {
  const absolute = path.resolve(agentPath)
  return readFileSync(absolute, 'utf8')
}

const collectDiff = (base, head) => {
  try {
    return execSync(`git diff ${base} ${head}`, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  } catch (error) {
    throw new Error(`[copilot-agent] git diff failed for ${base}..${head}: ${error.message}`)
  }
}

const buildPrompt = ({ agentText, diff, base, head }) => {
  return [
    'You are an automated Vue + D3 CI reviewer. Follow the agent charter below verbatim.',
    '--- Agent Charter Start ---',
    agentText.trim(),
    '--- Agent Charter End ---',
    'Review the provided git diff and respond ONLY with minified JSON matching:',
    '{"summary":string,"findings":[{"title":string,"severity":"critical"|"high"|"medium"|"low"|"info","file":string,"line":number,"description":string,"recommendation":string,"references":string[]}]}',
    'Severity should reflect exploitability and user impact.',
    `Diff range ${base}..${head}:`,
    '```diff',
    diff || '(no changes)',
    '```',
  ].join('\n')
}

const saveEmptyReview = (note) => {
  const payload = {
    summary: note,
    findings: [],
  }
  writeFileSync('copilot-review.json', `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log('[copilot-agent] No findings; wrote placeholder review.')
}

const main = () => {
  const { base, head } = resolveShas()
  const agentText = readAgent()
  const diff = collectDiff(base, head)

  if (!diff.trim()) {
    saveEmptyReview('No code changes detected in diff.')
    return
  }

  const prompt = buildPrompt({ agentText, diff, base, head })
  const result = spawnSync(COPILOT_BIN, ['prompt', '--model', model], {
    input: prompt,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    console.error(result.stderr)
    throw new Error(`[copilot-agent] copilot prompt exited with status ${result.status}.`)
  }

  const output = result.stdout.trim()
  if (!output) {
    throw new Error('[copilot-agent] Copilot returned empty response.')
  }

  try {
    const parsed = JSON.parse(output)
    writeFileSync('copilot-review.json', `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
    console.log(`[copilot-agent] Review complete with ${parsed.findings?.length || 0} findings.`)
  } catch (error) {
    console.error('[copilot-agent] Copilot output is not valid JSON:', output)
    throw error
  }
}

try {
  main()
} catch (error) {
  console.error('[copilot-agent] Fatal error:', error.message)
  process.exit(1)
}
