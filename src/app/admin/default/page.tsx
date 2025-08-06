// app/admin/default/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from 'lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Users, Settings, BarChart3, Coffee, Sparkles } from 'lucide-react';

export default async function AdminDefaultPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { 
      role: true, 
      first_name: true,
      last_name: true,
      email: true 
    },
  });

  if (!user || user.role !== 'ADMIN') {
    return redirect('/sign-in');
  }

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const greetings = [
    "Ready to rule the digital kingdom?",
    "Time to make some admin magic happen!",
    "Your dashboard awaits your command!",
    "Another day, another opportunity to be awesome!",
    "The power is in your hands, use it wisely!",
  ];

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Welcome back, {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Admin'}! 
                <Sparkles className="inline h-8 w-8 ml-2 text-yellow-500" />
              </h1>
              <p className="text-slate-600 text-lg">{randomGreeting}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Badge variant="secondary" className="px-3 py-1">
              <Crown className="h-3 w-3 mr-1" />
              ADMIN
            </Badge>
            <span>Current time: {currentTime}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Coffee className="h-3 w-3" />
              Caffeine level: High
            </span>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">1,247</div>
              <p className="text-xs text-slate-500">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  System Health
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">99.9%</div>
              <p className="text-xs text-slate-500">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Admin Power Level
                </CardTitle>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">Over 9000!</div>
              <p className="text-xs text-slate-500">Maximum overdrive</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Admin Central Command
              </CardTitle>
              <CardDescription>
                Your mission control for managing everything and everyone (with great power...)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">🚀 Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fun Facts Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-500" />
                Admin Wisdom Corner
              </CardTitle>
              <CardDescription>
                Daily dose of admin enlightenment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <p className="text-sm text-amber-800 font-medium">
                    💡 Pro Tip: Remember to take breaks! Even admins need to recharge their superpowers.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm text-green-800">
                    <strong>Today's Admin Fact:</strong> You've probably prevented 42 disasters before lunch. 
                    That's some serious superhero work! 🦸‍♂️
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <p className="text-sm text-purple-800">
                    <strong>Mood:</strong> Caffeinated and ready to admin all the things! ☕✨
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            Made with <span className="text-red-500">♥</span> for awesome admins like you
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </p>
        </div>
      </div>
    </div>
  );
}