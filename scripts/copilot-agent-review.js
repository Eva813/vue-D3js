#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { setTimeout, clearTimeout } from 'node:timers'
import path from 'node:path'
import process from 'node:process'

const COPILOT_BIN = process.env.COPILOT_BIN || 'copilot'
const model = process.env.COPILOT_MODEL || 'gpt-5.1-codex'
const agentPath = process.env.AGENT_PATH || '.github/agents/code-review.md'

// Diff size limits to avoid excessive token usage
const MAX_DIFF_BYTES = 500 * 1024 // 500KB
const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 2

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
    const diff = execSync(`git diff ${base} ${head}`, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
    const bytes = Buffer.byteLength(diff, 'utf8')

    if (bytes > MAX_DIFF_BYTES) {
      console.warn(`[copilot-agent] Diff is ${(bytes / 1024).toFixed(0)}KB, truncating to ${MAX_DIFF_BYTES / 1024}KB`)
      return diff.slice(0, MAX_DIFF_BYTES) + '\n... (truncated due to size)'
    }

    return diff
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

const runCopilot = (prompt, attempt = 1) => {
  return new Promise((resolve, reject) => {
    const args = ['--model', model, '--allow-all', '--silent']
    const child = spawn(COPILOT_BIN, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
    }, TIMEOUT_MS)

    child.stdout.on('data', (data) => { stdout += data.toString() })
    child.stderr.on('data', (data) => { stderr += data.toString() })

    child.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })

    child.on('close', (code) => {
      clearTimeout(timer)

      if (timedOut) {
        if (attempt < MAX_RETRIES) {
          console.warn(`[copilot-agent] Timeout on attempt ${attempt}, retrying...`)
          return resolve(runCopilot(prompt, attempt + 1))
        }
        return reject(new Error(`[copilot-agent] Copilot timed out after ${MAX_RETRIES} attempts`))
      }

      if (code !== 0) {
        if (attempt < MAX_RETRIES) {
          console.warn(`[copilot-agent] Exit code ${code} on attempt ${attempt}, retrying...`)
          return resolve(runCopilot(prompt, attempt + 1))
        }
        console.error(stderr)
        return reject(new Error(`[copilot-agent] Copilot exited with status ${code}`))
      }

      resolve(stdout.trim())
    })

    // Write prompt to stdin to avoid E2BIG error
    child.stdin.write(prompt)
    child.stdin.end()
  })
}

const saveEmptyReview = (note) => {
  const payload = {
    summary: note,
    findings: [],
  }
  writeFileSync('copilot-review.json', `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log('[copilot-agent] No findings; wrote placeholder review.')
}

const main = async () => {
  const { base, head } = resolveShas()
  const agentText = readAgent()
  const diff = collectDiff(base, head)

  if (!diff.trim()) {
    saveEmptyReview('No code changes detected in diff.')
    return
  }

  const prompt = buildPrompt({ agentText, diff, base, head })

  let output
  try {
    output = await runCopilot(prompt)
  } catch (err) {
    // Graceful degradation: if Copilot fails, write empty review instead of failing CI
    console.error(`[copilot-agent] Copilot unavailable: ${err.message}`)
    saveEmptyReview(`Copilot review skipped: ${err.message}`)
    return
  }

  if (!output) {
    saveEmptyReview('Copilot returned empty response.')
    return
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

main().catch((error) => {
  console.error('[copilot-agent] Fatal error:', error.message)
  process.exit(1)
})
