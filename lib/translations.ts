export type Language = 'en' | 'fr' | 'ar';

export const translations = {
    en: {
        // Steps
        step_time: "Time",
        step_details: "Details",
        step_done: "Done",

        // Step 1
        select_date_time: "Select Date & Time",
        label_date: "Date",
        label_slots: "Available Slots",
        label_guests: "Guests",
        btn_continue: "Continue",
        show_all_times: "Show all times ⬇",
        show_less: "Show less ⬆",

        // Hero / CTA
        hero_title: "Discover Our Flavors",
        hero_subtitle: "Indulge in a culinary journey featuring the finest ingredients and authentic recipes.",
        hero_cta: "Explore Our Full Menu",

        // Step 2
        your_details: "Your Details",
        label_name: "Full Name",
        placeholder_name: "John Doe",
        label_phone: "Phone Number",
        placeholder_phone: "+1 234 567 8900",
        label_notes: "Special Requests (Optional)",
        placeholder_notes: "Allergies, high chair needed, etc.",
        btn_back: "Back",
        btn_confirm: "Confirm Booking",

        // Step 3
        booking_confirmed: "Booking Confirmed!",
        booking_await: "We eagerly await your visit,",
        label_confirmed_date: "Date:",
        label_confirmed_time: "Time:",
        label_confirmed_guests: "Guests:",
        btn_whatsapp: "Send Confirmation to WhatsApp",
        btn_calendar: "Add to Calendar",
        btn_directions: "Get Directions",
        btn_menu: "Browse Menu",
        helper_faster: "This helps us prepare your table faster.",
    },
    fr: {
        // Steps
        step_time: "Heure",
        step_details: "Détails",
        step_done: "Fini",

        // Step 1
        select_date_time: "Choisir la date et l'heure",
        label_date: "Date",
        label_slots: "Créneaux disponibles",
        label_guests: "Invités",
        btn_continue: "Continuer",
        show_all_times: "Voir toutes les heures ⬇",
        show_less: "Voir moins ⬆",

        // Hero / CTA
        hero_title: "Découvrez Nos Saveurs",
        hero_subtitle: "Laissez-vous tenter par un voyage culinaire avec les meilleurs ingrédients et des recettes authentiques.",
        hero_cta: "Explorer Notre Menu",

        // Step 2
        your_details: "Vos détails",
        label_name: "Nom complet",
        placeholder_name: "Jean Dupont",
        label_phone: "Numéro de téléphone",
        placeholder_phone: "+33 6 12 34 56 78",
        label_notes: "Demandes spéciales (Optionnel)",
        placeholder_notes: "Allergies, chaise haute, etc.",
        btn_back: "Retour",
        btn_confirm: "Confirmer",

        // Step 3
        booking_confirmed: "Réservation confirmée !",
        booking_await: "Nous attendons votre visite avec impatience,",
        label_confirmed_date: "Date :",
        label_confirmed_time: "Heure :",
        label_confirmed_guests: "Invités :",
        btn_whatsapp: "Envoyer confirmation sur WhatsApp",
        btn_calendar: "Ajouter au calendrier",
        btn_directions: "Itinéraire",
        btn_menu: "Voir le menu",
        helper_faster: "Cela nous aide à préparer votre table plus rapidement.",
    },
    ar: {
        // Steps
        step_time: "الوقت",
        step_details: "التفاصيل",
        step_done: "تم",

        // Step 1
        select_date_time: "اختر التاريخ والوقت",
        label_date: "التاريخ",
        label_slots: "المواعيد المتاحة",
        label_guests: "الضيوف",
        btn_continue: "متابعة",
        show_all_times: "عرض كل الأوقات ⬇",
        show_less: "عرض أقل ⬆",

        // Hero / CTA
        hero_title: "اكتشف نكهاتنا",
        hero_subtitle: "انغمس في رحلة طهي تتميز بأرقى المكونات والوصفات الأصيلة.",
        hero_cta: "اكتشف القائمة الكاملة",

        // Step 2
        your_details: "بياناتك",
        label_name: "الاسم الكامل",
        placeholder_name: "أحمد محمد",
        label_phone: "رقم الهاتف",
        placeholder_phone: "+966 50 123 4567",
        label_notes: "طلبات خاصة (اختياري)",
        placeholder_notes: "حساسية طعام، كرسي أطفال، إلخ.",
        btn_back: "رجوع",
        btn_confirm: "تأكيد الحجز",

        // Step 3
        booking_confirmed: "تم تأكيد الحجز!",
        booking_await: "نحن بانتظار زيارتكم،",
        label_confirmed_date: "التاريخ:",
        label_confirmed_time: "الوقت:",
        label_confirmed_guests: "الضيوف:",
        btn_whatsapp: "إرسال التأكيد عبر واتساب",
        btn_calendar: "إضافة إلى التقويم",
        btn_directions: "الاتجاهات",
        btn_menu: "تصفح القائمة",
        helper_faster: "هذا يساعدنا في تجهيز طاولتك بشكل أسرع.",
    }
};

export type TranslationKey = keyof typeof translations.en;
