import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

export default {
  watch: [path.join(homedir(), 'claude-papers/index.json')],
  load() {
    const indexPath = path.join(homedir(), 'claude-papers/index.json')
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8')
      return JSON.parse(content)
    }
    return []
  }
}
