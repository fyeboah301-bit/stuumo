import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isNativeApp } from './lib/platform'

// Native WebView (WKWebView especially) pans horizontally no matter what
// overflow-x is set on #root. Tagging <html> lets index.css lock the WebView's
// own scroll view and make #root the only scroller. Web is left untouched.
if (isNativeApp()) document.documentElement.classList.add('native-app')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
