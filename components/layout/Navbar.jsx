import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-xl font-bold text-green-600">FreeFinder</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Home
                </Link>
                <Link href="/listings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Listings
                </Link>
                {user ? (
                  <>
                    <Link href="/post" className="px-3 py-2 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Post Item
                    </Link>
                    <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      Login
                    </Link>
                    <Link href="/register" className="ml-4 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-200">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="ml-4 flex items-center">
                <img
                  src={user.avatar_url || '/default-avatar.png'}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full mr-2"
                />
                <div>
                  <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="mr-4 text-sm text-gray-600 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/register" className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
