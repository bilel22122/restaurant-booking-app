-- Update Bookings Table Status Constraint for v2.0
-- We need to drop the old constraint and add a new one with the expanded status list.

-- 1. Drop the existing check constraint
ALTER TABLE public.bookings
DROP CONSTRAINT bookings_status_check;

-- 2. Add the new check constraint with 'seated' and 'no_show'
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'seated', 'no_show'));
