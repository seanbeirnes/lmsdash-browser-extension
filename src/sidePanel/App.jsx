import { useState, useEffect } from 'react'
import { Message } from '../models/Message.js'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)
  const [message, setMessage] = useState("")

  // useEffect( () => {
  //   function handleMessage(message, sender, sendResponse)
  //   {
  //       console.log(message);
  //       setMessage(message);
  //       chrome.runtime.onMessage.removeListener(handleMessage)
  //   }

  //   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => handleMessage(message, sender, sendResponse))
  // }, [])



  return (
    <>
      <div>
          <img src="/img/icon-color.svg" alt="LMS Dash" />
      </div>
      <h1>LMS Dash</h1>
      <div className="card">
        <button onClick={() => 
          {
            chrome.runtime.sendMessage(
              new Message(Message.Target.SERVICE_WORKER, Message.Type.REQUEST.NEW, "Hello world!")
          )
          }
        }>
          Click me!
        </button>
        <p>{message}</p>
      </div>
    </>
  )
}

export default App
