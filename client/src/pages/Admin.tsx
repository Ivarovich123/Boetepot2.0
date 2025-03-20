import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Fine } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for player management
  const [newPlayerName, setNewPlayerName] = useState("");
  
  // State for fine management
  const [newFine, setNewFine] = useState({
    speler: "",
    bedrag: "",
    reden: "",
    customReason: ""
  });
  
  // Pagination and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Tab state
  const [activeTab, setActiveTab] = useState("fines"); // "fines", "players", "overview"
  
  // Queries
  const { data: allFines = [], isLoading: isLoadingFines } = useQuery<Fine[]>({
    queryKey: ['/api/fines/all'],
  });
  
  const { data: playersData, isLoading: isLoadingPlayers } = useQuery<{ spelers: string[] }>({
    queryKey: ['/api/fines/players'],
  });
  
  // Mutations
  const addFineMutation = useMutation({
    mutationFn: async (fine: { speler: string; bedrag: number; reden: string }) => {
      const response = await apiRequest('POST', '/api/fines/add', fine);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Boete succesvol toegevoegd!",
        variant: "default",
      });
      
      // Reset form
      setNewFine({
        speler: "",
        bedrag: "",
        reden: "",
        customReason: ""
      });
      
      // Refresh data
      invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const addPlayerMutation = useMutation({
    mutationFn: async (playerName: string) => {
      const response = await apiRequest('POST', '/api/fines/players/add', { playerName });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Speler succesvol toegevoegd!",
        variant: "default",
      });
      
      // Reset form
      setNewPlayerName("");
      
      // Refresh data
      invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteFineMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/fines/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Boete succesvol verwijderd!",
        variant: "default",
      });
      
      // Refresh data
      invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deletePlayerMutation = useMutation({
    mutationFn: async (playerName: string) => {
      await apiRequest('DELETE', `/api/fines/players/${encodeURIComponent(playerName)}`);
    },
    onSuccess: () => {
      toast({
        title: "Speler succesvol verwijderd!",
        variant: "default",
      });
      
      // Refresh data
      invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Helper functions
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/fines/all'] });
    queryClient.invalidateQueries({ queryKey: ['/api/fines/recent'] });
    queryClient.invalidateQueries({ queryKey: ['/api/fines/total'] });
    queryClient.invalidateQueries({ queryKey: ['/api/fines/player-totals'] });
    queryClient.invalidateQueries({ queryKey: ['/api/fines/players'] });
  };
  
  const handleLogout = () => {
    setLocation("/");
  };
  
  const handleFineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine final reason
    const finalReason = newFine.reden === 'Anders' ? newFine.customReason : newFine.reden;
    
    try {
      // Submit the data
      addFineMutation.mutate({
        speler: newFine.speler,
        bedrag: parseFloat(newFine.bedrag),
        reden: finalReason
      });
    } catch (error) {
      toast({
        title: "Validatiefout",
        description: "Controleer of alle velden correct zijn ingevuld",
        variant: "destructive",
      });
    }
  };
  
  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlayerName.trim()) {
      toast({
        title: "Validatiefout",
        description: "Spelersnaam mag niet leeg zijn",
        variant: "destructive",
      });
      return;
    }
    
    addPlayerMutation.mutate(newPlayerName);
  };
  
  const handleDeleteFine = (id: number) => {
    if (confirm('Weet je zeker dat je deze boete wilt verwijderen?')) {
      deleteFineMutation.mutate(id);
    }
  };
  
  const handleDeletePlayer = (playerName: string) => {
    if (confirm(`Weet je zeker dat je speler "${playerName}" wilt verwijderen? Alle boetes van deze speler worden ook verwijderd.`)) {
      deletePlayerMutation.mutate(playerName);
    }
  };
  
  // Filter fines based on search query
  const filteredFines = searchQuery
    ? allFines.filter(fine => 
        fine.speler.toLowerCase().includes(searchQuery.toLowerCase()) || 
        fine.reden.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allFines;
  
  // Paginate fines
  const totalPages = Math.ceil(filteredFines.length / itemsPerPage);
  const paginatedFines = filteredFines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Generate array for pagination links
  const paginationArray = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationArray.push(i);
  }
  
  // Filter players based on search
  const players = playersData?.spelers || [];
  
  return (
    <div className="min-h-screen bg-background dark:bg-background pb-10">
      <header className="bg-primary p-4 md:p-5 text-white shadow-md flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold">
          Boetepot Heren 8 - Admin
        </h1>
        <button
          onClick={handleLogout}
          className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Uitloggen
        </button>
      </header>
      
      <div className="container mx-auto px-4 mt-6">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "fines"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("fines")}
          >
            Boetes Beheren
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "players"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("players")}
          >
            Spelers Beheren
          </button>
        </div>
        
        {/* Fines Management */}
        {activeTab === "fines" && (
          <div className="space-y-6">
            {/* Add Fine Form */}
            <div className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6">
              <h2 className="text-2xl font-bold mb-4">Boete Toevoegen</h2>
              
              <form onSubmit={handleFineSubmit} className="space-y-4 max-w-xl mx-auto">
                <div>
                  <label htmlFor="playerAdminInput" className="block text-sm font-medium mb-1">
                    Speler
                  </label>
                  <select
                    id="playerAdminInput"
                    className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                    value={newFine.speler}
                    onChange={(e) => setNewFine({ ...newFine, speler: e.target.value })}
                    required
                  >
                    <option value="">Selecteer speler</option>
                    {players.map((player) => (
                      <option key={player} value={player}>
                        {player}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="amountInput" className="block text-sm font-medium mb-1">
                    Bedrag (€)
                  </label>
                  <input
                    type="number"
                    id="amountInput"
                    className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                    step="0.01"
                    min="0"
                    value={newFine.bedrag}
                    onChange={(e) => setNewFine({ ...newFine, bedrag: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="reasonInput" className="block text-sm font-medium mb-1">
                    Reden
                  </label>
                  <select
                    id="reasonInput"
                    className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                    value={newFine.reden}
                    onChange={(e) => setNewFine({ ...newFine, reden: e.target.value })}
                    required
                  >
                    <option value="">Selecteer reden</option>
                    <option value="Te laat op training">Te laat op training</option>
                    <option value="Telefoon tijdens teambespreking">Telefoon tijdens teambespreking</option>
                    <option value="Vergeten materiaal">Vergeten materiaal</option>
                    <option value="Niet afgemeld">Niet afgemeld</option>
                    <option value="Anders">Anders</option>
                  </select>
                </div>
                
                {newFine.reden === 'Anders' && (
                  <div>
                    <label htmlFor="customReasonInput" className="block text-sm font-medium mb-1">
                      Aangepaste reden
                    </label>
                    <input
                      type="text"
                      id="customReasonInput"
                      className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                      value={newFine.customReason}
                      onChange={(e) => setNewFine({ ...newFine, customReason: e.target.value })}
                      placeholder="Voer een reden in"
                      required
                    />
                  </div>
                )}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={addFineMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                  >
                    {addFineMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-plus-circle mr-2"></i>
                    )}{" "}
                    Boete toevoegen
                  </button>
                </div>
              </form>
            </div>
            
            {/* All Fines */}
            <div className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6">
              <h2 className="text-2xl font-bold mb-4">Alle Boetes</h2>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Zoek op speler of reden..."
                  className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </div>
              
              {isLoadingFines ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                </div>
              ) : paginatedFines.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-lg shadow">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Speler</th>
                          <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Datum</th>
                          <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Bedrag</th>
                          <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Reden</th>
                          <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-center">Acties</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedFines.map((fine) => (
                          <tr key={fine.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <td className="p-3 border-b border-gray-200 dark:border-gray-700">{fine.speler}</td>
                            <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatDate(fine.datum)}</td>
                            <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatCurrency(fine.bedrag)}</td>
                            <td className="p-3 border-b border-gray-200 dark:border-gray-700">{fine.reden}</td>
                            <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center">
                              <button
                                onClick={() => handleDeleteFine(fine.id)}
                                disabled={deleteFineMutation.isPending}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded ${
                          currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      {paginationArray.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded ${
                          currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Geen boetes gevonden die aan de zoekcriteria voldoen.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Players Management */}
        {activeTab === "players" && (
          <div className="space-y-6">
            {/* Add Player Form */}
            <div className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6">
              <h2 className="text-2xl font-bold mb-4">Speler Toevoegen</h2>
              
              <form onSubmit={handlePlayerSubmit} className="space-y-4 max-w-xl mx-auto">
                <div>
                  <label htmlFor="playerNameInput" className="block text-sm font-medium mb-1">
                    Spelernaam
                  </label>
                  <input
                    type="text"
                    id="playerNameInput"
                    className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Voer spelernaam in"
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={addPlayerMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                  >
                    {addPlayerMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-user-plus mr-2"></i>
                    )}{" "}
                    Speler toevoegen
                  </button>
                </div>
              </form>
            </div>
            
            {/* All Players */}
            <div className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6">
              <h2 className="text-2xl font-bold mb-4">Alle Spelers</h2>
              
              {isLoadingPlayers ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                </div>
              ) : players.length > 0 ? (
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Spelernaam</th>
                        <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-center">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <td className="p-3 border-b border-gray-200 dark:border-gray-700">{player}</td>
                          <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center">
                            <button
                              onClick={() => handleDeletePlayer(player)}
                              disabled={deletePlayerMutation.isPending}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Geen spelers gevonden.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}