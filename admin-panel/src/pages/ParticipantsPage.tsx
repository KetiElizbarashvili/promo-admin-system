import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useToast } from '../hooks/useToast';
import { participantApi } from '../api/participant';
import type { Participant } from '../types';
import { Search, Plus, Lock, Unlock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function ParticipantsPage() {
  const [query, setQuery] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const { success, error: showError } = useToast();
  const { isSuperAdmin } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await participantApi.search(query);
      setParticipants(results);
      if (results.length === 0) {
        showError('No participants found');
      }
    } catch (err) {
      showError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    setLoading(true);
    try {
      const updated = await participantApi.addPoints(
        selectedParticipant.uniqueId,
        parseInt(points),
        note
      );
      setSelectedParticipant(updated);
      setParticipants(participants.map(p => p.id === updated.id ? updated : p));
      success(`Added ${points} points successfully!`);
      setShowAddPoints(false);
      setPoints('');
      setNote('');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to add points');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (uniqueId: string) => {
    const reason = prompt('Enter reason for locking:');
    if (!reason) return;

    setLoading(true);
    try {
      await participantApi.lock(uniqueId, reason);
      success('Participant locked successfully');
      const updated = await participantApi.getByUniqueId(uniqueId);
      setSelectedParticipant(updated);
      setParticipants(participants.map(p => p.uniqueId === uniqueId ? updated : p));
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to lock participant');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (uniqueId: string) => {
    setLoading(true);
    try {
      await participantApi.unlock(uniqueId);
      success('Participant unlocked successfully');
      const updated = await participantApi.getByUniqueId(uniqueId);
      setSelectedParticipant(updated);
      setParticipants(participants.map(p => p.uniqueId === uniqueId ? updated : p));
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to unlock participant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Participants</h1>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input"
                placeholder="Search by Unique ID, Phone, or Email"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Results List */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
            
            {participants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No participants found. Try searching.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {participants.map((participant) => (
                  <button
                    key={participant.id}
                    onClick={() => setSelectedParticipant(participant)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedParticipant?.id === participant.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{participant.uniqueId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{participant.totalPoints} pts</div>
                        <div className={`text-xs ${participant.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                          {participant.status}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Participant Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Participant Details</h2>
            
            {selectedParticipant ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Unique ID</p>
                    <p className="text-2xl font-bold text-red-600">{selectedParticipant.uniqueId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedParticipant.firstName} {selectedParticipant.lastName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="text-xl font-bold text-gray-900">{selectedParticipant.totalPoints}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Points</p>
                      <p className="text-xl font-bold text-green-600">{selectedParticipant.activePoints}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedParticipant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedParticipant.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedParticipant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedParticipant.email}</p>
                  </div>
                </div>

                {!showAddPoints ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAddPoints(true)}
                      className="btn btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Points</span>
                    </button>

                    {isSuperAdmin && (
                      selectedParticipant.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleLock(selectedParticipant.uniqueId)}
                          disabled={loading}
                          className="btn btn-danger w-full flex items-center justify-center space-x-2"
                        >
                          <Lock className="w-5 h-5" />
                          <span>Lock Participant</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlock(selectedParticipant.uniqueId)}
                          disabled={loading}
                          className="btn btn-primary w-full flex items-center justify-center space-x-2"
                        >
                          <Unlock className="w-5 h-5" />
                          <span>Unlock Participant</span>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleAddPoints} className="space-y-4">
                    <div>
                      <label className="label">Points to Add</label>
                      <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        className="input"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Note (optional)</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="input"
                        placeholder="e.g., Purchased 2 KitKat bars"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                        {loading ? 'Adding...' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPoints(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a participant to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
