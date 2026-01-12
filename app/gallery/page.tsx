
export default function GalleryPage() {
    return (
        <main className="min-h-screen bg-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Moments & Flavors</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">A glimpse into our culinary world.</p>
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* // TODO: Replace these divs with real <Image /> components */}
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center transition-transform hover:scale-[1.02] duration-300 cursor-pointer"
                        >
                            <div className="text-center">
                                <span className="block text-gray-400 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <span className="text-gray-500 font-medium">Food Shot {item}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
