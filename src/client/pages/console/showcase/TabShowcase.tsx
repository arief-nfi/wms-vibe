import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@client/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client/components/ui/card";
import { Button } from "@client/components/ui/button";
import { Badge } from "@client/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@client/components/ui/avatar";
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Image,
  Video,
  Music,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  CheckCircle,
  Crown,
  Sparkles,
  Moon,
  Zap,
  Flame,
} from "lucide-react";

const TabShowcase = () => {
  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Tabs Component</h1>
        </div>
      </header>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-8 px-2 py-2 md:gap-10">
          {/* Basic Usage */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
            <Card>
              <CardHeader>
                <CardTitle>Simple Tabs</CardTitle>
                <CardDescription>
                  Basic tab implementation with text content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Tab One</TabsTrigger>
                    <TabsTrigger value="tab2">Tab Two</TabsTrigger>
                    <TabsTrigger value="tab3">Tab Three</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">First Tab Content</h3>
                      <p className="text-sm text-muted-foreground">
                        This is the content for the first tab. You can put any
                        content here including text, images, forms, or other
                        components.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Second Tab Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Content for the second tab. Each tab can have completely
                        different content and layout.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Third Tab Content</h3>
                      <p className="text-sm text-muted-foreground">
                        The third tab demonstrates how easy it is to add more
                        tabs to your interface.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Tabs with Icons */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Tabs with Icons</h2>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Navigation</CardTitle>
                <CardDescription>
                  Tabs with icons for better visual identification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList>
                    <TabsTrigger value="profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-medium">John Doe</h3>
                          <p className="text-sm text-muted-foreground">
                            Software Engineer
                          </p>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </div>
                      <p className="text-sm">
                        Manage your profile information, update your bio, and
                        control your privacy settings.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Settings</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">
                              Two-factor authentication
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">Email notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via email
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="notifications" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Notification Center
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                          <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">New message received</p>
                            <p className="text-sm text-muted-foreground">
                              2 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                          <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Security update completed
                            </p>
                            <p className="text-sm text-muted-foreground">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="billing" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Billing Information
                      </h3>
                      <div className="grid gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Current Plan</span>
                            <Badge>Pro Plan</Badge>
                          </div>
                          <p className="text-2xl font-bold">$29/month</p>
                          <p className="text-sm text-muted-foreground">
                            Next billing: Dec 1, 2024
                          </p>
                        </div>
                        <Button className="w-fit">Upgrade Plan</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Dashboard Tabs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Dashboard Tabs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Multiple views of your data and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                      <Activity className="mr-2 h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger value="reports">
                      <FileText className="mr-2 h-4 w-4" />
                      Reports
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Total Users
                              </p>
                              <p className="text-2xl font-bold">2,847</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Revenue
                              </p>
                              <p className="text-2xl font-bold">$45,231</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Growth
                              </p>
                              <p className="text-2xl font-bold">+12.5%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Page Views
                              </p>
                              <p className="text-2xl font-bold">124K</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="analytics" className="mt-4">
                    <div className="space-y-4">
                      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Analytics Chart Placeholder
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Conversion Rate</h4>
                          <p className="text-2xl font-bold text-green-600">
                            3.2%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            +0.5% from last month
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Bounce Rate</h4>
                          <p className="text-2xl font-bold text-red-600">
                            42.1%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            -2.3% from last month
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Session Duration</h4>
                          <p className="text-2xl font-bold text-blue-600">
                            4m 32s
                          </p>
                          <p className="text-sm text-muted-foreground">
                            +18s from last month
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="reports" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Generated Reports
                        </h3>
                        <Button>
                          <Download className="mr-2 h-4 w-4" />
                          Generate New Report
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">
                                Monthly Analytics Report
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Generated on Nov 28, 2024
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">
                                User Engagement Report
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Generated on Nov 25, 2024
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Media Gallery Tabs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Media Gallery</h2>
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Organize different types of media content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="images" className="w-full">
                  <TabsList>
                    <TabsTrigger value="images">
                      <Image className="mr-2 h-4 w-4" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="videos">
                      <Video className="mr-2 h-4 w-4" />
                      Videos
                    </TabsTrigger>
                    <TabsTrigger value="audio">
                      <Music className="mr-2 h-4 w-4" />
                      Audio
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      <FileText className="mr-2 h-4 w-4" />
                      Documents
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="images" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="group relative bg-muted rounded-lg aspect-square overflow-hidden"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="secondary">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="videos" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="group relative bg-muted rounded-lg aspect-video overflow-hidden"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded">
                              Video {i}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="audio" className="mt-4">
                    <div className="space-y-3">
                      {[
                        {
                          name: "Track 1.mp3",
                          duration: "3:42",
                          size: "5.2 MB",
                        },
                        {
                          name: "Background Music.wav",
                          duration: "2:15",
                          size: "12.8 MB",
                        },
                        {
                          name: "Podcast Episode.mp3",
                          duration: "45:23",
                          size: "42.1 MB",
                        },
                      ].map((audio, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Music className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-medium">{audio.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {audio.duration} • {audio.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Play
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-3">
                      {[
                        {
                          name: "Project Proposal.pdf",
                          modified: "2 days ago",
                          size: "2.4 MB",
                        },
                        {
                          name: "Meeting Notes.docx",
                          modified: "1 week ago",
                          size: "156 KB",
                        },
                        {
                          name: "Presentation.pptx",
                          modified: "3 days ago",
                          size: "8.7 MB",
                        },
                      ].map((doc, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Modified {doc.modified} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Compact Tabs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Layout Variations</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Compact Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Compact Tabs</CardTitle>
                  <CardDescription>Space-efficient tab design</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="h-8">
                      <TabsTrigger value="all" className="text-xs px-2 py-1">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="active" className="text-xs px-2 py-1">
                        Active
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="text-xs px-2 py-1"
                      >
                        Done
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Task completed successfully</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Task in progress</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="active" className="mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Task in progress</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="completed" className="mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Task completed successfully</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Full Width */}
              <Card>
                <CardHeader>
                  <CardTitle>Full Width Tabs</CardTitle>
                  <CardDescription>
                    Tabs that stretch to fill container
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="week">This Week</TabsTrigger>
                      <TabsTrigger value="month">This Month</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today" className="mt-4">
                      <div className="text-center p-8 bg-muted rounded-lg">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Today's events and tasks
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="week" className="mt-4">
                      <div className="text-center p-8 bg-muted rounded-lg">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          This week's schedule
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="month" className="mt-4">
                      <div className="text-center p-8 bg-muted rounded-lg">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Monthly overview
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Vertical Tabs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Vertical Tabs</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Vertical */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Vertical Layout</CardTitle>
                  <CardDescription>
                    Tabs arranged vertically for sidebar-style navigation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <div className="flex gap-4">
                      <TabsList className="flex-col h-fit w-40 p-1">
                        <TabsTrigger
                          value="overview"
                          className="w-full justify-start"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="analytics"
                          className="w-full justify-start"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Analytics
                        </TabsTrigger>
                        <TabsTrigger
                          value="reports"
                          className="w-full justify-start"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Reports
                        </TabsTrigger>
                        <TabsTrigger
                          value="settings"
                          className="w-full justify-start"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </TabsTrigger>
                      </TabsList>
                      <div className="flex-1 min-w-0">
                        <TabsContent value="overview" className="mt-0">
                          <div className="p-4 bg-muted rounded-lg h-48">
                            <h3 className="font-medium mb-2">
                              Dashboard Overview
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Get a quick overview of your key metrics and
                              performance indicators.
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  1,234
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Active Users
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  $12.5K
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Revenue
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="analytics" className="mt-0">
                          <div className="p-4 bg-muted rounded-lg h-48">
                            <h3 className="font-medium mb-2">
                              Advanced Analytics
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Detailed analytics and insights about your
                              business performance.
                            </p>
                            <div className="mt-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Conversion Rate</span>
                                <span className="text-sm font-medium">
                                  3.2%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Bounce Rate</span>
                                <span className="text-sm font-medium">
                                  42.1%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  Session Duration
                                </span>
                                <span className="text-sm font-medium">
                                  4m 32s
                                </span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="reports" className="mt-0">
                          <div className="p-4 bg-muted rounded-lg h-50">
                            <h3 className="font-medium mb-2">
                              Generated Reports
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Access and download your generated reports and
                              documents.
                            </p>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between p-2 bg-background rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">
                                    Monthly Report.pdf
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-background rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">
                                    Analytics Summary.pdf
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="settings" className="mt-0">
                          <div className="p-4 bg-muted rounded-lg h-54">
                            <h3 className="font-medium mb-2">
                              Account Settings
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Manage your account preferences and configuration
                              options.
                            </p>
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Email Notifications
                                </span>
                                <Button variant="outline" size="sm">
                                  Toggle
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Two-Factor Auth</span>
                                <Button variant="outline" size="sm">
                                  Enable
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Data Export</span>
                                <Button variant="outline" size="sm">
                                  Export
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Vertical with Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorized Vertical Tabs</CardTitle>
                  <CardDescription>
                    Organized vertical navigation with grouped categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="profile" className="w-full">
                    <div className="flex gap-4">
                      <TabsList className="flex-col h-fit w-40 p-1 space-y-1">
                        <div className="w-full text-xs font-medium text-muted-foreground px-2 py-1">
                          Account
                        </div>
                        <TabsTrigger
                          value="profile"
                          className="w-full justify-start"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </TabsTrigger>
                        <TabsTrigger
                          value="security"
                          className="w-full justify-start"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Security
                        </TabsTrigger>
                        <div className="w-full text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
                          Billing
                        </div>
                        <TabsTrigger
                          value="subscription"
                          className="w-full justify-start"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscription
                        </TabsTrigger>
                        <TabsTrigger
                          value="invoices"
                          className="w-full justify-start"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Invoices
                        </TabsTrigger>
                        <div className="w-full text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
                          Preferences
                        </div>
                        <TabsTrigger
                          value="notifications"
                          className="w-full justify-start"
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </TabsTrigger>
                        <TabsTrigger
                          value="appearance"
                          className="w-full justify-start"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Appearance
                        </TabsTrigger>
                      </TabsList>
                      <div className="flex-1 min-w-0">
                        <TabsContent value="profile" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                Profile Settings
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Manage your profile information
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-sm font-medium">
                                    Display Name
                                  </label>
                                  <div className="text-sm text-muted-foreground">
                                    John Doe
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Email
                                  </label>
                                  <div className="text-sm text-muted-foreground">
                                    john@example.com
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button>Edit Profile</Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="security" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                Security Settings
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Keep your account secure
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <div className="font-medium">Password</div>
                                  <div className="text-sm text-muted-foreground">
                                    Last changed 3 months ago
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Change
                                </Button>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <div className="font-medium">
                                    Two-Factor Authentication
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Not enabled
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Enable
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="subscription" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                Subscription Plan
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Manage your billing and subscription
                              </p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  Current Plan
                                </span>
                                <Badge>Pro Plan</Badge>
                              </div>
                              <div className="text-2xl font-bold mb-1">
                                $29/month
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Next billing: December 1, 2024
                              </div>
                              <div className="mt-4 space-x-2">
                                <Button variant="outline" size="sm">
                                  Change Plan
                                </Button>
                                <Button variant="outline" size="sm">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="invoices" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                Billing History
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                View and download your invoices
                              </p>
                            </div>
                            <div className="space-y-2">
                              {[
                                {
                                  date: "Nov 1, 2024",
                                  amount: "$29.00",
                                  status: "Paid",
                                },
                                {
                                  date: "Oct 1, 2024",
                                  amount: "$29.00",
                                  status: "Paid",
                                },
                                {
                                  date: "Sep 1, 2024",
                                  amount: "$29.00",
                                  status: "Paid",
                                },
                              ].map((invoice, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {invoice.date}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {invoice.amount}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">
                                      {invoice.status}
                                    </Badge>
                                    <Button variant="ghost" size="sm">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="notifications" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                Notification Settings
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Choose how you want to be notified
                              </p>
                            </div>
                            <div className="space-y-3">
                              {[
                                {
                                  title: "Email Notifications",
                                  description: "Receive updates via email",
                                },
                                {
                                  title: "Push Notifications",
                                  description: "Get notified on your device",
                                },
                                {
                                  title: "SMS Notifications",
                                  description: "Receive text message alerts",
                                },
                              ].map((setting, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {setting.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {setting.description}
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Toggle
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="appearance" className="mt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                Appearance
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Customize how the interface looks
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="font-medium mb-2">Theme</div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    Light
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Dark
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    System
                                  </Button>
                                </div>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="font-medium mb-2">Language</div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    English
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Spanish
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    French
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Color Variations */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Color Variations</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Success Theme */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">
                    Success Status Tabs
                  </CardTitle>
                  <CardDescription>
                    Green theme for positive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="completed" className="w-full">
                    <TabsList className="bg-green-100 dark:bg-green-900/50">
                      <TabsTrigger
                        value="completed"
                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </TabsTrigger>
                      <TabsTrigger
                        value="approved"
                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approved
                      </TabsTrigger>
                      <TabsTrigger
                        value="verified"
                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Verified
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="completed" className="mt-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            All tasks completed
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Great work! All your tasks have been successfully
                          completed.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="approved" className="mt-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Request approved
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your request has been reviewed and approved by the
                          team.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="verified" className="mt-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Account verified
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your identity has been verified and account is secure.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Warning Theme */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-300">
                    Warning Alert Tabs
                  </CardTitle>
                  <CardDescription>
                    Orange/yellow theme for attention items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="bg-yellow-100 dark:bg-yellow-900/50">
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Pending
                      </TabsTrigger>
                      <TabsTrigger
                        value="review"
                        className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </TabsTrigger>
                      <TabsTrigger
                        value="attention"
                        className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Attention
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            Items pending review
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          3 items are waiting for approval and need your
                          attention.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="review" className="mt-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            Requires review
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Documents need to be reviewed before final submission.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="attention" className="mt-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            Needs attention
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Important notifications require your immediate
                          attention.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Error Theme */}
              <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300">
                    Error Status Tabs
                  </CardTitle>
                  <CardDescription>
                    Red theme for error and critical states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="errors" className="w-full">
                    <TabsList className="bg-red-100 dark:bg-red-900/50">
                      <TabsTrigger
                        value="errors"
                        className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                      >
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Errors
                      </TabsTrigger>
                      <TabsTrigger
                        value="failed"
                        className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                      >
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Failed
                      </TabsTrigger>
                      <TabsTrigger
                        value="critical"
                        className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                      >
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Critical
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="errors" className="mt-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                          </span>
                          <span className="font-medium text-red-800 dark:text-red-200">
                            System errors detected
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          5 system errors need to be resolved immediately.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="failed" className="mt-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                          </span>
                          <span className="font-medium text-red-800 dark:text-red-200">
                            Failed operations
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Several operations have failed and require manual
                          intervention.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="critical" className="mt-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                          </span>
                          <span className="font-medium text-red-800 dark:text-red-200">
                            Critical alerts
                          </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Critical system alerts that require immediate
                          attention.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Premium Theme */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-300">
                    Premium Feature Tabs
                  </CardTitle>
                  <CardDescription>
                    Purple theme for premium and special features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pro" className="w-full">
                    <TabsList className="bg-purple-100 dark:bg-purple-900/50">
                      <TabsTrigger
                        value="pro"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Pro
                      </TabsTrigger>
                      <TabsTrigger
                        value="premium"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Premium
                      </TabsTrigger>
                      <TabsTrigger
                        value="exclusive"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Exclusive
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="pro" className="mt-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-purple-800 dark:text-purple-200">
                            Pro Features
                          </span>
                          <Badge className="bg-purple-600">New</Badge>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Access advanced analytics, priority support, and
                          exclusive tools.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="premium" className="mt-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-purple-800 dark:text-purple-200">
                            Premium Access
                          </span>
                          <Badge className="bg-purple-600">VIP</Badge>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Unlock all premium features and get dedicated account
                          management.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="exclusive" className="mt-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-purple-800 dark:text-purple-200">
                            Exclusive Content
                          </span>
                          <Badge className="bg-purple-600">Limited</Badge>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Early access to beta features and exclusive member
                          benefits.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Dark Theme */}
              <Card className="bg-gradient-to-br from-gray-900 to-slate-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="text-gray-100">
                    Dark Theme Tabs
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Optimized for dark interfaces
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="dark" className="w-full">
                    <TabsList className="bg-gray-800 border border-gray-600">
                      <TabsTrigger
                        value="dark"
                        className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                      >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </TabsTrigger>
                      <TabsTrigger
                        value="midnight"
                        className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Midnight
                      </TabsTrigger>
                      <TabsTrigger
                        value="stealth"
                        className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Stealth
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="dark" className="mt-4">
                      <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <Moon className="h-5 w-5 text-blue-400" />
                          <span className="font-medium text-gray-100">
                            Dark Mode Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Experience the interface in beautiful dark theme with
                          reduced eye strain.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="midnight" className="mt-4">
                      <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-5 w-5 text-purple-400" />
                          <span className="font-medium text-gray-100">
                            Midnight Edition
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Extra dark theme perfect for late-night work sessions.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="stealth" className="mt-4">
                      <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-5 w-5 text-green-400" />
                          <span className="font-medium text-gray-100">
                            Stealth Mode
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Minimal contrast design for focused work environment.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Gradient Theme */}
              <Card className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white border-0">
                <CardHeader>
                  <CardTitle>Gradient Accent Tabs</CardTitle>
                  <CardDescription className="text-cyan-100">
                    Bold gradient backgrounds for modern interfaces
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="creative" className="w-full">
                    <TabsList className="bg-white/20 backdrop-blur-sm">
                      <TabsTrigger
                        value="creative"
                        className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Creative
                      </TabsTrigger>
                      <TabsTrigger
                        value="modern"
                        className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Modern
                      </TabsTrigger>
                      <TabsTrigger
                        value="dynamic"
                        className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80"
                      >
                        <Flame className="mr-2 h-4 w-4" />
                        Dynamic
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="creative" className="mt-4">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="h-5 w-5 text-white" />
                          <span className="font-medium text-white">
                            Creative Design
                          </span>
                        </div>
                        <p className="text-sm text-white/90">
                          Express your creativity with vibrant colors and modern
                          gradients.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="modern" className="mt-4">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-5 w-5 text-white" />
                          <span className="font-medium text-white">
                            Modern Interface
                          </span>
                        </div>
                        <p className="text-sm text-white/90">
                          Clean, modern design with smooth transitions and
                          effects.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="dynamic" className="mt-4">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Flame className="h-5 w-5 text-white" />
                          <span className="font-medium text-white">
                            Dynamic Content
                          </span>
                        </div>
                        <p className="text-sm text-white/90">
                          Interactive elements with dynamic animations and
                          transitions.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Social Media Example */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Social Media Example</h2>
            <Card>
              <CardHeader>
                <CardTitle>Content Feed</CardTitle>
                <CardDescription>
                  Different views of social content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="feed" className="w-full">
                  <TabsList>
                    <TabsTrigger value="feed">
                      <Activity className="mr-2 h-4 w-4" />
                      Feed
                    </TabsTrigger>
                    <TabsTrigger value="popular">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Popular
                    </TabsTrigger>
                    <TabsTrigger value="following">
                      <Users className="mr-2 h-4 w-4" />
                      Following
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="feed" className="mt-4">
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>U{i}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">User {i}</p>
                              <p className="text-sm text-muted-foreground">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">
                            This is a sample post content that would appear in a
                            social media feed.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <button className="flex items-center space-x-1 hover:text-red-500">
                              <Heart className="h-4 w-4" />
                              <span>24</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-500">
                              <MessageSquare className="h-4 w-4" />
                              <span>8</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-green-500">
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="popular" className="mt-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>TR</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">Trending Creator</p>
                            <p className="text-sm text-muted-foreground">
                              1 day ago
                            </p>
                          </div>
                          <Badge variant="secondary">Trending</Badge>
                        </div>
                        <p className="text-sm">
                          This post is trending with lots of engagement from the
                          community!
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>1.2K</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>89</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="following" className="mt-4">
                    <div className="text-center p-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium mb-2">No new posts</h3>
                      <p className="text-sm text-muted-foreground">
                        Posts from people you follow will appear here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default TabShowcase;
