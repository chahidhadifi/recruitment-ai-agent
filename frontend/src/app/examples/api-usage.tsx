'use client';

import { useState, useEffect } from 'react';
import { jobsApi, applicationsApi, interviewsApi } from '@/lib/api';
import { Job } from '@/types/job';
import { Interview } from '@/lib/api/interviews';

/**
 * Exemple de composant React utilisant les services API
 */
export default function ApiUsageExample() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les offres d'emploi au chargement du composant
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await jobsApi.getAll();
        setJobs(jobsData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des offres d\'emploi');
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  // Charger les détails d'une offre d'emploi lorsqu'elle est sélectionnée
  async function handleJobSelect(jobId: string) {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les détails de l'offre d'emploi
      const jobData = await jobsApi.getById(jobId);
      setSelectedJob(jobData);
      
      // Charger les entretiens associés à cette offre
      const interviewsData = await interviewsApi.getByJob(parseInt(jobId));
      setInterviews(interviewsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  }

  // Créer une nouvelle candidature
  async function handleApply(jobId: string) {
    try {
      setLoading(true);
      setError(null);
      
      // Exemple de données pour une candidature
      await applicationsApi.create({
        jobId: jobId,
        candidateId: 'candidat-1', // ID du candidat connecté
        coverLetter: 'Lettre de motivation exemple',
        cvUrl: '/cv/exemple.pdf',
        status: 'pending'
      });
      
      alert('Candidature envoyée avec succès!');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setLoading(false);
    }
  }

  // Planifier un entretien
  async function scheduleInterview(candidateId: number, jobId: number) {
    try {
      setLoading(true);
      setError(null);
      
      // Créer un nouvel entretien
      const interview = await interviewsApi.create({
        candidate_id: candidateId,
        job_id: jobId,
        scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Dans 7 jours
      });
      
      // Mettre à jour la liste des entretiens
      setInterviews([...interviews, interview]);
      
      alert('Entretien planifié avec succès!');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la planification de l\'entretien');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exemple d'utilisation des API</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liste des offres d'emploi */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Offres d'emploi</h2>
          
          {loading && <p>Chargement...</p>}
          
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li key={job.id} className="border-b pb-2">
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleJobSelect(job.id)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Postuler
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Détails de l'offre sélectionnée */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Détails de l'offre</h2>
          
          {loading && <p>Chargement...</p>}
          
          {selectedJob ? (
            <div>
              <h3 className="text-lg font-medium">{selectedJob.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedJob.company} - {selectedJob.location}</p>
              <p className="mb-2">{selectedJob.description}</p>
              
              <h4 className="font-medium mt-4">Responsabilités:</h4>
              <ul className="list-disc pl-5 mb-2">
                {selectedJob.responsibilities.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">Prérequis:</h4>
              <ul className="list-disc pl-5 mb-2">
                {selectedJob.requirements.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mt-4">Avantages:</h4>
              <ul className="list-disc pl-5">
                {selectedJob.benefits.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
              
              <div className="mt-4">
                <h4 className="font-medium">Entretiens planifiés:</h4>
                {interviews.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {interviews.map((interview) => (
                      <li key={interview.id} className="text-sm border-b pb-1">
                        Entretien #{interview.id} - {new Date(interview.scheduled_at).toLocaleDateString()}
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {interview.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucun entretien planifié</p>
                )}
                
                <button
                  onClick={() => scheduleInterview(1, parseInt(selectedJob.id))}
                  className="mt-3 px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                  Planifier un entretien
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Sélectionnez une offre pour voir les détails</p>
          )}
        </div>
      </div>
    </div>
  );
}