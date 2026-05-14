import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-purple-50 to-rose-50 p-4 text-center text-gray-700">
      <h2 className="text-8xl font-bold text-rose-400">404</h2>
      <h3 className="mt-4 text-2xl font-semibold">Page Not Found</h3>
      <p className="mt-2 text-gray-600">
        The cosmic configuration you are looking for does not exist in this database.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 px-6 py-3 font-medium text-white transition hover:from-purple-500 hover:to-blue-500 shadow-md"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}