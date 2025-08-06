// app/admin/default/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from 'lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Coffee, Sparkles, Star, Heart } from 'lucide-react';

export default async function AdminDefaultPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { 
      role: true, 
      name: true,
      email: true 
    },
  });

  if (!user || user.role !== 'ADMIN') {
    return redirect('/sign-in');
  }

  const greetings = [
    "Hope you're having an awesome day!",
    "Ready to make things happen?",
    "Looking great as always!",
    "Time for some admin magic!",
    "The digital realm awaits your wisdom!",
    "Another day, another adventure!",
  ];

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-20 opacity-20">
          <Star className="h-6 w-6 text-purple-400 animate-pulse" />
        </div>
        <div className="absolute top-40 right-32 opacity-30">
          <Sparkles className="h-8 w-8 text-pink-400 animate-bounce" />
        </div>
        <div className="absolute bottom-32 left-16 opacity-25">
          <Heart className="h-5 w-5 text-red-400 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-20">
          <Coffee className="h-6 w-6 text-amber-400 animate-pulse" />
        </div>

        {/* Main greeting card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-12">
            
            {/* Crown icon */}
            <div className="mb-6">
              <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
                <Crown className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Main greeting */}
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Good {timeOfDay}, {user.name || 'Admin'}!
              <Sparkles className="inline h-10 w-10 ml-3 text-yellow-500" />
            </h1>

            {/* Random greeting message */}
            <p className="text-xl text-gray-600 mb-6 font-medium">
              {randomGreeting}
            </p>

            {/* Admin badge */}
            <div className="flex justify-center mb-8">
              <Badge 
                variant="secondary" 
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
              >
                <Crown className="h-4 w-4 mr-2" />
                ADMIN ACCESS
              </Badge>
            </div>

            {/* Decorative quote */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-l-4 border-purple-400">
              <p className="text-gray-700 italic text-lg">
                "With great admin power comes great responsibility... 
                and really good coffee!" ☕
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Fun footer message */}
        <div className="mt-8">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            You're doing amazing! Keep being awesome 
            <Heart className="h-4 w-4 text-red-400" />
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </p>
        </div>

        {/* Extra floating sparkles */}
        <div className="absolute top-1/4 left-1/4 opacity-10">
          <div className="animate-spin">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 opacity-15">
          <div className="animate-bounce" style={{ animationDelay: '1s' }}>
            <Star className="h-3 w-3 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}