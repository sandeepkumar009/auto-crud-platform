import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='bg-green-500 text-red-500 text-center'>
        Vite + React
      </div>
    </>
  )
}

export default App
