import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store/index.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  </StrictMode>,
)
