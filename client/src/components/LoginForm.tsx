import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('POST', '/api/fines/login', { password });
      return response.json();
    },
    onSuccess: () => {
      setPassword("");
      onLoginSuccess();
    },
    onError: (error) => {
      toast({
        title: "Login mislukt",
        description: "Incorrect wachtwoord, probeer opnieuw.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  return (
    <section className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6 max-w-md mx-auto col-span-1 lg:col-span-2">
      <h2 className="text-2xl font-bold text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary pb-2 mb-4">
        Admin Login
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="passwordInput" className="block text-sm font-medium mb-1">
            Wachtwoord
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="passwordInput"
              className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Voer wachtwoord in"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
            >
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
          >
            {loginMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-sign-in-alt mr-2"></i>
            )}{" "}
            Inloggen
          </button>
        </div>
      </form>
    </section>
  );
}
