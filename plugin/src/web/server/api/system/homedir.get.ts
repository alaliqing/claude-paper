import { homedir } from 'os'

export default defineEventHandler(() => {
  return {
    homedir: homedir()
  }
})
