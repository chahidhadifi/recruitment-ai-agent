import { useState, useCallback } from 'react';
import { ApiError } from '../api';

/**
 * Type générique pour les fonctions d'API
 */
type ApiFunction<T, P extends any[]> = (...args: P) => Promise<T>;

/**
 * Hook personnalisé pour faciliter l'utilisation des services API
 * @param apiFunction - Fonction d'API à exécuter
 * @returns Un objet contenant les données, l'état de chargement, l'erreur et une fonction pour exécuter l'API
 */
export function useApi<T, P extends any[]>(apiFunction: ApiFunction<T, P>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | ApiError | null>(null);

  /**
   * Exécute la fonction d'API avec les arguments fournis
   */
  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError = err instanceof Error ? err : new Error('Une erreur inconnue est survenue');
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}

/**
 * Hook personnalisé pour charger des données au montage du composant
 * @param apiFunction - Fonction d'API à exécuter
 * @param dependencies - Dépendances pour le useEffect
 * @returns Un objet contenant les données, l'état de chargement et l'erreur
 */
export function useApiData<T, P extends any[]>(
  apiFunction: ApiFunction<T, P>,
  args: P,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Une erreur inconnue est survenue');
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, ...args]);

  // Utiliser useEffect pour charger les données au montage du composant
  // et lorsque les dépendances changent
  React.useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  return { data, loading, error, refetch: fetchData };
}