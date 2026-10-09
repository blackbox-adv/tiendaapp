#!/usr/bin/env node
// deploy-wait.mjs <sha> — espera a que Vercel reporte el deploy del commit via GitHub commit statuses.
// Token: se extrae del remote origin (https://<token>@github.com/...) o de GH_TOKEN. Nunca se imprime.
import { execSync } from 'node:child_process'

const sha = process.argv[2]
if (!sha) { console.error('uso: node deploy-wait.mjs <sha>'); process.exit(2) }

let token = process.env.GH_TOKEN || ''
if (!token) {
  const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim()
  const m = url.match(/^https:\/\/([^@]+)@github\.com\//)
  if (m) token = m[1]
}
if (!token) { console.error('sin token GitHub'); process.exit(2) }

const repo = 'blackbox-adv/tiendaapp'
const base = `https://api.github.com/repos/${repo}`
const H = { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'deploy-wait' }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const deadline = Date.now() + 15 * 60 * 1000

while (Date.now() < deadline) {
  const res = await fetch(`${base}/commits/${sha}/status`, { headers: H })
  if (!res.ok) { console.error(`status HTTP ${res.status}`); process.exit(2) }
  const data = await res.json()
  const state = data.state // pending | success | failure | error
  const statuses = (data.statuses || []).map((s) => `${s.context}:${s.state}`).join(', ')
  console.log(`[${new Date().toLocaleTimeString()}] ${state} ${statuses || '(sin statuses todavia)'}`)
  if (state === 'success') { console.log('DEPLOY_OK'); process.exit(0) }
  if (state === 'failure' || state === 'error') { console.log('DEPLOY_FAIL'); process.exit(1) }
  await sleep(20000)
}
console.log('TIMEOUT'); process.exit(2)
