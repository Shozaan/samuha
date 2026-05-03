import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@sujan77/ui-components'
import { router } from './routes'
import './App.css'

function App() {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  )
}

export default App
