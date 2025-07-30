import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Default from 'components/auth/variants/DefaultAuthLayout';

export default function Page() {
  return (
    <Default
      maincard={
        <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <SignUp afterSignInUrl="/redirect"
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
        </div>
      }
    />
  );
}
