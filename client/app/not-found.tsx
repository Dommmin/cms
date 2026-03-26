import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
