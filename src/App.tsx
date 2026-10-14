import { MotionConfig } from 'motion/react'
import { Link } from './components/Link'
import { usePathname } from './router'
import Gallery from './pages/Gallery'

function NotFound() {
  return (
    <main className="page">
      <h1 className="type-heading">Not found</h1>
      <p className="type-body section__note">
        That page does not exist. <Link to="/">Back to the work</Link>.
      </p>
    </main>
  )
}

function App() {
  const pathname = usePathname()

  return (
    <MotionConfig reducedMotion="user">{pathname === '/' ? <Gallery /> : <NotFound />}</MotionConfig>
  )
}

export default App
