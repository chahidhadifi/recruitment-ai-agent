'use client';

import { useState } from 'react';
import { useApi, useApiData } from '@/lib/hooks';
import { jobsApi, applicationsApi } from '@/lib/api';
import { Job } from '@/types/job';

/**
 * Exemple de composant React utilisant les hooks personnalisés pour les API
 */
export default function HooksUsageExample() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Utilisation de useApiData pour charger les offres d'emploi au montage du composant
  const { 
    data: jobs, 
    loading: jobsLoading, 
    error: jobsError,
    refetch: refetchJobs 
  } = useApiData(jobsApi.getAll, [], []);
  
  // Utilisation de useApi pour charger les détails d'une offre d'emploi à la demande
  const { 
    data: selectedJob, 
    loading: jobDetailsLoading, 
    error: jobDetailsError,
    execute: fetchJobDetails 
  } = useApi(jobsApi.getById);
  
  // Utilisation de useApi pour postuler à une offre d'emploi
  const { 
    loading: applyLoading, 
    error: applyError,
    execute: applyToJob 
  } = useApi(applicationsApi.create);
  
  // Fonction pour sélectionner une offre d'emploi
  async function handleJobSelect(jobId: string) {
    setSelectedJobId(jobId);
    await fetchJobDetails(jobId);
  }
  
  // Fonction pour postuler à une offre d'emploi
  async function handleApply() {
    if (!selectedJobId) return;
    
    try {
      await applyToJob({
        jobId: selectedJobId,
        candidateId: 'candidat-1', // ID du candidat connecté
        coverLetter: 'Lettre de motivation exemple',
        cvUrl: '/cv/exemple.pdf',
        status: 'pending'
      });
      
      alert('Candidature envoyée avec succès!');
      // Rafraîchir la liste des offres pour mettre à jour le nombre de candidatures
      refetchJobs();
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exemple d'utilisation des hooks API</h1>
      
      {(jobsError || jobDetailsError || applyError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {jobsError?.message || jobDetailsError?.message || applyError?.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liste des offres d'emploi */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Offres d'emploi</h2>
          
          {jobsLoading ? (
            <p>Chargement des offres...</p>
          ) : (
            <ul className="space-y-2">
              {jobs?.map((job: Job) => (
                <li key={job.id} className="border-b pb-2">
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                  <button
                    onClick={() => handleJobSelect(job.id)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Sélectionner
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Détails de l'offre sélectionnée */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Détails de l'offre</h2>
          
          {jobDetailsLoading ? (
            <p>Chargement des détails...</p>
          ) : selectedJob ? (
            <div>
              <h3 className="text-lg font-medium">{selectedJob.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedJob.company} - {selectedJob.location}</p>
              <p className="mb-2">{selectedJob.description}</p>
              
              <h4 className="font-medium mt-4">Responsabilités:</h4>
              <ul className="list-disc pl-5 mb-2">
                {selectedJob.responsibilities.map((item: string, index: number) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
              
              <button
                onClick={handleApply}
                disabled={applyLoading}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {applyLoading ? 'Envoi en cours...' : 'Postuler'}
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Sélectionnez une offre pour voir les détails</p>
          )}
        </div>
      </div>
    </div>
  );
}