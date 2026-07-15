// Layout principal con sidebar y header
import Sidebar from './sidebar'
import Header from './header'

export default function MainLayout({ children, title }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
