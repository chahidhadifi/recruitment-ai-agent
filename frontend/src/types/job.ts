export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // CDI, CDD, Stage, etc.
  salary: string;
  postedDate: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  recruiter: string; // ID du recruteur
  applications: number; // Nombre de candidatures
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  coverLetter: string;
  cvUrl: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected' | 'reviewing';
  appliedAt: string;
  updatedAt: string;
  interviewId?: string; // ID de l'entretien associé à cette candidature
  phone?: string; // Numéro de téléphone du candidat
  location?: string; // Localisation du candidat
  jobTitle?: string; // Titre du poste
  company?: string; // Nom de l'entreprise
}