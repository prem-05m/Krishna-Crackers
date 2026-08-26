import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
        Light Up Your Celebrations
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10">
        Premium quality fireworks for every occasion. Shop online and get estimates instantly.
      </p>
      <Link 
        href="/products"
        className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(165,65,45,0.4)] hover:shadow-[0_0_40px_rgba(165,65,45,0.6)] text-lg"
      >
        Shop Now
      </Link>
    </div>
  );
}