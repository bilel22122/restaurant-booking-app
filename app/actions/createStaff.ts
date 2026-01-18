"use server";

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createStaffAccount(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const rateStr = formData.get('hourly_rate') as string;
    const hourly_rate = rateStr ? parseFloat(rateStr) : 0;

    if (!email || !password || !name) {
        return { message: 'Please provide all required fields (Name, Email, Password).', error: true };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
        return { message: 'Server configuration error. Please check logs.', error: true };
    }

    // Initialize Admin Client (Bypasses RLS)
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { } // Admin client doesn't need to persist session
            }
        }
    );

    try {
        // 1. Create User in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name } // Still keeping name in metadata as backup
        });

        if (authError) {
            console.error("Auth creation error:", authError);
            return { message: authError.message, error: true };
        }

        if (!authData.user) {
            return { message: 'Failed to create user.', error: true };
        }

        // 2. Assign Role 'staff' AND Personal Details
        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
                user_id: authData.user.id,
                role: 'staff',
                full_name: name,
                phone_number: phone || null,
                hourly_rate: hourly_rate
            });

        if (roleError) {
            console.error("Role assignment error:", roleError);
            // Attempt to clean up
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return { message: 'Failed to assign role to user. User creation rolled back.', error: true };
        }

        revalidatePath('/admin/staff');
        revalidatePath('/admin/timesheets');
        return { message: `Staff member ${name} created successfully!`, error: false };

    } catch (e: any) {
        return { message: e.message || 'An unexpected error occurred.', error: true };
    }
}
