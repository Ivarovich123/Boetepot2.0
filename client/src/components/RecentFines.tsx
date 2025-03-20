import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Fine } from "@shared/schema";

export default function RecentFines() {
  const { data: recentFines = [], isLoading } = useQuery<Fine[]>({
    queryKey: ['/api/fines/recent'],
  });

  return (
    <section className="bg-card dark:bg-card-foreground rounded-xl shadow-md p-5 md:p-6">
      <h2 className="text-2xl font-bold text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary pb-2 mb-4">
        Recente Boetes
      </h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
        </div>
      ) : recentFines.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Speler</th>
                <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Datum</th>
                <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Bedrag</th>
                <th className="bg-primary text-white font-semibold p-3 sticky top-0 z-10 text-left">Reden</th>
              </tr>
            </thead>
            <tbody>
              {recentFines.map((fine) => (
                <tr key={fine.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <td className="p-3 border-b border-gray-200 dark:border-gray-700">{fine.speler}</td>
                  <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatDate(fine.datum)}</td>
                  <td className="p-3 border-b border-gray-200 dark:border-gray-700">{formatCurrency(fine.bedrag)}</td>
                  <td className="p-3 border-b border-gray-200 dark:border-gray-700">{fine.reden}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Geen recente boetes gevonden.
        </div>
      )}
    </section>
  );
}
