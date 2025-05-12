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
            />
          </div>
        </div>
      }
    />
  );
}
