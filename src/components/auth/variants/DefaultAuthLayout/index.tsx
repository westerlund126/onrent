import authImg from '/public/img/auth/auth.png';
import NavLink from 'components/link/NavLink';
import Footer from 'components/footer/FooterAuthDefault';
import { JSX } from 'react';

function Default(props: { maincard: JSX.Element }) {
  const { maincard } = props;

  return (
    <div className="relative min-h-screen w-full !bg-white dark:!bg-navy-900 overflow-hidden">
      <div className="absolute inset-0 md:hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary-200/30 to-secondary-200/30 blur-3xl" />
        <div className="absolute top-1/4 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-secondary-200/20 to-primary-200/20 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-gradient-to-br from-primary-300/25 to-secondary-300/25 blur-3xl" />
        
        <div className="absolute top-16 right-8 h-2 w-2 rounded-full bg-primary-400/60 animate-pulse" />
        <div className="absolute top-32 left-12 h-3 w-3 rounded-full bg-secondary-400/50 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 right-16 h-2.5 w-2.5 rounded-full bg-primary-300/70 animate-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute bottom-48 left-8 h-1.5 w-1.5 rounded-full bg-secondary-300/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <main className="relative min-h-screen">
        <div className="flex min-h-screen">
          {/* Content area - full width on mobile, half on desktop */}
          <div className="flex w-full min-h-screen md:w-1/2 lg:w-[55%]">
            <div className="flex flex-col w-full">
              {/* Main content with proper centering */}
              <div className="flex-1 flex items-center justify-center px-4 py-8 md:px-8 lg:px-12">
                <div className="w-full max-w-md">
                  {maincard}
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-4 md:px-8 lg:px-12 flex justify-center md:justify-start">
                <Footer />
              </div>
            </div>
          </div>

          {/* Background image - hidden on mobile, visible on desktop */}
          <div className="hidden md:block md:w-1/2 lg:w-[45%] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-300 to-primary-300 lg:rounded-bl-[120px] xl:rounded-bl-[200px]">
              {authImg && (
                <div
                  style={{ backgroundImage: `url(${authImg.src})` }}
                  className="w-full h-full bg-cover bg-center lg:rounded-bl-[120px] xl:rounded-bl-[200px]"
                />
              )}
              
              {/* Floating decorations for desktop background */}
              <div className="absolute inset-0 overflow-hidden lg:rounded-bl-[120px] xl:rounded-bl-[200px]">
                {/* Large floating blurs */}
                <div className="absolute top-20 right-16 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }} />
                <div className="absolute top-1/3 left-12 h-40 w-40 rounded-full bg-white/8 blur-3xl animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '5s' }} />
                <div className="absolute bottom-32 right-20 h-36 w-36 rounded-full bg-white/12 blur-2xl animate-pulse" style={{ animationDelay: '3s', animationDuration: '4.5s' }} />
                <div className="absolute bottom-1/4 left-8 h-28 w-28 rounded-full bg-white/9 blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
                
                {/* Small floating dots */}
                <div className="absolute top-24 right-32 h-3 w-3 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-40 left-20 h-2 w-2 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: '2.5s' }} />
                <div className="absolute top-1/2 right-12 h-4 w-4 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-40 left-24 h-2.5 w-2.5 rounded-full bg-white/65 animate-pulse" style={{ animationDelay: '3.5s' }} />
                <div className="absolute bottom-20 right-40 h-3.5 w-3.5 rounded-full bg-white/55 animate-pulse" style={{ animationDelay: '4s' }} />
                <div className="absolute top-2/3 left-16 h-2 w-2 rounded-full bg-white/75 animate-pulse" style={{ animationDelay: '1.8s' }} />
                
                {/* Medium floating elements */}
                <div className="absolute top-16 left-1/3 h-6 w-6 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '2.2s', animationDuration: '3s' }} />
                <div className="absolute bottom-16 right-1/3 h-5 w-5 rounded-full bg-white/45 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.8s' }} />
                
                {/* Subtle floating shapes */}
                <div className="absolute top-1/4 right-8 h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" style={{ animationDelay: '4.5s' }} />
                <div className="absolute bottom-1/3 left-32 h-1 w-1 rounded-full bg-white/90 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Default;