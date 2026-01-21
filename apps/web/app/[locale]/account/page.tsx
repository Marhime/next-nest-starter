/**
 * Account Page
 * Main account page - displays user listings
 */

import { redirect } from 'next/navigation';

export default function AccountPage() {
  // Redirect to listings tab
  redirect('/account/listings');
}
