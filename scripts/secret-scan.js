#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import process from 'node:process'

/**
 * Secret scanner based on .github/copilot-audit.json configuration
 * Scans git diff for blocked patterns (API keys, tokens, credentials)
 */

const AUDIT_CONFIG_PATH = '.github/copilot-audit.json'
const OUTPUT_PATH = '.github/secret-scan-report.json'

// Default patterns if config not found
const DEFAULT_PATTERNS = [
  { name: 'RSA Private Key', pattern: 'BEGIN RSA PRIVATE KEY' },
  { name: 'AWS Access Key', pattern: 'AKIA[0-9A-Z]{16}' },
  { name: 'Slack Token', pattern: 'xox[baprs]-[0-9a-zA-Z]{10,48}' },
  { name: 'GitHub PAT', pattern: 'ghp_[0-9A-Za-z]{36}' },
  // Note: gho_, ghu_, ghr_ patterns removed as they match placeholder examples too often
]

const loadConfig = () => {
  if (!existsSync(AUDIT_CONFIG_PATH)) {
    console.warn(`[secret-scan] Config not found at ${AUDIT_CONFIG_PATH}, using defaults`)
    return { blockedPatterns: DEFAULT_PATTERNS.map((p) => p.pattern) }
  }

  try {
    const raw = readFileSync(AUDIT_CONFIG_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[secret-scan] Failed to parse config: ${err.message}`)
    return { blockedPatterns: DEFAULT_PATTERNS.map((p) => p.pattern) }
  }
}

const resolveShas = () => {
  if (process.env.REVIEW_BASE_SHA && process.env.REVIEW_HEAD_SHA) {
    return { base: process.env.REVIEW_BASE_SHA, head: process.env.REVIEW_HEAD_SHA }
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
    } catch {
      // fall through
    }
  }

  if (!currentSha) {
    // Local dev: scan staged changes
    return { base: 'HEAD', head: null }
  }

  return { base: `${currentSha}~1`, head: currentSha }
}

const getDiff = (base, head) => {
  try {
    const cmd = head ? `git diff ${base} ${head}` : `git diff --cached`
    return execSync(cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  } catch {
    return ''
  }
}

const scanForSecrets = (diff, patterns) => {
  const findings = []
  const lines = diff.split('\n')

  let currentFile = null
  let lineNum = 0

  for (const line of lines) {
    // Track file changes
    const fileMatch = line.match(/^\+\+\+ b\/(.+)$/)
    if (fileMatch) {
      currentFile = fileMatch[1]
      lineNum = 0
      continue
    }

    // Track line numbers from hunk headers
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
    if (hunkMatch) {
      lineNum = parseInt(hunkMatch[1], 10) - 1
      continue
    }

    // Only scan added lines
    if (!line.startsWith('+') || line.startsWith('+++')) continue
    lineNum++

    const content = line.slice(1) // Remove leading +

    for (const rawPattern of patterns) {
      const patternStr = typeof rawPattern === 'string' ? rawPattern : rawPattern.pattern
      const patternName = typeof rawPattern === 'object' ? rawPattern.name : patternStr.slice(0, 30)

      try {
        const regex = new RegExp(patternStr, 'g')
        const matches = content.match(regex)

        if (matches) {
          findings.push({
            severity: 'critical',
            type: 'secret',
            pattern: patternName,
            file: currentFile || 'unknown',
            line: lineNum,
            match: matches[0].slice(0, 20) + '***', // Redact
            description: `Potential secret detected matching pattern: ${patternName}`,
          })
        }
      } catch {
        // Invalid regex, skip
      }
    }
  }

  return findings
}

const main = () => {
  const config = loadConfig()
  const patterns = config.secrets?.blockedPatterns || config.blockedPatterns || DEFAULT_PATTERNS.map((p) => p.pattern)

  const { base, head } = resolveShas()
  const diff = getDiff(base, head)

  if (!diff.trim()) {
    console.log('[secret-scan] No changes to scan')
    writeFileSync(OUTPUT_PATH, JSON.stringify({ findings: [], scannedAt: new Date().toISOString() }, null, 2))
    process.exit(0)
  }

  const findings = scanForSecrets(diff, patterns)

  const report = {
    scannedAt: new Date().toISOString(),
    base,
    head: head || 'staged',
    patternsChecked: patterns.length,
    findings,
    criticalCount: findings.filter((f) => f.severity === 'critical').length,
  }

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  if (findings.length > 0) {
    console.error(`🔴 [secret-scan] Found ${findings.length} potential secrets:`)
    for (const f of findings) {
      console.error(`  - ${f.file}:${f.line} — ${f.pattern} (${f.match})`)
    }
    // Exit with error to block PR if secrets found
    process.exit(1)
  }

  console.log(`✅ [secret-scan] No secrets detected (checked ${patterns.length} patterns)`)
}

main()
