import Link from 'next/link';

export default function PostFAB() {
  return (
    <Link href="/post" className="fixed bottom-6 right-6 z-50">
      <button className="flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full shadow-lg flex-shrink-0 hover:bg-green-700 transition-colors transform hover:-translate-y-1 active:translate-y-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </Link>
  );
}
