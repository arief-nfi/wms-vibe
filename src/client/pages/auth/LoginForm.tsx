import { Button } from "@client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client/components/ui/card";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { cn } from "@client/lib/utils";
import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import { set } from "zod";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setToken, setUser } = useAuth();
  let navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loginResponse = await axios.post("/api/auth/login", {
        username,
        password,
      });
      const userResponse = await axios.get("/api/auth/user", {
        headers: {
          Authorization: "Bearer " + loginResponse.data.accessToken,
        },
      });
      setToken(loginResponse.data.accessToken);
      setUser(userResponse.data);
      const redirectTo = searchParams.get("redirectTo");
      navigate(redirectTo || "/console/dashboard");
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className='lg:min-w-[350px]'>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Please login to start session</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={username}
                    placeholder="username@tenant.domain"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/auth/forget-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-destructive text-center text-sm">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <p> Login </p>
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}              
                <div className="py-1">
                  <NavLink
                    className="underline underline-offset-4"
                    to="/auth/register-tenant"
                  >
                    Create your Tenant
                </NavLink>
                </div>
                
              </div>
              
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
