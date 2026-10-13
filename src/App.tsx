import { Link } from './components/Link'
import { usePathname } from './router'
import Gallery from './pages/Gallery'
import Typography from './pages/Typography'

const routes = [
  { to: '/', label: 'Interactions', element: <Gallery /> },
  { to: '/typography', label: 'Type & Color', element: <Typography /> },
]

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
  const match = routes.find((route) => route.to === pathname)

  return (
    <>
      <nav className="nav" aria-label="Sections">
        {routes.map((route) => (
          <Link
            key={route.to}
            to={route.to}
            className="nav__link"
            aria-current={route.to === pathname ? 'page' : undefined}
          >
            {route.label}
          </Link>
        ))}
      </nav>

      {match ? match.element : <NotFound />}
    </>
  )
}

export default App