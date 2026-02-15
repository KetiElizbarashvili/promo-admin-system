import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useToast } from '../hooks/useToast';
import { prizeApi } from '../api/prize';
import { participantApi } from '../api/participant';
import type { Prize, Participant } from '../types';
import { Gift, Plus, Edit2, Trash2, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [showRedeem, setShowRedeem] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const { success, error: showError } = useToast();
  const { isSuperAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    costPoints: '',
    stockQty: '',
  });

  const [redeemData, setRedeemData] = useState({
    uniqueId: '',
    participant: null as Participant | null,
  });

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    setLoading(true);
    try {
      const data = await prizeApi.getAll();
      setPrizes(data);
    } catch (err) {
      showError('Failed to load prizes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: formData.name,
        imageUrl: formData.imageUrl || null,
        costPoints: parseInt(formData.costPoints),
        stockQty: formData.stockQty ? parseInt(formData.stockQty) : null,
      };

      if (editingPrize) {
        await prizeApi.update(editingPrize.id, data);
        success('Prize updated successfully');
      } else {
        await prizeApi.create(data);
        success('Prize created successfully');
      }

      loadPrizes();
      handleCancel();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to save prize');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      imageUrl: prize.imageUrl || '',
      costPoints: prize.costPoints.toString(),
      stockQty: prize.stockQty?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prize?')) return;

    setLoading(true);
    try {
      await prizeApi.delete(id);
      success('Prize deleted successfully');
      loadPrizes();
    } catch (err) {
      showError('Failed to delete prize');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPrize(null);
    setFormData({ name: '', imageUrl: '', costPoints: '', stockQty: '' });
  };

  const handleSearchParticipant = async () => {
    if (!redeemData.uniqueId.trim()) return;

    setLoading(true);
    try {
      const participant = await participantApi.getByUniqueId(redeemData.uniqueId);
      setRedeemData({ ...redeemData, participant });
    } catch (err) {
      showError('Participant not found');
      setRedeemData({ ...redeemData, participant: null });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemData.participant || !selectedPrize) return;

    if (!confirm(`Redeem ${selectedPrize.name} for ${redeemData.participant.firstName} ${redeemData.participant.lastName}?`)) {
      return;
    }

    setLoading(true);
    try {
      await prizeApi.redeem(redeemData.uniqueId, selectedPrize.id);
      success('Prize redeemed successfully!');
      loadPrizes();
      setShowRedeem(false);
      setSelectedPrize(null);
      setRedeemData({ uniqueId: '', participant: null });
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to redeem prize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prizes</h1>
          <div className="flex space-x-3">
            {!showRedeem && (
              <button
                onClick={() => setShowRedeem(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Award className="w-5 h-5" />
                <span>Redeem Prize</span>
              </button>
            )}
            {isSuperAdmin && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Prize</span>
              </button>
            )}
          </div>
        </div>

        {/* Prize Form */}
        {showForm && isSuperAdmin && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingPrize ? 'Edit Prize' : 'Add New Prize'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Prize Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cost (Points)</label>
                  <input
                    type="number"
                    value={formData.costPoints}
                    onChange={(e) => setFormData({ ...formData, costPoints: e.target.value })}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Stock Qty (blank = unlimited)</label>
                  <input
                    type="number"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                    className="input"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving...' : editingPrize ? 'Update Prize' : 'Create Prize'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Redeem Form */}
        {showRedeem && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Redeem Prize</h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={redeemData.uniqueId}
                  onChange={(e) => setRedeemData({ ...redeemData, uniqueId: e.target.value })}
                  className="input flex-1"
                  placeholder="Enter Unique ID"
                />
                <button onClick={handleSearchParticipant} disabled={loading} className="btn btn-primary">
                  Search
                </button>
                <button onClick={() => setShowRedeem(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>

              {redeemData.participant && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">
                    {redeemData.participant.firstName} {redeemData.participant.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Active Points: {redeemData.participant.activePoints}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prizes Grid */}
        {loading && prizes.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prizes.map((prize) => {
              const canRedeem = redeemData.participant && 
                redeemData.participant.activePoints >= prize.costPoints &&
                prize.status === 'ACTIVE' &&
                (prize.stockQty === null || prize.stockQty > 0);

              return (
                <div key={prize.id} className="card hover:shadow-lg transition-shadow">
                  {prize.imageUrl && (
                    <img
                      src={prize.imageUrl}
                      alt={prize.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{prize.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      prize.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prize.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-red-600">{prize.costPoints} points</p>
                    <p className="text-sm text-gray-600">
                      Stock: {prize.stockQty === null ? 'Unlimited' : prize.stockQty}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {showRedeem && redeemData.participant && (
                      <button
                        onClick={() => {
                          setSelectedPrize(prize);
                          handleRedeem();
                        }}
                        disabled={!canRedeem || loading}
                        className="btn btn-primary flex-1 text-sm disabled:opacity-50"
                      >
                        Redeem
                      </button>
                    )}
                    {isSuperAdmin && !showRedeem && (
                      <>
                        <button
                          onClick={() => handleEdit(prize)}
                          className="btn btn-secondary flex-1 flex items-center justify-center space-x-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prize.id)}
                          disabled={loading}
                          className="btn btn-danger flex-1 flex items-center justify-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {prizes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No prizes available yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
