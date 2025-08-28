import { Button } from '@client/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@client/components/ui/form'
import { Input } from '@client/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router'
import { toast } from 'sonner'
import z from 'zod'
import { forgetPasswordSchema, userResetPasswordSchema } from './authFormSchema'

const ResetPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof userResetPasswordSchema>>({
    resolver: zodResolver(userResetPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      id: "",
      activeTenantId: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof userResetPasswordSchema>) {
    console.log(values);
    setIsLoading(true);
    axios
      .post("/api/auth/reset-password", values)
      .then(() => {
        navigate(`/auth/login`);
        toast.success("Password reset successfully. Please sign in with your new password.", { duration: 8000 });
      })
      .catch((error) => {
        console.error("Error to reset password :", error);
        toast.error("Failed to reset password.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        //setIsLoading(true);
        const response = await axios.get(`/api/auth/reset-password`, {
          params: { token }
        });
        form.setValue("id", response.data.id);
        form.setValue("activeTenantId", response.data.activeTenantId);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/auth/login");
        toast.error("Invalid or expired reset password token.",{ duration: 8000 });
      } finally {
        //setIsLoading(false);
      }
    };

    fetchUser();
    
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card className='lg:min-w-[350px]'>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Please enter your new password to reset your account password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem hidden>
                      <FormControl>
                        <Input {...field} hidden />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activeTenantId"
                  render={({ field }) => (
                    <FormItem hidden>
                      <FormControl>
                        <Input {...field} hidden />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm Password{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
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
                    <p> Reset Password </p>
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

export default ResetPassword