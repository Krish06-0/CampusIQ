import React, { useState } from 'react';
import { X, Upload, Link, Calendar, Building, DollarSign, Users, Sparkles, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { CollegeEvent, EventCategory, EventPublicationStatus } from '../../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CollegeEvent>) => void;
  initialEvent?: CollegeEvent | null;
  currentUserEmail: string;
}

const CATEGORIES: EventCategory[] = [
  'Hackathon',
  'Workshop',
  'Technical Symposium',
  'Conference',
  'Seminar',
  'Competition',
  'Internship',
  'Cultural Event',
  'Other',
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  currentUserEmail,
}) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [organizingCollege, setOrganizingCollege] = useState(initialEvent?.organizingCollege || 'Vel Tech Multi Tech & VCET');
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category || 'Hackathon');
  const [eventDate, setEventDate] = useState(initialEvent?.eventDate || new Date().toISOString().split('T')[0]);
  const [registrationDeadline, setRegistrationDeadline] = useState(initialEvent?.registrationDeadline || '');
  const [location, setLocation] = useState(initialEvent?.location || 'Main Campus Auditorium / Online');
  const [posterUrl, setPosterUrl] = useState(initialEvent?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800');
  const [registrationUrl, setRegistrationUrl] = useState(initialEvent?.registrationUrl || '');
  const [officialWebsite, setOfficialWebsite] = useState(initialEvent?.officialWebsite || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [eligibility, setEligibility] = useState(initialEvent?.eligibility || 'Open to all engineering students');
  const [participationFee, setParticipationFee] = useState(initialEvent?.participationFee || 'Free');
  const [contactDetails, setContactDetails] = useState(initialEvent?.contactDetails || currentUserEmail);
  const [status, setStatus] = useState<EventPublicationStatus>(initialEvent?.status || 'Published');

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPosterUrl(reader.result);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Event Title is required.');
      return;
    }
    if (!organizingCollege.trim()) {
      setErrorMsg('Organizing College Name is required.');
      return;
    }
    if (!eventDate) {
      setErrorMsg('Event Date is required.');
      return;
    }
    if (!registrationUrl.trim()) {
      setErrorMsg('Registration Link URL is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Event Description is required.');
      return;
    }

    try {
      new URL(registrationUrl);
    } catch {
      setErrorMsg('Please enter a valid Registration URL (starting with https://).');
      return;
    }

    onSave({
      id: initialEvent?.id,
      title: title.trim(),
      organizingCollege: organizingCollege.trim(),
      category,
      eventDate,
      registrationDeadline: registrationDeadline || undefined,
      location: location.trim(),
      posterUrl: posterUrl.trim(),
      registrationUrl: registrationUrl.trim(),
      officialWebsite: officialWebsite.trim() || undefined,
      description: description.trim(),
      eligibility: eligibility.trim() || undefined,
      participationFee: participationFee.trim() || undefined,
      contactDetails: contactDetails.trim() || undefined,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0B132B] border border-white/[0.12] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#111C38] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FF007A] to-[#7928CA] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialEvent ? 'Edit College Event' : 'Post New College Event'}
              </h2>
              <p className="text-xs text-slate-400">
                Publish hackathons, symposia, and workshops for student discovery across institutions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isPreviewMode
                  ? 'bg-[#FF007A] text-white border-[#FF007A]'
                  : 'bg-white/[0.05] text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Edit Form' : 'Student Preview'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isPreviewMode ? (
          /* Student Preview View */
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Live Student Portal View Preview (Status: {status})</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {category}
              </span>
            </div>

            <div className="bg-[#121C38] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg space-y-4">
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
                  alt={title || 'Event Poster'}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FF007A] text-white shadow-md">
                    {category}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-emerald-400 border border-white/[0.1]">
                    📅 {eventDate}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[11px] font-mono font-bold text-[#00F0FF] mb-1">
                    🏛️ {organizingCollege || 'Organizing College'}
                  </div>
                  <h3 className="text-lg font-black text-white">{title || 'Untitled Event'}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/[0.08] text-xs">
                  <div className="text-slate-400">
                    <strong className="text-white block mb-0.5">Location / Mode:</strong>
                    {location}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-white block mb-0.5">Registration Deadline:</strong>
                    {registrationDeadline ? registrationDeadline : 'Open until filled'}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-white block mb-0.5">Participation Fee:</strong>
                    {participationFee || 'Free'}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-white block mb-0.5">Contact Details:</strong>
                    {contactDetails || 'N/A'}
                  </div>
                </div>

                {eligibility && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-300">
                    <strong className="text-indigo-400 block mb-0.5">Eligibility:</strong>
                    {eligibility}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Posted by: {currentUserEmail}</span>
                  <a
                    href={registrationUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#7928CA] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all"
                  >
                    Register Now →
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Event Form Inputs */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-300">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National GenAI Hackathon 2026"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Organizing College Name *</label>
                <input
                  type="text"
                  value={organizingCollege}
                  onChange={(e) => setOrganizingCollege(e.target.value)}
                  placeholder="e.g. Vel Tech Multi Tech / IIT Madras"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Event Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#FF007A]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0B132B] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Event Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#FF007A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Registration Deadline</label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-300">Event Location or Online Meeting Details *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium / Zoom Online Live"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-300">Registration URL (External Link) *</label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://event-register.com/apply"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Official Event Website (Optional)</label>
                <input
                  type="url"
                  value={officialWebsite}
                  onChange={(e) => setOfficialWebsite(e.target.value)}
                  placeholder="https://official-event-site.org"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventPublicationStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#FF007A]"
                >
                  <option value="Published" className="bg-[#0B132B] text-emerald-400">Published (Visible to Students)</option>
                  <option value="Draft" className="bg-[#0B132B] text-amber-400">Draft (Hidden from Students)</option>
                  <option value="Archived" className="bg-[#0B132B] text-slate-400">Archived</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-300">Event Poster (Upload Image or HTTPS URL)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                  />
                  <label className="px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 border border-white/[0.1] transition-all shrink-0">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-300">Detailed Event Description *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive details about the event rounds, prizes, agenda, and guidelines..."
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Eligibility &amp; Participation Requirements</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. 3rd and 4th Year CSE / IT students"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Participation Fee</label>
                <input
                  type="text"
                  value={participationFee}
                  onChange={(e) => setParticipationFee(e.target.value)}
                  placeholder="e.g. Free or ₹250 per team"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-300">Contact Details</label>
                <input
                  type="text"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  placeholder="e.g. Dr. Ramesh (ramesh@vcet.ac.in | +91 98401 23456)"
                  className="w-full px-3.5 py-2.5 bg-[#111C38] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#7928CA] to-[#00F0FF] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                {initialEvent ? 'Save Event Changes' : 'Publish College Event'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
