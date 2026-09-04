import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initStatusBar } from './lib/statusBar'
import './index.css'

initStatusBar()

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'24px', textAlign:'center' }}>
          <div style={{ width:56, height:56, background:'#22c55e', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <span style={{ color:'white', fontWeight:900, fontSize:20 }}>CY</span>
          </div>
          <h2 style={{ fontWeight:700, color:'#0f172a', marginBottom:8 }}>Oops, something went wrong</h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24, maxWidth:280, lineHeight:1.5 }}>
            Don't worry — your data is safe. Please reload the app.
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            style={{ background:'#22c55e', color:'white', border:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, fontSize:15, cursor:'pointer' }}
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
