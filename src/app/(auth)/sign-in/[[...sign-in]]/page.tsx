import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Default from 'components/auth/variants/DefaultAuthLayout';

export default function Page() {
  return (
    <Default
      maincard={
        <div className="w-full">
          <SignIn
            afterSignInUrl="/redirect"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border-0 bg-white dark:bg-navy-800 rounded-2xl w-full",
                headerTitle: "text-xl font-semibold text-navy-700 dark:text-white",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                formButtonPrimary: "bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 transition-all duration-200",
                footerActionLink: "text-primary-500 hover:text-primary-600",
              }
            }}
          />
        </div>
      }
    />
  );
}