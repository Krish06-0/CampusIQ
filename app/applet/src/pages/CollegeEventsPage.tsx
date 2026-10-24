import React, { useState, useMemo } from 'react';
import {  Calendar,  Plus,  Search,  Filter,  ExternalLink,  Building2,  MapPin,  DollarSign,  CheckCircle2,  Trash2,  Edit3,  Sparkles,  Users,  Clock,  Share2,  ShieldCheck,} from 'lucide-react';
import { CollegeEvent, EventCategory } from '../types';
import { getCollegeEvents, saveCollegeEvent, deleteCollegeEvent, toggleEventInterest } from '../services/eventService';
import { EventFormModal } from '../components/events/EventFormModal';
import { useAuth } from '../context/AuthContext';

interface CollegeEventsPageProps {
  onNavigate?: (tab: string) => void;
}

export const CollegeEventsPage: React.FC<CollegeEventsPageProps> = () => {
  const { currentUser, currentRole } = useAuth();
  const [events, setEvents] = useState<CollegeEvent[]>(() => getCollegeEvents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // For staff

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CollegeEvent | null>(null);

  const isStaffOrAdmin = currentRole === 'STAFF' || currentRole === 'SUPER_ADMIN' || currentRole === 'PLACEMENT_ADMIN';

  const categories: string[] = [
    'ALL',
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

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // If student, only show 'Published' events
      if (!isStaffOrAdmin && evt.status !== 'Published') {
        return false;
      }
      // Staff status filter
      if (isStaffOrAdmin && statusFilter !== 'ALL' && evt.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesCollege = evt.organizingCollege.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCollege && !matchesDesc) return false;
      }
      return true;
    });
  }, [events, isStaffOrAdmin, statusFilter, selectedCategory, searchQuery]);

  const handleSaveEvent = (eventData: Partial<CollegeEvent>) => {
    const updated = saveCollegeEvent(eventData, currentUser.email);
    setEvents(getCollegeEvents());
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this college event announcement?')) {
      const updated = deleteCollegeEvent(id);
      setEvents(updated);
    }
  };

  const handleToggleInterest = (eventId: string) => {
    const studentId = currentUser.rollNumber || currentUser.id || 'student-guest';
    const updated = toggleEventInterest(eventId, studentId);
    setEvents(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0B132B] border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF007A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-[#00F0FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF007A]" />
              <span>MAX Placement 2026 · College Events &amp; Announcements</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {isStaffOrAdmin ? 'Staff College Event Publishing Portal' : 'Inter-College Hackathons & Events Hub'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isStaffOrAdmin
                ? 'Create, manage, and publish college event announcements, hackathons, and workshops for students across all departments.'
                : 'Discover verified hackathons, symposia, and technical workshops hosted by premier institutions. Register directly or mark your interest to collaborate with peers.'}
            </p>
          </div>

          {isStaffOrAdmin && (
            <button
              onClick={() => {
                setEditingEvent(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#7928CA] to-[#00F0FF] text-white text-xs font-black shadow-xl hover:brightness-110 flex items-center gap-2.5 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post College Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B132B] border border-white/[0.08]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, organizing college, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#111C38] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF007A]"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          {isStaffOrAdmin && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#111C38] border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#FF007A]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          )}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-[#111C38] border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#FF007A]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B132B] border border-white/[0.08] space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No college events found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No events match your current search or filter criteria. Try adjusting your filters or posting a new event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const studentId = currentUser.rollNumber || currentUser.id || 'student-guest';
            const isInterested = evt.interestedStudentIds.includes(studentId);
            const interestedCount = evt.interestedStudentIds.length;

            return (
              <div
                key={evt.id}
                className="group rounded-3xl bg-[#0B132B] border border-white/[0.08] overflow-hidden flex flex-col justify-between shadow-xl hover:border-white/[0.2] transition-all duration-300"
              >
                <div>
                  {/* Poster Image */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={evt.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent" />
                    
                    {/* Badges top */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#FF007A] text-white shadow-md">
                        {evt.category}
                      </span>
                      {isStaffOrAdmin && (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                          evt.status === 'Published'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : evt.status === 'Draft'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/40'
                        }`}>
                          {evt.status}
                        </span>
                      )}
                    </div>

                    {/* Date badge bottom */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono font-bold text-slate-200">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/[0.1] text-cyan-400">
                        📅 {evt.eventDate}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/[0.1] text-emerald-400">
                        {evt.participationFee || 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Content body */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#00F0FF] flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{evt.organizingCollege}</span>
                      </div>
                      <h3 className="text-base font-black text-white line-clamp-2 leading-snug">
                        {evt.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.08] text-[11px] text-slate-400">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      {evt.registrationDeadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Register by: {evt.registrationDeadline}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between gap-2">
                  {!isStaffOrAdmin ? (
                    <>
                      <button
                        onClick={() => handleToggleInterest(evt.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isInterested
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md'
                            : 'bg-white/[0.05] text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isInterested ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{isInterested ? "I'm Interested ✓" : "I'm Interested"}</span>
                        {interestedCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/[0.1] text-[10px] font-mono">
                            {interestedCount}
                          </span>
                        )}
                      </button>

                      <a
                        href={evt.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#7928CA] text-white text-xs font-bold shadow-lg hover:brightness-110 flex items-center gap-1.5 transition-all"
                      >
                        <span>Register Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>{interestedCount} interested</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingEvent(evt);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-400 border border-white/[0.1] transition-all cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Form Modal for Staff */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        currentUserEmail={currentUser.email}
      />
    </div>
  );
};
