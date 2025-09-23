"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Eye, Check, X, Trash2, MapPin, Phone, Calendar, Star } from 'lucide-react';

interface Candidature {
  id: number;
  job_id: number;
  candidate_id: number;
  cover_letter: string;
  cv_url: string;
  status: string;
  applied_at: string;
  updated_at: string;
  phone: string;
  location: string;
  score: number | null;
  observations: string;
  qualified: boolean;
  strengths: string;
  weaknesses: string;
  keywords_match: string;
  analyzed_at: string;
}

export default function CandidaturePage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterQualified, setFilterQualified] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    async function fetchCandidatures() {
      try {
        // Utilise l'URL appropriée selon l'environnement
        const baseURL = process.env.NODE_ENV === 'production' 
          ? "http://backend:8000" 
          : "http://localhost:8000";
        const response = await axios.get(`${baseURL}/api/candidatures`);
        setCandidatures(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des candidatures:", error);
      }
    }
    fetchCandidatures();
  }, []);

  // Filtrage et tri
  let filtered = candidatures.filter((c) => {
    const matchesSearch = c.cover_letter?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.candidate_id.toString().includes(searchTerm);
    const matchesJob = filterJob ? c.job_id.toString() === filterJob : true;
    const matchesStatus = filterStatus ? c.status === filterStatus : true;
    const matchesQualified = filterQualified ? (filterQualified === "true" ? c.qualified : !c.qualified) : true;
    return matchesSearch && matchesJob && matchesStatus && matchesQualified;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "score") {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return sortOrder === "asc" ? 1 : -1;
      if (b.score === null) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
    }
    return 0;
  });

  // Actions
  const handleStatus = async (id: number, status: string) => {
    try {
      const baseURL = process.env.NODE_ENV === 'production' 
        ? "http://backend:8000" 
        : "http://localhost:8000";
      await axios.put(`${baseURL}/api/candidatures/${id}`, { status });
      setCandidatures((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const baseURL = process.env.NODE_ENV === 'production' 
        ? "http://backend:8000" 
        : "http://localhost:8000";
      await axios.delete(`${baseURL}/api/candidatures/${id}`);
      setCandidatures((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const [newCandidature, setNewCandidature] = useState<Partial<Candidature>>({});
  const handleCreate = async () => {
    try {
      const baseURL = process.env.NODE_ENV === 'production' 
        ? "http://backend:8000" 
        : "http://localhost:8000";
      const response = await axios.post(`${baseURL}/api/candidatures`, newCandidature);
      setCandidatures((prev) => [...prev, response.data]);
      setNewCandidature({});
      setShowCreateForm(false);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterJob("");
    setFilterStatus("");
    setFilterQualified("");
    setSortBy("score");
    setSortOrder("desc");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Rejetée';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Candidatures</h1>
                <p className="text-gray-600 mt-1">{filtered.length} candidature{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Tableau de bord
                </Button>
                <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle candidature
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher candidat, localisation..."
                  className="pl-9 bg-gray-50 border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job ID"
                  className="pl-9 bg-gray-50 border-gray-300"
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="accepted">Acceptée</option>
                  <option value="rejected">Rejetée</option>
                  <option value="pending">En attente</option>
                </select>
              </div>

              {/* Qualified Filter */}
              <div>
                <select
                  value={filterQualified}
                  onChange={(e) => setFilterQualified(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous</option>
                  <option value="true">Qualifié</option>
                  <option value="false">Non qualifié</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('_');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="score_desc">Score ↓</option>
                  <option value="score_asc">Score ↑</option>
                </select>
                <Button variant="outline" size="sm" onClick={resetFilters} className="px-3">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="grid gap-4">
              {filtered.map((candidature) => (
                <Card key={candidature.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Candidat #{candidature.candidate_id}
                            </h3>
                            <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusColor(candidature.status)}`}>
                              {getStatusText(candidature.status)}
                            </Badge>
                            {candidature.qualified && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs">
                                ✓ Qualifié
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Job ID: {candidature.job_id}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {candidature.location && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {candidature.location}
                              </span>
                            )}
                            {candidature.phone && (
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {candidature.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(candidature.applied_at).toLocaleDateString()}
                            </span>
                            {candidature.score !== null && (
                              <span className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                {candidature.score}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatus(candidature.id, "accepted")}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatus(candidature.id, "rejected")}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(candidature.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {candidature.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Lettre de motivation</h4>
                        <p className="text-gray-700 text-sm line-clamp-3">{candidature.cover_letter}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {candidature.strengths && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Forces</h5>
                          <p className="text-gray-600">{candidature.strengths}</p>
                        </div>
                      )}
                      {candidature.weaknesses && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Faiblesses</h5>
                          <p className="text-gray-600">{candidature.weaknesses}</p>
                        </div>
                      )}
                      {candidature.keywords_match && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Mots-clés correspondants</h5>
                          <p className="text-gray-600">{candidature.keywords_match}</p>
                        </div>
                      )}
                    </div>

                    {candidature.cv_url && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a
                          href={candidature.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir le CV
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-gray-400">😔</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature trouvée</h3>
              <p className="text-gray-500">Essayez d'ajuster vos filtres ou créez une nouvelle candidature.</p>
            </div>
          )}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Créer une candidature</CardTitle>
                <CardDescription>Remplissez les informations de la nouvelle candidature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Job ID"
                    type="number"
                    value={newCandidature.job_id ?? ""}
                    onChange={e => setNewCandidature({ ...newCandidature, job_id: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Candidate ID"
                    type="number"
                    value={newCandidature.candidate_id ?? ""}
                    onChange={e => setNewCandidature({ ...newCandidature, candidate_id: Number(e.target.value) })}
                  />
                </div>
                <Input
                  placeholder="Lettre de motivation"
                  value={newCandidature.cover_letter ?? ""}
                  onChange={e => setNewCandidature({ ...newCandidature, cover_letter: e.target.value })}
                />
                <Input
                  placeholder="URL du CV"
                  value={newCandidature.cv_url ?? ""}
                  onChange={e => setNewCandidature({ ...newCandidature, cv_url: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Téléphone"
                    value={newCandidature.phone ?? ""}
                    onChange={e => setNewCandidature({ ...newCandidature, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Localisation"
                    value={newCandidature.location ?? ""}
                    onChange={e => setNewCandidature({ ...newCandidature, location: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Score (0-100)"
                    type="number"
                    value={newCandidature.score ?? ""}
                    onChange={e => setNewCandidature({ ...newCandidature, score: Number(e.target.value) })}
                  />
                  <select
                    value={newCandidature.qualified ? "true" : "false"}
                    onChange={e => setNewCandidature({ ...newCandidature, qualified: e.target.value === "true" })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Qualifié</option>
                    <option value="false">Non qualifié</option>
                  </select>
                </div>
                <Input
                  placeholder="Observations"
                  value={newCandidature.observations ?? ""}
                  onChange={e => setNewCandidature({ ...newCandidature, observations: e.target.value })}
                />
                <Input
                  placeholder="Forces"
                  value={newCandidature.strengths ?? ""}
                  onChange={e => setNewCandidature({ ...newCandidature, strengths: e.target.value })}
                />
                <Input
                  placeholder="Faiblesses"
                  value={newCandidature.weaknesses ?? ""}
                  onChange={e => setNewCandidature({ ...newCandidature, weaknesses: e.target.value })}
                />
                <Input
                  placeholder="Mots-clés correspondants"
                  value={newCandidature.keywords_match ?? ""}
                  onChange={e => setNewCandidature({ ...newCandidature, keywords_match: e.target.value })}
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                  Créer la candidature
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}