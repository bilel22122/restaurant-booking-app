import { motion } from "framer-motion";

type MenuCardProps = {
    name: string;
    description: string;
    price: number;
    image_url?: string;
};

export default function MenuCard({ name, description, price, image_url }: MenuCardProps) {
    return (
        <div className="bg-white rounded-[var(--radius)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-6 flex flex-col items-center text-center border border-gray-100 h-full">
            <div className="w-48 h-48 mb-6 rounded-full overflow-hidden shadow-md border-4 border-gray-50 flex-shrink-0">
                <img
                    src={image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{description}</p>
            </div>

            <div className="mt-auto pt-4 w-full flex justify-center border-t border-gray-100">
                <span className="text-2xl font-bold text-[var(--primary)]">
                    ${price.toFixed(2)}
                </span>
            </div>
        </div>
    );
}
