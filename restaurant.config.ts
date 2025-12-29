
export const restaurantConfig = {
  name: "La Bella Cucina",
  theme: {
    // Colors must be in HSL format without the function, e.g. "0 0% 100%"
    // This allows us to use tailwind's opacity modifiers if needed.
    primaryColor: "20 100% 50%", // Orange-ish
    secondaryColor: "210 20% 98%", // Off-white
    accentColor: "142 76% 36%", // Green
    borderRadius: "0.5rem",
  },
  content: {
    heroTitle: "Authentic Italian Flavors",
    heroSubtitle: "Experience the taste of Tuscany in the heart of the city.",
    aboutText: "Founded in 1985, La Bella Cucina breathes the tradition of Italian hospitality. We serve fresh, handmade pasta and wood-fired pizzas.",
  },
  contact: {
    phone: "+1234567890",
    whatsapp: "1234567890", // Format for API: 1234567890
    address: "123 Culinary Ave, Foodie City",
    googleMapsLink: "https://goo.gl/maps/example",
  },
  features: {
    enableMenu: true,
    enablePreOrder: false,
    enableSmokingArea: true,
  },
};
