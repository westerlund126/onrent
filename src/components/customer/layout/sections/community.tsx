// ✅ Add this
// import { Discord } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const CommunitySection = () => {
  return (
    <section id="community" className="py-12 ">
      <hr className="border-secondary" />
      <div className="container py-20 sm:py-20">
        <div className="mx-auto lg:w-[60%]">
          <Card className="flex flex-col items-center justify-center border-none bg-background text-center shadow-none">
            <CardHeader>
              <CardTitle className="flex flex-col items-center text-4xl font-bold md:text-5xl">
                {/* <Discord className="mb-4 h-12 w-12 text-[#5865F2]" />{' '} */}
                <div>
                  Ready to join this
                  <span className="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text pl-2">
                    Community?
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xl text-muted-foreground lg:w-[80%]">
              Join our vibrant Discord community! Connect, share, and grow with
              like-minded enthusiasts. Click to dive in! 🚀
            </CardContent>

            <CardFooter>
              <Button asChild>
                <a href="https://discord.com/" target="_blank">
                  Join Discord
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <hr className="border-secondary" />
    </section>
  );
};
