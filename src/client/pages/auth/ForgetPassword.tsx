import { Button } from '@client/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@client/components/ui/form'
import { Input } from '@client/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router'
import { toast } from 'sonner'
import z from 'zod'
import { forgetPasswordSchema } from './authFormSchema'

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof forgetPasswordSchema>>({
    resolver: zodResolver(forgetPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof forgetPasswordSchema>) {
    console.log(values);
    setIsLoading(true);
    axios
      .post("/api/auth/forget-password", values)
      .then(() => {
        navigate(`/auth/login`);
        toast.success("Password reset link sent successfully. Check your email.", { duration: 8000 });
      })
      .catch((error) => {
        console.error("Error sending password reset link:", error);
        toast.error("Failed to send password reset link.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className='lg:min-w-[350px]'>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forget Password</CardTitle>
          <CardDescription>
            Please enter your username to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Username <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="username@tenant.domain"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <p> Send Reset Link </p>
                  )}
                </Button>
              </div>
              <div className="text-center text-sm pt-4">
                Already have an account?{" "}
                <NavLink
                  className="underline underline-offset-4"
                  to="/auth/login"
                >
                  Sign in
                </NavLink>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

export default ForgetPassword