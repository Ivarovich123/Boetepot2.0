import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { insertFineSchema, insertReasonSchema } from "@shared/schema";
import { Fine, Reason } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminPanelProps {
  onLogout: () => void;
  players: string[];
}

export default function AdminPanel({ onLogout, players }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fines state
  const [newFine, setNewFine] = useState({
    speler: "",
    bedrag: "",
    reden: "",
    customReason: ""
  });
  
  // Reasons state
  const [newReason, setNewReason] = useState({
    naam: "",
    bedrag: ""
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Queries
  const { data: allFines = [], isLoading: isLoadingFines } = useQuery<Fine[]>({
    queryKey: ['/api/fines/all'],
  });
  
  const { data: allReasons = [], isLoading: isLoadingReasons } = useQuery<Reason[]>({
    queryKey: ['/api/fines/reasons'],
  });
  
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
      queryClient.invalidateQueries({ queryKey: ['/api/fines/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/total'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/player-totals'] });
      // Also invalidate the current player's history if needed
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
      queryClient.invalidateQueries({ queryKey: ['/api/fines/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/total'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/player-totals'] });
      // Also invalidate the current player's history if needed
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Reasons management mutations
  const addReasonMutation = useMutation({
    mutationFn: async (reason: { naam: string; bedrag: number }) => {
      const response = await apiRequest('POST', '/api/fines/reasons/add', reason);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reden succesvol toegevoegd!",
        variant: "default",
      });
      
      // Reset form
      setNewReason({
        naam: "",
        bedrag: ""
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/fines/reasons'] });
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteReasonMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/fines/reasons/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Reden succesvol verwijderd!",
        variant: "default",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/fines/reasons'] });
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Season reset mutation
  const resetSeasonMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/fines/reset', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Nieuw seizoen gestart!",
        description: "Alle boetes zijn gereset",
        variant: "default",
      });
      
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ['/api/fines/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/total'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fines/player-totals'] });
    },
    onError: (error) => {
      toast({
        title: "Er is een fout opgetreden!",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler for fine form submission
  const handleSubmitFine = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine final reason
    const finalReason = newFine.reden === 'Anders' ? newFine.customReason : newFine.reden;
    
    try {
      // Validate the data using the schema
      insertFineSchema.parse({
        speler: newFine.speler,
        bedrag: parseFloat(newFine.bedrag),
        reden: finalReason
      });
      
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
  
  // Handler for reasons form submission
  const handleSubmitReason = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate the data using the schema
      insertReasonSchema.parse({
        naam: newReason.naam,
        bedrag: parseFloat(newReason.bedrag)
      });
      
      // Submit the data
      addReasonMutation.mutate({
        naam: newReason.naam,
        bedrag: parseFloat(newReason.bedrag)
      });
    } catch (error) {
      toast({
        title: "Validatiefout",
        description: "Controleer of alle velden correct zijn ingevuld",
        variant: "destructive",
      });
    }
  };
  
  // Handler for season reset confirmation
  const handleResetSeason = () => {
    if (confirm('Weet je zeker dat je alle boetes wilt resetten voor een nieuw seizoen? Dit kan niet ongedaan worden gemaakt!')) {
      resetSeasonMutation.mutate();
    }
  };
  
  // Handler for deleting a fine
  const handleDeleteFine = (id: number) => {
    if (confirm('Weet je zeker dat je deze boete wilt verwijderen?')) {
      deleteFineMutation.mutate(id);
    }
  };
  
  // Handler for deleting a reason
  const handleDeleteReason = (id: number) => {
    if (confirm('Weet je zeker dat je deze reden wilt verwijderen?')) {
      deleteReasonMutation.mutate(id);
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

  return (
    <section className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6 col-span-1 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary pb-2">
          Admin Dashboard
        </h2>
        <button
          onClick={onLogout}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Uitloggen
        </button>
      </div>
      
      {/* Admin Tabs */}
      <Tabs defaultValue="fines" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="fines">Boetes</TabsTrigger>
          <TabsTrigger value="reasons">Redenen</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
        </TabsList>
        
        {/* Tab 1: Fines Management */}
        <TabsContent value="fines" className="space-y-6">
          {/* Add Fine Form */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-xl font-bold mb-4">Boete Toevoegen</h3>
            
            <form onSubmit={handleSubmitFine} className="space-y-4 max-w-xl mx-auto">
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
                  {allReasons.map((reason) => (
                    <option key={reason.id} value={reason.naam}>
                      {reason.naam} ({formatCurrency(reason.bedrag)})
                    </option>
                  ))}
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
          <div>
            <h3 className="text-xl font-bold mb-4">Alle Boetes</h3>
            
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
                        <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Speler</th>
                        <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Datum</th>
                        <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Bedrag</th>
                        <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Reden</th>
                        <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-center">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background dark:bg-background">
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
        </TabsContent>
        
        {/* Tab 2: Reasons Management */}
        <TabsContent value="reasons" className="space-y-6">
          {/* Add Reason Form */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-xl font-bold mb-4">Reden Toevoegen</h3>
            
            <form onSubmit={handleSubmitReason} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label htmlFor="reasonNameInput" className="block text-sm font-medium mb-1">
                  Naam
                </label>
                <input
                  type="text"
                  id="reasonNameInput"
                  className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                  value={newReason.naam}
                  onChange={(e) => setNewReason({ ...newReason, naam: e.target.value })}
                  placeholder="Bijv. Te laat op training"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="reasonAmountInput" className="block text-sm font-medium mb-1">
                  Standaard Bedrag (€)
                </label>
                <input
                  type="number"
                  id="reasonAmountInput"
                  className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
                  step="0.01"
                  min="0"
                  value={newReason.bedrag}
                  onChange={(e) => setNewReason({ ...newReason, bedrag: e.target.value })}
                  required
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addReasonMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                >
                  {addReasonMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-plus-circle mr-2"></i>
                  )}{" "}
                  Reden toevoegen
                </button>
              </div>
            </form>
          </div>
          
          {/* All Reasons */}
          <div>
            <h3 className="text-xl font-bold mb-4">Alle Redenen</h3>
            
            {isLoadingReasons ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
              </div>
            ) : allReasons.length > 0 ? (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Naam</th>
                      <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Standaard Bedrag</th>
                      <th className="bg-primary dark:bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-center">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background dark:bg-background">
                    {allReasons.map((reason) => (
                      <tr key={reason.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <td className="p-3 border-b border-gray-200 dark:border-gray-700">{reason.naam}</td>
                        <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatCurrency(reason.bedrag)}</td>
                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center">
                          <button
                            onClick={() => handleDeleteReason(reason.id)}
                            disabled={deleteReasonMutation.isPending}
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
                Geen redenen gevonden. Voeg redenen toe om boetes te kunnen categoriseren.
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Tab 3: Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <h3 className="text-xl font-bold mb-4">Seizoen Reset</h3>
            <p className="mb-4">
              Gebruik deze functie om alle boetes te resetten voor een nieuw seizoen. 
              Dit verwijdert alle bestaande boetes, maar behoudt spelers en redenen.
              <span className="block mt-2 text-red-600 dark:text-red-400 font-semibold">
                Let op: Deze actie kan niet ongedaan worden gemaakt!
              </span>
            </p>
            
            <button
              onClick={handleResetSeason}
              disabled={resetSeasonMutation.isPending}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
            >
              {resetSeasonMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-trash-alt mr-2"></i>
              )}{" "}
              Reset alle boetes
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
