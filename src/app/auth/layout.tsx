import { Store } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-600 via-purple-700 to-violet-800">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-300 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex justify-center pt-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-xl font-bold text-white">TiendApp</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
