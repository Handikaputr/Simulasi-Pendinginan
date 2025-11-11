import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Kalkulator Rumus
          </h1>
          <p className="text-gray-600 text-lg">
            Pilih kalkulator yang ingin Anda gunakan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/suhuCPU"
            className="group relative px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-64"
          >
            <div className="flex flex-col items-center space-y-2">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
                />
              </svg>
              <span>Suhu CPU</span>
            </div>
          </Link>

          <Link 
            href="/perpindahanSuhu"
            className="group relative px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-64"
          >
            <div className="flex flex-col items-center space-y-2">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              <span>Perpindahan Suhu</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}