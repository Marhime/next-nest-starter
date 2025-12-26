/**
 * Profile Page
 * Display user profile and account settings
 */

import { redirect } from 'next/navigation';

export default function ProfilePage() {
  // Redirect legacy /profile to the listings tab
  redirect('/profile/listings');
}
