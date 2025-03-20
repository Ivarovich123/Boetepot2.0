import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import TotalCounter from "@/components/TotalCounter";
import PlayerHistory from "@/components/PlayerHistory";
import RecentFines from "@/components/RecentFines";
import AdminPanel from "@/components/AdminPanel";
import LoginForm from "@/components/LoginForm";

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  
  // Get total fines
  const { data: totalData } = useQuery<{ total: number }>({
    queryKey: ['/api/fines/total'],
  });
  
  // Get unique players for dropdowns
  const { data: playersData } = useQuery<{ spelers: string[] }>({
    queryKey: ['/api/fines/players'],
  });
  
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };
  
  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
  };
  
  // Load FontAwesome and Chosen
  useEffect(() => {
    // Load FontAwesome
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
    document.head.appendChild(fontAwesome);
    
    // Load Inter font
    const interFont = document.createElement("link");
    interFont.rel = "stylesheet";
    interFont.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap";
    document.head.appendChild(interFont);
    
    return () => {
      document.head.removeChild(fontAwesome);
      document.head.removeChild(interFont);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
      
      <TotalCounter totalAmount={totalData?.total || 0} />
      
      <div className="container mx-auto px-4 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlayerHistory players={playersData?.spelers || []} />
          <RecentFines />
          
          {isAdmin ? (
            <AdminPanel 
              onLogout={handleLogout} 
              players={playersData?.spelers || []} 
            />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
