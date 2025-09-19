import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Shield, Zap } from "lucide-react";

export const AuthPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to the AI system.",
        className: "neon-glow-cyan",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
        className: "neon-glow-success",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed", 
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    
    try {
      // First try to sign in directly (user might already exist)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "superrshary@gmail.com",
        password: "password123",
      });

      // If sign in successful, we're done
      if (!signInError) {
        toast({
          title: "Demo Access Granted!",
          description: "Welcome to the AI Student Risk Assessment System.",
          className: "neon-glow-cyan",
        });
        return;
      }

      // If user doesn't exist, create them
      if (signInError?.message?.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: "superrshary@gmail.com",
          password: "password123",
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: "Demo",
              last_name: "Admin",
              role: "admin",
            }
          }
        });

        if (signUpError) {
          // If sign up failed because user already exists, try to sign in again
          if (signUpError.message?.includes("already registered")) {
            const { error: retrySignInError } = await supabase.auth.signInWithPassword({
              email: "superrshary@gmail.com",
              password: "password123",
            });
            
            if (retrySignInError) throw retrySignInError;
          } else {
            throw signUpError;
          }
        }

        toast({
          title: "Demo Account Created!",
          description: "Demo user created and signed in successfully.",
          className: "neon-glow-cyan",
        });
      } else {
        throw signInError;
      }

    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Demo Login Failed",
        description: `Error: ${error.message}. Please try the manual sign-up option.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="neural-node absolute top-1/4 left-1/4 animate-neural-pulse"></div>
        <div className="neural-node absolute top-3/4 right-1/4 animate-neural-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="neural-node absolute top-1/2 left-3/4 animate-neural-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-card hover-lift relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center neon-glow-cyan">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-heading holographic-text">
              Nexus Predict AI
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Student Dropout Prediction & Counseling System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 glass-panel">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary/20">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="admin@school.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-panel border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="glass-panel border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:scale-105 transition-transform neon-glow-cyan"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Access System</span>
                    </div>
                  )}
                </Button>
              </form>
              <div className="mt-4 space-y-3">
                <Button 
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 neon-glow-purple"
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Quick Demo Access</span>
                  </div>
                </Button>
                <div className="text-sm text-center text-muted-foreground space-y-2">
                  <p className="terminal-text">Demo Credentials: superrshary@gmail.com / password123</p>
                  <p className="text-xs text-yellow-400">💡 Use Quick Demo Access button above for instant login!</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="glass-panel border-primary/20 focus:border-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="glass-panel border-primary/20 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="glass-panel border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="john.doe@school.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-panel border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="glass-panel border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:scale-105 transition-transform neon-glow-cyan"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Join System</span>
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};