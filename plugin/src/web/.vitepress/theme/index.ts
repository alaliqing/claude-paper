import DefaultTheme from 'vitepress/theme'
import PaperList from './components/PaperList.vue'
import PaperView from './components/PaperView.vue'
import VSCodeButton from './components/VSCodeButton.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PaperList', PaperList)
    app.component('PaperView', PaperView)
    app.component('VSCodeButton', VSCodeButton)
  }
}
