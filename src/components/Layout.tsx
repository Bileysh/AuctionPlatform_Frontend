import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (

    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight hover:text-blue-700 transition">
            AuctionPlatform
          </Link>       
          <nav className="flex gap-8">
            <Link to="/" className="font-medium text-gray-600 hover:text-blue-600 transition">
              Головна
            </Link>
            <Link to="/auctions" className="font-medium text-gray-600 hover:text-blue-600 transition">
              Всі аукціони
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet /> 
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AuctionPlatform. Всі права захищені.
        </div>
      </footer>

    </div>
  );
}