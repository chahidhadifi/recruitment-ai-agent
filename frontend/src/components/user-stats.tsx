"use client";

import { useEffect, useState } from "react";
import { UserStats as UserStatsType } from "@/types/user";
import { Users, UserCheck, UserCog } from "lucide-react";

interface UserStatsProps {}

export function UserStats({}: UserStatsProps) {
  const [stats, setStats] = useState<UserStatsType>({
    totalUsers: 0,
    adminCount: 0,
    recruiterCount: 0,
    candidateCount: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Utilisation de l'API route Next.js
        const response = await fetch('http://localhost:8000/api/users-stats');
        if (response.ok) {
          const userStats = await response.json();
          setStats(userStats);
        } else {
          console.error(`Erreur API: ${response.status}`);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total des utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "Administrateurs",
      value: stats.adminCount,
      icon: UserCog,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      title: "Recruteurs",
      value: stats.recruiterCount,
      icon: UserCheck,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Candidats",
      value: stats.candidateCount,
      icon: Users,
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    },
    {
      title: "Utilisateurs actifs",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    },
    {
      title: "Utilisateurs inactifs",
      value: stats.inactiveUsers,
      icon: Users,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {isLoading ? (
        // Afficher un état de chargement
        Array(4).fill(0).map((_, index) => (
          <div
            key={index}
            className="bg-card rounded-lg shadow-sm p-4 flex items-center justify-between animate-pulse"
          >
            <div className="w-full">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-5 w-5"></div>
            </div>
          </div>
        ))
      ) : (
        // Afficher les statistiques
        statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-card rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}