"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- START ONESIGNAL TRIGGER ---
const ONESIGNAL_APP_ID = "be01a0d6-cbe2-4420-a504-9b0fc66eb38a";
const ONESIGNAL_API_KEY = "os_v2_app_xya2bvwl4jccbjietmh4m3vtrltuysil45dewgnos5ckzscczhslsie6zeoomiu4e77ezvkdyvq5rs3phouejldybfhygdv6adt4pty";

export type CreateBookingState = {
    message?: string;
    error?: string;
    success?: boolean;
};

export async function createBooking(
    prevState: CreateBookingState,
    formData: FormData
): Promise<CreateBookingState> {
    const cookieStore = await cookies();

    // Create a Supabase client that uses the cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const guests = formData.get("guests") as string;
    const notes = formData.get("notes") as string;

    // Insert into Supabase
    const { error } = await supabase.from("bookings").insert({
        customer_name: name,
        phone_number: phone,
        booking_date: date,
        booking_time: time,
        party_size: parseInt(guests),
        status: "pending",
        notes: notes,
    });

    if (error) {
        console.error("Booking error:", error);
        return { error: "Failed to create booking", success: false };
    }

    // --- START ONESIGNAL TRIGGER ---
    try {
        // Construct the message using form data
        const notificationData = {
            app_id: ONESIGNAL_APP_ID,
            contents: {
                en: `New Booking! 📅 ${date} at ${time} for ${guests} people.`
            },
            headings: { en: "New Reservation 🔔" },
            included_segments: ["Total Subscriptions"], // Sends to all Admins
        };

        await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
            },
            body: JSON.stringify(notificationData),
        });
        console.log("✅ Notification sent to Admin");
    } catch (err) {
        console.error("❌ Failed to send notification:", err);
    }
    // --- END ONESIGNAL TRIGGER ---

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");

    return { success: true, message: "Booking confirmed" };
}
