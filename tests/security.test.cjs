const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')

test('private documents and taxonomy metadata stay out of public output in both languages', () => {
  const cache = path.join(root, '.hugo_cache')
  fs.mkdirSync(cache, { recursive: true })
  const fixture = fs.mkdtempSync(path.join(cache, 'security-test-'))
  try {
    for (const source of ['hugo.toml', 'layouts', 'content', 'assets', 'data', 'i18n']) {
      fs.cpSync(path.join(root, source), path.join(fixture, source), { recursive: true })
    }
    fs.cpSync(path.join(root, 'node_modules'), path.join(fixture, 'node_modules'), { recursive: true })
    // Privacy tests must not depend on the availability/expiry of real music shares.
    fs.writeFileSync(path.join(fixture, 'layouts', 'shortcodes', 'navidrome.html'), '<p>Music embed fixture</p>')
    // Privacy tests must not depend on the availability/expiry of real music shares.
    fs.writeFileSync(path.join(fixture, 'layouts', 'shortcodes', 'navidrome.html'), '<p>Music embed fixture</p>')

    for (const language of ['italian', 'english']) {
      const privateDir = path.join(fixture, 'content', language, 'private')
      fs.mkdirSync(privateDir, { recursive: true })
      if (!fs.existsSync(path.join(privateDir, '_index.md'))) {
        fs.writeFileSync(path.join(privateDir, '_index.md'), '---\ntitle: Private\n---\n')
      }
      fs.writeFileSync(path.join(privateDir, 'security-probe.md'), `---
title: PRIVATE_TITLE_${language}
translationKey: security-private-${language}
date: 2026-01-01
summary: PRIVATE_SUMMARY_${language}
tags: [private-tag-${language}, private-shared-tag, shared-security-tag]
categories: [private-category-${language}]
---
PRIVATE_BODY_${language}
`)
      fs.writeFileSync(path.join(fixture, 'content', language, 'posts', 'security-probe.md'), `---
title: PUBLIC_TITLE_${language}
translationKey: security-private-${language === 'italian' ? 'english' : 'italian'}
date: 2026-01-01
tags: [shared-security-tag]
---
Public content.
`)
    }

    const output = path.join(fixture, 'output')
    const build = spawnSync('hugo', ['build', '--minify', '--destination', output,
      '--cacheDir', path.join(cache, 'security-test-hugo')], { cwd: fixture, encoding: 'utf8' })
    assert.ifError(build.error)
    assert.equal(build.status, 0, build.stdout + build.stderr)

    const files = fs.readdirSync(output, { recursive: true })
      .filter(file => /\.(html|xml|json)$/.test(file))
    for (const file of files) {
      const url = file.split(path.sep).join('/')
      if (/^(?:en\/)?private\//.test(url)) continue
      const content = fs.readFileSync(path.join(output, file), 'utf8')
      assert.ok(!/PRIVATE_(?:TITLE|SUMMARY|BODY)_|private-(?:tag|category)-(?:italian|english)|private-shared-tag|\/private\/security-probe\//.test(content),
        `Private metadata leaked into ${url}`)
    }

    for (const [language, prefix] of [['italian', ''], ['english', 'en/']]) {
      const privatePage = fs.readFileSync(path.join(output, prefix, 'private/security-probe/index.html'), 'utf8')
      assert.match(privatePage, new RegExp(`PRIVATE_BODY_${language}`))
      assert.match(fs.readFileSync(path.join(output, prefix, 'private/index.html'), 'utf8'),
        new RegExp(`PRIVATE_TITLE_${language}`), 'Private navigation must still list documents')
      assert.match(fs.readFileSync(path.join(output, prefix, 'tags/shared-security-tag/index.html'), 'utf8'),
        new RegExp(`PUBLIC_TITLE_${language}`), 'Public tags must still work')
      assert.ok(!fs.existsSync(path.join(output, prefix, 'private/index.xml')))
    }
  } finally {
    // Only remove the unique temporary fixture created above, inside the repo cache.
    assert.equal(path.dirname(path.resolve(fixture)), path.resolve(cache))
    assert.ok(path.basename(fixture).startsWith('security-test-'))
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})
