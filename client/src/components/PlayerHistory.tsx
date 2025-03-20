import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Fine } from "@shared/schema";

interface PlayerHistoryProps {
  players: string[];
}

export default function PlayerHistory({ players }: PlayerHistoryProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  
  const { data: playerHistory = [], isLoading: historyLoading } = useQuery<Fine[]>({
    queryKey: [selectedPlayer ? `/api/fines/player-history/${encodeURIComponent(selectedPlayer)}` : null],
    enabled: !!selectedPlayer,
  });
  
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<{ speler: string, totaal: number }[]>({
    queryKey: ['/api/fines/player-totals'],
  });
  
  const calculatePlayerTotal = () => {
    return playerHistory.reduce((sum, item) => sum + Number(item.bedrag), 0);
  };
  
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.totaal - a.totaal);

  return (
    <section className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6">
      <h2 className="text-2xl font-bold text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary pb-2 mb-4">
        Speler Historie
      </h2>
      
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <select
            className="w-full p-3 text-lg rounded-xl border-2 border-primary focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 bg-background dark:bg-background"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">Selecteer speler</option>
            {players.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedPlayer && setSelectedPlayer(selectedPlayer)}
            className="bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center"
          >
            <i className="fas fa-history mr-2"></i> Toon
          </button>
        </div>
        
        {historyLoading && selectedPlayer && (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
          </div>
        )}
        
        {!historyLoading && playerHistory.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg shadow mb-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Datum</th>
                    <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Bedrag</th>
                    <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Reden</th>
                  </tr>
                </thead>
                <tbody>
                  {playerHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatDate(item.datum)}</td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatCurrency(item.bedrag)}</td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-700">{item.reden}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-right font-bold text-lg">
              <span>Totaal: </span>
              <span>{formatCurrency(calculatePlayerTotal())}</span>
            </div>
          </>
        )}
        
        {!historyLoading && playerHistory.length === 0 && selectedPlayer && (
          <div className="text-center py-4 text-gray-500">
            Geen boetes gevonden voor deze speler.
          </div>
        )}
        
        {!selectedPlayer && (
          <div className="text-center py-4 text-gray-500">
            Selecteer een speler om de historie te bekijken.
          </div>
        )}
      </div>
      
      {/* Leaderboard */}
      <div>
        <h3 className="text-xl font-bold mb-3">Leaderboard</h3>
        {leaderboardLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Speler</th>
                  <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((player, index) => (
                  <tr key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700">{player.speler}</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatCurrency(player.totaal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
