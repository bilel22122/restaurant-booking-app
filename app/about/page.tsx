
export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gray-50 py-24 text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">Our Story</h1>
            </div>

            {/* History Text */}
            <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-8">
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                    Passion for food and family traditions has always been at the heart of our restaurant.
                    Founded with the belief that a meal should be more than just food—it should be an experience.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
            </div>

            {/* Meet the Chef */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12">Meet the Chef</h2>
                    <div className="flex flex-col items-center">
                        {/* Photo Placeholder */}
                        <div className="w-48 h-48 bg-gray-200 rounded-full mb-8 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg">
                            <span className="text-sm font-medium uppercase tracking-wider">Photo</span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Chef Antoine</h3>
                        <p className="text-gray-600 text-lg max-w-lg leading-relaxed">
                            With over 20 years of culinary excellence, Chef Antoine brings a unique blend of traditional flavors and modern techniques to every dish, crafting modifications that surprise and delight.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
