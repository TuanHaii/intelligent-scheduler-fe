import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginService, registerService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: () => {
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({
        title: "Login failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerService,
    onSuccess: () => {
      toast({ title: "Registration successful", description: "Please log in" });
      setIsLogin(true);
    },
    onError: (err: Error) => {
      toast({
        title: "Registration failed",
        description: err.message || "Could not register",
        variant: "destructive",
      });
    },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onLogin = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  const onRegister = registerForm.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400" />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Intelligent Scheduler</h1>
          <p className="text-sm text-gray-500 mt-2">Your personal command center</p>
        </div>

        {isLogin ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...loginForm.register("email")} className="glass-input" />
              {loginForm.formState.errors.email && (
                <span className="text-xs text-red-500">{loginForm.formState.errors.email.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...loginForm.register("password")} className="glass-input" />
              {loginForm.formState.errors.password && (
                <span className="text-xs text-red-500">{loginForm.formState.errors.password.message}</span>
              )}
            </div>
            <Button type="submit" className="w-full glass-button" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </Button>
            <p
              className="text-center text-sm text-gray-500 pt-4 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsLogin(false)}
            >
              Need an account? Register
            </p>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...registerForm.register("fullName")} className="glass-input" />
              {registerForm.formState.errors.fullName && (
                <span className="text-xs text-red-500">{registerForm.formState.errors.fullName.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...registerForm.register("email")} className="glass-input" />
              {registerForm.formState.errors.email && (
                <span className="text-xs text-red-500">{registerForm.formState.errors.email.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...registerForm.register("password")} className="glass-input" />
              {registerForm.formState.errors.password && (
                <span className="text-xs text-red-500">{registerForm.formState.errors.password.message}</span>
              )}
            </div>
            <Button type="submit" className="w-full glass-button" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creating account..." : "Register"}
            </Button>
            <p
              className="text-center text-sm text-gray-500 pt-4 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsLogin(true)}
            >
              Already have an account? Log in
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
