import React from 'react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@client/components/ui/card"
import { Button } from "@client/components/ui/button"
import { Badge } from "@client/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@client/components/ui/avatar"
import {
  Heart,
  Share2,
  MoreHorizontal,
  Star,
  MapPin,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Download,
  Eye,
  MessageCircle,
  ThumbsUp,
  Settings,
  Bell,
  CreditCard,
  Activity
} from "lucide-react"

const CardShowcase = () => {
  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4" >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Card Component</h1>
        </div>
      </header>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-8 px-2 py-2 md:gap-10">
          
          {/* Basic Usage */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Simple Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>
                    This is a basic card with title and description.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is the main content area of the card.</p>
                </CardContent>
              </Card>

              {/* Card with Footer */}
              <Card>
                <CardHeader>
                  <CardTitle>Card with Footer</CardTitle>
                  <CardDescription>
                    A card that includes footer actions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Content goes here with footer actions below.</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save</Button>
                </CardFooter>
              </Card>

              {/* Card with Action */}
              <Card>
                <CardHeader>
                  <CardTitle>Card with Action</CardTitle>
                  <CardDescription>
                    Card with action button in header.
                  </CardDescription>
                  <CardAction>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p>Notice the action button in the top-right corner.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Content Variations */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Content Variations</h2>
            <div className="grid gap-4 md:grid-cols-2">
              
              {/* User Profile Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">John Doe</CardTitle>
                      <CardDescription>Software Engineer</CardDescription>
                    </div>
                  </div>
                  <CardAction>
                    <Button variant="outline" size="sm">Follow</Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Passionate about React and TypeScript. Building amazing user experiences.
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      San Francisco
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      Joined 2023
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </CardFooter>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                    Analytics Overview
                  </CardTitle>
                  <CardDescription>
                    Your performance metrics for this month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <Eye className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      Views
                    </span>
                    <span className="font-semibold">12,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      Visitors
                    </span>
                    <span className="font-semibold">3,241</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <ThumbsUp className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      Likes
                    </span>
                    <span className="font-semibold">827</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="mr-2 h-4 w-4" />
                    View Detailed Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Business Cards */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Business Use Cases</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Product Card */}
              <Card>
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-lg mb-3"></div>
                  <CardTitle className="line-clamp-1">Premium Headphones</CardTitle>
                  <CardDescription className="line-clamp-2">
                    High-quality wireless headphones with noise cancellation
                  </CardDescription>
                  <CardAction>
                    <Button variant="ghost" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">$299</span>
                    <Badge variant="secondary">New</Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">(124)</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>

              {/* Basic Plan Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Plan</CardTitle>
                  <CardDescription>
                    Perfect for individuals getting started
                  </CardDescription>
                  <CardAction>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">Popular</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">$9</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Up to 5 projects
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      10GB storage
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Email support
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Basic analytics
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Up to 5 projects
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      10GB storage
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Email support
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Basic analytics
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      Up to 5 projects
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" className="w-full">Get Started</Button>
                </CardFooter>
              </Card>

              {/* Pro Plan Card */}
              <Card>
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 transform rotate-45 translate-x-6 -translate-y-6"></div>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Pro Plan
                    <Badge className="ml-2">Best Value</Badge>
                  </CardTitle>
                  <CardDescription>
                    For growing teams and businesses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">$29</span>
                      <span className="text-sm text-muted-foreground ml-1">per month</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-through">$39/month</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Unlimited projects
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      100GB storage
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Priority support
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Advanced analytics
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Team collaboration
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Unlimited projects
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      100GB storage
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Priority support
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Advanced analytics
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="secondary" className="w-full">Start Free Trial</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Color Variations */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Color Variations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Success Theme Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Success Status</CardTitle>
                  <CardDescription>Operation completed successfully</CardDescription>
                  <CardAction>
                    <Badge className="bg-green-600">Complete</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">All systems operational</p>
                      <p className="text-sm text-muted-foreground">Last updated 5 minutes ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Theme Card */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-300">Warning Alert</CardTitle>
                  <CardDescription>Attention required for this item</CardDescription>
                  <CardAction>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Review required</p>
                      <p className="text-sm text-muted-foreground">3 items need attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Theme Card */}
              <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300">Error Status</CardTitle>
                  <CardDescription>Something went wrong</CardDescription>
                  <CardAction>
                    <Badge variant="destructive">Failed</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Connection failed</p>
                      <p className="text-sm text-muted-foreground">Retry in 30 seconds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purple Theme Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-300">Premium Feature</CardTitle>
                  <CardDescription>Unlock advanced capabilities</CardDescription>
                  <CardAction>
                    <Badge className="bg-purple-600">Pro</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Star className="mr-2 h-4 w-4 text-purple-600" />
                      Advanced analytics
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="mr-2 h-4 w-4 text-purple-600" />
                      Priority support
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Upgrade Now</Button>
                </CardFooter>
              </Card>

              {/* Dark Theme Card */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="text-gray-100">Dark Mode Card</CardTitle>
                  <CardDescription className="text-gray-300">Optimized for dark interfaces</CardDescription>
                  <CardAction>
                    <Badge variant="outline" className="border-gray-500 text-gray-300">Dark</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">This card demonstrates dark theme styling with custom background and text colors.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-700">
                    View Details
                  </Button>
                </CardFooter>
              </Card>

              {/* Gradient Accent Card */}
              <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                <CardHeader>
                  <CardTitle>Gradient Accent</CardTitle>
                  <CardDescription className="text-cyan-100">Bold gradient background design</CardDescription>
                  <CardAction>
                    <Badge className="bg-white text-cyan-600">New</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span>Perfect for call-to-action cards</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Layout Variations */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Layout Variations</h2>
            
            {/* Horizontal Layout */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Horizontal Layout</h3>
              <Card>
                <CardContent>
                  <div className="flex">
                    <div className="w-32 h-32 bg-muted flex-shrink-0"></div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Article Title</h3>
                          <p className="text-sm text-muted-foreground">Brief description</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          5 min read
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="mr-1 h-4 w-4" />
                            12
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            3
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compact Cards */}
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Compact Cards</h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Card className="py-4">
                  <CardContent className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardContent className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Revenue</p>
                      <p className="text-2xl font-bold">$12,345</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardContent className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-2xl font-bold">89%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardContent className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Growth</p>
                      <p className="text-2xl font-bold">+12%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Interactive Examples */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Interactive Examples</h2>
            <div className="grid gap-4 md:grid-cols-2">
              
              {/* Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Auth</p>
                      <p className="text-xs text-muted-foreground">Add extra security</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Data Export</p>
                      <p className="text-xs text-muted-foreground">Download your data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Manage your billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-6 bg-blue-500 rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/24</p>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg opacity-60">
                      <div className="w-8 h-6 bg-red-500 rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">•••• •••• •••• 8888</p>
                        <p className="text-xs text-muted-foreground">Expires 06/25</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Add New Card</Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default CardShowcase