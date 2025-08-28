import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@client/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@client/components/ui/card"
import { Button } from "@client/components/ui/button"
import { Input } from "@client/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@client/components/ui/select"
import { Checkbox } from "@client/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@client/components/ui/radio-group"
import { Calendar } from "@client/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@client/components/ui/popover"
import { Badge } from "@client/components/ui/badge"
import { TimePicker24h } from "@client/components/time-picker-24h"
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar as CalendarIcon, 
  Clock, 
  Upload, 
  MapPin,
  CreditCard,
  Building,
  Eye,
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react'
import { cn } from "@client/lib/utils"
import { format } from "date-fns"

// Form schemas for different sections
const basicFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

const advancedFormSchema = z.object({
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(2, "City must be at least 2 characters"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    message: "Please select your gender",
  }),
  experience: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    message: "Please select your experience level",
  }),
  newsletter: z.boolean(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
})

const accountFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  birthDate: z.date().optional().refine((date) => {
    if (!date) return false;
    return date <= new Date();
  }, "Please select your birth date"),
  meetingTime: z.date().optional().refine((date) => {
    if (!date) return false;
    return true;
  }, "Please select a meeting time"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const FormShowcase = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const basicForm = useForm<z.infer<typeof basicFormSchema>>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  })

  const advancedForm = useForm<z.infer<typeof advancedFormSchema>>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      country: "",
      city: "",
      gender: undefined,
      experience: undefined,
      newsletter: false,
      terms: false,
    },
  })

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      birthDate: undefined,
      meetingTime: undefined,
    },
  })

  const onBasicSubmit = (values: z.infer<typeof basicFormSchema>) => {
    console.log("Basic form values:", values)
  }

  const onAdvancedSubmit = (values: z.infer<typeof advancedFormSchema>) => {
    console.log("Advanced form values:", values)
  }

  const onAccountSubmit = (values: z.infer<typeof accountFormSchema>) => {
    console.log("Account form values:", values)
  }

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Form Components</h1>
        </div>
      </header>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-8 px-2 py-2 md:gap-10">

          {/* Basic Form Elements */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Form Elements</h2>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information Form</CardTitle>
                <CardDescription>Basic form with input validation and error handling</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...basicForm}>
                  <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter your first name" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Your first name as it appears on official documents.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={basicForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter your last name" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Your last name or surname.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={basicForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="pl-9" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            We'll use this email to send you important updates.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                className="pl-9" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Include your country code for international numbers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700">
                        Submit Basic Form
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => basicForm.reset()}
                      >
                        Reset Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          {/* Advanced Form Elements */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Advanced Form Elements</h2>
            <Card>
              <CardHeader>
                <CardTitle>User Preferences Form</CardTitle>
                <CardDescription>Advanced form with select dropdowns, checkboxes, and custom validation</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...advancedForm}>
                  <form onSubmit={advancedForm.handleSubmit(onAdvancedSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={advancedForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                                <SelectItem value="de">Germany</SelectItem>
                                <SelectItem value="fr">France</SelectItem>
                                <SelectItem value="jp">Japan</SelectItem>
                                <SelectItem value="sg">Singapore</SelectItem>
                                <SelectItem value="id">Indonesia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the country where you reside.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={advancedForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter your city" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              The city where you currently live.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={advancedForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="male" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Male
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="female" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Female
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="other" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Other
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="prefer-not-to-say" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Prefer not to say
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>
                              Select the gender that best describes you.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={advancedForm.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Experience Level</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="beginner" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Beginner
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="intermediate" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Intermediate
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="advanced" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Advanced
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="expert" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Expert
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>
                              Choose your current skill or experience level.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={advancedForm.control}
                        name="newsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Subscribe to Newsletter
                              </FormLabel>
                              <FormDescription>
                                Receive weekly updates about new features and important announcements.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={advancedForm.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Accept Terms and Conditions <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormDescription>
                                You must agree to our Terms of Service and Privacy Policy to continue.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" />
                        Save Preferences
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => advancedForm.reset()}
                      >
                        Reset Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          {/* Account Creation Form with Date & Time Inputs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Account Creation & Date/Time Inputs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Create Account Form</CardTitle>
                <CardDescription>Complex form with password fields, date picker, and time picker</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                    <FormField
                      control={accountForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Choose a username" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            This will be your unique identifier. Use 3-20 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password" 
                                  className="pl-9 pr-9" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={accountForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password" 
                                  className="pl-9 pr-9" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Must match the password above.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Your date of birth is used to calculate your age.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={accountForm.control}
                        name="meetingTime"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Meeting Time</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <TimePicker24h
                                  date={field.value}
                                  setDate={field.onChange}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Select your preferred meeting time.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Create Account
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => accountForm.reset()}
                      >
                        Clear Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          {/* File Upload and Special Inputs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">File Upload & Special Inputs</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>File Upload</CardTitle>
                  <CardDescription>Different file input types and upload areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Profile Picture</label>
                    <div className="mt-2">
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          className="text-sm text-muted-foreground
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-primary file:text-primary-foreground
                            hover:file:bg-primary/90"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Document Upload</label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <div className="text-sm text-muted-foreground">
                          <label className="cursor-pointer text-primary hover:text-primary/80">
                            Click to upload
                            <input type="file" className="hidden" multiple />
                          </label>
                          {" "}or drag and drop
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 50MB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Input Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Input Types</CardTitle>
                  <CardDescription>Various HTML5 input types with icons</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Website URL</label>
                    <div className="relative mt-2">
                      <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">🌐</div>
                      <Input 
                        type="url" 
                        placeholder="https://example.com" 
                        className="pl-9" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Credit Card Number</label>
                    <div className="relative mt-2">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        className="pl-9" 
                        maxLength={19}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <div className="relative mt-2">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="Enter company name" 
                        className="pl-9" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Age Range</label>
                    <div className="mt-2">
                      <input
                        type="range"
                        min="18"
                        max="100"
                        defaultValue="30"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>18</span>
                        <span>30</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Favorite Color</label>
                    <div className="mt-2">
                      <input
                        type="color"
                        defaultValue="#3b82f6"
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Radio Group Showcase */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Radio Group Components</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* Basic Radio Groups */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Radio Groups</CardTitle>
                  <CardDescription>Single selection radio button groups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Preferred Contact Method</label>
                    <RadioGroup defaultValue="email" className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="email" id="contact-email" />
                        <label htmlFor="contact-email" className="text-sm font-normal cursor-pointer">
                          Email
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="phone" id="contact-phone" />
                        <label htmlFor="contact-phone" className="text-sm font-normal cursor-pointer">
                          Phone
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="sms" id="contact-sms" />
                        <label htmlFor="contact-sms" className="text-sm font-normal cursor-pointer">
                          SMS
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="mail" id="contact-mail" />
                        <label htmlFor="contact-mail" className="text-sm font-normal cursor-pointer">
                          Postal Mail
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Account Type</label>
                    <RadioGroup defaultValue="personal" className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="personal" id="account-personal" />
                        <label htmlFor="account-personal" className="text-sm font-normal cursor-pointer">
                          Personal
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="business" id="account-business" />
                        <label htmlFor="account-business" className="text-sm font-normal cursor-pointer">
                          Business
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="organization" id="account-org" />
                        <label htmlFor="account-org" className="text-sm font-normal cursor-pointer">
                          Organization
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Radio Groups */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Radio Groups</CardTitle>
                  <CardDescription>Radio groups with descriptions and complex layouts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Subscription Plan</label>
                    <RadioGroup defaultValue="pro" className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="basic" id="plan-basic" className="mt-0.5" />
                        <div className="flex-1 cursor-pointer" onClick={() => document.getElementById('plan-basic')?.click()}>
                          <label htmlFor="plan-basic" className="text-sm font-medium cursor-pointer">
                            Basic Plan
                          </label>
                          <div className="text-xs text-muted-foreground mt-1">
                            $9/month - Perfect for individuals
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                        <RadioGroupItem value="pro" id="plan-pro" className="mt-0.5" />
                        <div className="flex-1 cursor-pointer" onClick={() => document.getElementById('plan-pro')?.click()}>
                          <label htmlFor="plan-pro" className="text-sm font-medium cursor-pointer">
                            Pro Plan
                          </label>
                          <div className="text-xs text-muted-foreground mt-1">
                            $29/month - Great for small teams
                          </div>
                          <Badge className="mt-2" variant="secondary">Popular</Badge>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="enterprise" id="plan-enterprise" className="mt-0.5" />
                        <div className="flex-1 cursor-pointer" onClick={() => document.getElementById('plan-enterprise')?.click()}>
                          <label htmlFor="plan-enterprise" className="text-sm font-medium cursor-pointer">
                            Enterprise Plan
                          </label>
                          <div className="text-xs text-muted-foreground mt-1">
                            $99/month - For large organizations
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Form State Examples */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Form States & Validation</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* Success State */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Success State</CardTitle>
                  <CardDescription>Form fields with successful validation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value="user@example.com"
                        className="pl-9 border-green-500 focus:border-green-500 focus:ring-green-500" 
                        readOnly
                      />
                      <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-green-600 mt-1">✓ Valid email address</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value="+1 (555) 123-4567"
                        className="pl-9 border-green-500 focus:border-green-500 focus:ring-green-500" 
                        readOnly
                      />
                      <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-green-600 mt-1">✓ Valid phone number format</p>
                  </div>
                </CardContent>
              </Card>

              {/* Error State */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300">Error State</CardTitle>
                  <CardDescription>Form fields with validation errors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value="invalid-email"
                        className="pl-9 pr-9 border-red-500 focus:border-red-500 focus:ring-red-500" 
                        readOnly
                      />
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-xs text-red-600 mt-1">✗ Please enter a valid email address</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value="123"
                        type="password"
                        className="pl-9 pr-9 border-red-500 focus:border-red-500 focus:ring-red-500" 
                        readOnly
                      />
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-xs text-red-600 mt-1">✗ Password must be at least 8 characters long</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Usage Instructions */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
            <Card>
              <CardHeader>
                <CardTitle>How to Use Form Components</CardTitle>
                <CardDescription>Implementation guide and best practices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Basic Setup</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      {`import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@client/components/ui/form"`}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Form Schema</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      {`const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Too short")
})`}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">3. Form Hook</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      {`const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" }
})`}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">✓</div>
                    <div className="text-sm font-medium mt-2">Type Safe</div>
                    <div className="text-xs text-muted-foreground">Full TypeScript support</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">⚡</div>
                    <div className="text-sm font-medium mt-2">Validation</div>
                    <div className="text-xs text-muted-foreground">Built-in Zod validation</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">🎨</div>
                    <div className="text-sm font-medium mt-2">Accessible</div>
                    <div className="text-xs text-muted-foreground">ARIA compliant forms</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </>
  )
}

export default FormShowcase