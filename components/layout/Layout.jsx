import Header from './Header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}
