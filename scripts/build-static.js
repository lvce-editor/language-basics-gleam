import { cp } from 'node:fs/promises'
import { exportStatic } from '@lvce-editor/shared-process'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const { commitHash } = await exportStatic({
  root,
})

await cp(
  path.join(root, 'languageConfiguration.json'),
  path.join(
    root,
    'dist',
    commitHash,
    'extensions',
    'builtin.language-basics-gleam',
    'languageConfiguration.json',
  ),
)
