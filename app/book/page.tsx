
import BookingFlow from "@/components/BookingFlow";
import { restaurantConfig } from "@/restaurant.config";

export const metadata = {
    title: `Book a Table - ${restaurantConfig.name}`,
    description: "Reserve your table online.",
};

export default function BookPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Book a Table</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Secure your spot at {restaurantConfig.name}. We look forward to serving you.
                    </p>
                </div>
                <BookingFlow />
            </div>
        </main>
    );
}
