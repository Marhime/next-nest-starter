import { SignupForm } from './signup-form';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src="/logo1.svg"
            alt="Home image showcase"
            width={170}
            height={30}
            priority
          />
        </Link>
        <SignupForm />
      </div>
    </div>
  );
}
