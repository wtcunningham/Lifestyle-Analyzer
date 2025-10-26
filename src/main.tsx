import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App(){
  return (<div style={{padding:20}}>
    <h1>Lifestyle Analyzer</h1>
    <p>Build is connected. Replace this stub with the full component.</p>
  </div>)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
