import Link from 'next/link';

/**
 * Page d'index pour les exemples d'utilisation des API
 */
export default function ExamplesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exemples d'utilisation des API</h1>
      
      <div className="space-y-4">
        <div className="border rounded p-4 hover:bg-gray-50 transition-colors">
          <h2 className="text-xl font-semibold mb-2">
            <Link href="/examples/api-usage" className="text-blue-600 hover:underline">
              Exemple d'utilisation directe des API
            </Link>
          </h2>
          <p className="text-gray-600">
            Cet exemple montre comment utiliser directement les services API pour interagir avec le backend.
          </p>
        </div>
        
        <div className="border rounded p-4 hover:bg-gray-50 transition-colors">
          <h2 className="text-xl font-semibold mb-2">
            <Link href="/examples/hooks-usage" className="text-blue-600 hover:underline">
              Exemple d'utilisation des hooks API
            </Link>
          </h2>
          <p className="text-gray-600">
            Cet exemple montre comment utiliser les hooks personnalisés pour simplifier l'interaction avec les API.
          </p>
        </div>
      </div>
    </div>
  );
}