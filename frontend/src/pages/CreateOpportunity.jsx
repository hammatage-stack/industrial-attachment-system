import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { opportunityAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateOpportunity = () => {
  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    title: '',
    description: '',
    type: 'industrial-attachment',
    category: 'IT & Software',
    location: '',
    duration: '',
    requirements: '',
    benefits: '',
    availableSlots: 1,
    applicationDeadline: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements ? form.requirements.split(',').map(s => s.trim()) : [],
        benefits: form.benefits ? form.benefits.split(',').map(s => s.trim()) : [],
        availableSlots: Number(form.availableSlots)
      };

      const res = await opportunityAPI.create(payload);
      toast.success('Opportunity created');
      navigate(`/opportunities/${res.data.opportunity._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error creating opportunity');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Create Opportunity</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-sm">
        <div>
          <label className="block text-sm font-medium">Company Name</label>
          <input name="companyName" value={form.companyName} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Company Email</label>
            <input name="companyEmail" value={form.companyEmail} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Company Phone</label>
            <input name="companyPhone" value={form.companyPhone} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border rounded" rows={6} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="type" value={form.type} onChange={handleChange} className="px-3 py-2 border rounded">
            <option value="internship">Internship</option>
            <option value="industrial-attachment">Industrial Attachment</option>
            <option value="both">Both</option>
          </select>
          <select name="category" value={form.category} onChange={handleChange} className="px-3 py-2 border rounded">
            <option>IT & Software</option>
            <option>Engineering</option>
            <option>Business & Finance</option>
            <option>Marketing & Sales</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Manufacturing</option>
            <option>Hospitality</option>
            <option>Media & Communications</option>
            <option>Other</option>
          </select>
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g., 3 months)" className="px-3 py-2 border rounded" />
          <input name="availableSlots" value={form.availableSlots} onChange={handleChange} type="number" min={1} className="px-3 py-2 border rounded" />
          <input name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} type="date" className="px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Requirements (comma separated)</label>
          <input name="requirements" value={form.requirements} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Benefits (comma separated)</label>
          <input name="benefits" value={form.benefits} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Creating...' : 'Create Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOpportunity;
