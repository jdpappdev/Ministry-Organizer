import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Compass,
  Edit2,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  Clock,
  Navigation,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
import { Territory, Person, PersonLocation, Visit } from '../../types';
import { TopographicPattern } from '../common/TopographicBackground';
import { AddTerritoryModal } from './AddTerritoryModal';
import { NewTerritoryInput } from '../../data/store';
import { StatusIndicator } from '../common/StatusIndicator';
import { InitialsAvatar } from '../common/InitialsAvatar';

function isValidCoordinate(loc?: PersonLocation | null): loc is PersonLocation {
  if (!loc) return false;
  return (
    typeof loc.latitude === 'number' &&
    typeof loc.longitude === 'number' &&
    isFinite(loc.latitude) &&
    isFinite(loc.longitude) &&
    loc.latitude >= -90 &&
    loc.latitude <= 90 &&
    loc.longitude >= -180 &&
    loc.longitude <= 180
  );
}

interface TerritoriesViewProps {
  territories: Territory[];
  people: Person[];
  visits: Visit[];
  onSelectPerson: (personId: string) => void;
  onAddTerritory: (territory: NewTerritoryInput) => void;
  onUpdateTerritory?: (id: string, updates: Partial<Territory>) => void;
  onDeleteTerritory?: (id: string) => void;
  initialSelectedTerritoryId?: string;
  onPreviewPerson?: (person: Person) => void;
  onOpenAddPerson?: (territoryId?: string) => void;
}

function MapUpdater({ people }: { people: Person[] }) {
  const map = useMap();
  useEffect(() => {
    if (people.length === 0) return;
    const bounds = L.latLngBounds(people.map(p => [p.location!.latitude, p.location!.longitude]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [people, map]);
  return null;
}

export const TerritoriesView: React.FC<TerritoriesViewProps> = ({
  territories,
  people,
  visits,
  onSelectPerson,
  onAddTerritory,
  onUpdateTerritory,
  onDeleteTerritory,
  initialSelectedTerritoryId,
  onPreviewPerson,
  onOpenAddPerson,
}) => {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>(
    initialSelectedTerritoryId || (territories[0]?.id ?? '')
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [territoryToEdit, setTerritoryToEdit] = useState<Territory | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [showPeopleList, setShowPeopleList] = useState(false);

  // Sync selected territory if initialSelectedTerritoryId changes
  useEffect(() => {
    if (initialSelectedTerritoryId && territories.some((t) => t.id === initialSelectedTerritoryId)) {
      setSelectedTerritoryId(initialSelectedTerritoryId);
    } else if (territories.length > 0 && !territories.some((t) => t.id === selectedTerritoryId)) {
      setSelectedTerritoryId(territories[0].id);
    }
  }, [initialSelectedTerritoryId, territories, selectedTerritoryId]);

  const selectedIndex = territories.findIndex((t) => t.id === selectedTerritoryId);
  const selectedTerritory = territories[selectedIndex] || territories[0];

  // Derive people assigned to this territory
  const territoryPeople = useMemo(() => {
    if (!selectedTerritory) return [];
    return people.filter((p) => p.territoryId === selectedTerritory.id);
  }, [people, selectedTerritory]);

  // Derive people assigned to this territory who have valid coordinates
  const mappedPeople = useMemo(() => {
    return territoryPeople.filter((p) => isValidCoordinate(p.location));
  }, [territoryPeople]);

  // Derived metrics for selected territory
  const recentlyVisitedCount = useMemo(() => {
    if (!selectedTerritory) return 0;
    const personIds = new Set(territoryPeople.map((p) => p.id));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentVisitsForTerritory = visits.filter((v) => {
      if (!personIds.has(v.personId)) return false;
      const vDate = new Date(v.visitDate || v.date);
      return vDate >= thirtyDaysAgo;
    });

    const uniqueVisitedPersons = new Set(recentVisitsForTerritory.map((v) => v.personId));
    return uniqueVisitedPersons.size;
  }, [selectedTerritory, territoryPeople, visits]);

  // Next / Previous Territory navigation
  const handlePrevTerritory = () => {
    if (territories.length <= 1) return;
    const prevIdx = (selectedIndex - 1 + territories.length) % territories.length;
    setSelectedTerritoryId(territories[prevIdx].id);
    setSelectedPinId(null);
  };

  const handleNextTerritory = () => {
    if (territories.length <= 1) return;
    const nextIdx = (selectedIndex + 1) % territories.length;
    setSelectedTerritoryId(territories[nextIdx].id);
    setSelectedPinId(null);
  };

  // Territory topographic pins layout normalized to 2D field canvas
  const pins = useMemo(() => {
    if (mappedPeople.length === 0) return [];
    if (mappedPeople.length === 1) {
      return [{ person: mappedPeople[0], x: 50, y: 50 }];
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const p of mappedPeople) {
      const { latitude, longitude } = p.location!;
      if (latitude < minLat) minLat = latitude;
      if (latitude > maxLat) maxLat = latitude;
      if (longitude < minLng) minLng = longitude;
      if (longitude > maxLng) maxLng = longitude;
    }

    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;

    const defaultOffsets = [
      { dx: 0, dy: 0 },
      { dx: 14, dy: -12 },
      { dx: -14, dy: 14 },
      { dx: 18, dy: 16 },
      { dx: -18, dy: -14 },
      { dx: 22, dy: -8 },
      { dx: -22, dy: 8 },
    ];

    return mappedPeople.map((person, index) => {
      const lat = person.location!.latitude;
      const lng = person.location!.longitude;

      if (latSpan === 0 && lngSpan === 0) {
        const off = defaultOffsets[index % defaultOffsets.length];
        return {
          person,
          x: Math.min(85, Math.max(15, 50 + off.dx)),
          y: Math.min(85, Math.max(15, 50 + off.dy)),
        };
      }

      const normX = lngSpan > 0 ? (lng - minLng) / lngSpan : 0.5;
      // Invert Y so North (higher latitude) is toward the top of the canvas
      const normY = latSpan > 0 ? 1 - (lat - minLat) / latSpan : 0.5;

      const x = 16 + normX * 68;
      const y = 16 + normY * 68;

      return {
        person,
        x: Math.min(86, Math.max(14, x)),
        y: Math.min(86, Math.max(14, y)),
      };
    });
  }, [mappedPeople]);

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-20">
      {/* 1. TOP HEADER: TERRITORIES + [ + New Territory ] */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#17201E]">
            Territories
          </h1>
          <p className="text-xs font-medium text-[#68716D] mt-0.5">
            Cartographic field overview & mapped contacts
          </p>
        </div>

        <button
          onClick={() => {
            setTerritoryToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="h-12 px-4.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Territory</span>
        </button>
      </div>

      {/* 2. HORIZONTAL TERRITORY SELECTOR */}
      <div className="space-y-2">
        {/* Horizontal Scroll Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {territories.map((t) => {
            const count = people.filter((p) => p.territoryId === t.id).length;
            const isSelected = t.id === selectedTerritory?.id;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTerritoryId(t.id);
                  setSelectedPinId(null);
                }}
                className={`h-11 px-3.5 flex items-center gap-2 text-xs font-semibold rounded-[12px] border transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-[#183A35] text-white border-[#183A35] shadow-xs'
                    : 'bg-[#FCFBF8] text-[#68716D] hover:text-[#17201E] border-[#DCDDD5]'
                }`}
              >
                <span>{t.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#DCDDD5]/60 text-[#17201E]'
                  }`}
                >
                  {t.code ? `T${t.code} · ` : ''}{count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TERRITORY SUMMARY: Compact, Subtle Context */}
      {selectedTerritory && (
        <div className="bg-[#FCFBF8] border border-[#DCDDD5] rounded-[16px] p-4 flex items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              {selectedTerritory.code && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B87545] bg-[#F5F3ED] px-1.5 py-0.5 rounded">
                  T{selectedTerritory.code}
                </span>
              )}
              <h2 className="font-display font-bold text-base text-[#17201E] truncate">
                {selectedTerritory.name}
              </h2>
            </div>

            {/* Derived Summary: X people · Y visited recently · Z mapped */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#68716D]">
              <span className="font-semibold text-[#183A35]">
                {territoryPeople.length} {territoryPeople.length === 1 ? 'person' : 'people'}
              </span>
              <span>·</span>
              <span>
                {recentlyVisitedCount} visited recently
              </span>
              <span>·</span>
              <span>
                {mappedPeople.length} mapped
              </span>
            </div>

            {(selectedTerritory.description || selectedTerritory.boundaryNotes) && (
              <p className="text-[11px] text-[#68716D] line-clamp-1 pt-0.5">
                {selectedTerritory.boundaryNotes || selectedTerritory.description}
              </p>
            )}
          </div>

          {/* Edit Territory action */}
          <button
            onClick={() => {
              setTerritoryToEdit(selectedTerritory);
              setIsAddModalOpen(true);
            }}
            className="p-2 text-[#68716D] hover:text-[#183A35] hover:bg-[#F5F3ED] rounded-[10px] transition-colors shrink-0"
            title="Edit territory details"
            aria-label="Edit territory"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. PRIMARY MAP CANVAS */}
      <div className="relative rounded-[20px] bg-[#DDE7E1]/40 border border-[#DCDDD5] overflow-hidden shadow-2xs h-84 sm:h-96 select-none">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater people={mappedPeople} />
          {mappedPeople.map((person) => (
            <Marker
              key={person.id}
              position={[person.location!.latitude, person.location!.longitude]}
              eventHandlers={{
                click: () => {
                  setSelectedPinId(person.id);
                  if (onPreviewPerson) {
                    onPreviewPerson(person);
                  } else {
                    onSelectPerson(person.id);
                  }
                },
              }}
            >
              <Popup>{person.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
        {/* EMPTY / UNMAPPED TERRITORY STATES */}
        {territoryPeople.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#FCFBF8]/75 backdrop-blur-2xs z-15">
            <div className="w-12 h-12 rounded-full bg-[#183A35]/10 flex items-center justify-center text-[#183A35]">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-[#17201E]">
                No Contacts Assigned Yet
              </h3>
              <p className="text-xs text-[#68716D] leading-relaxed">
                People assigned to this Territory will appear here when added to the field journal.
              </p>
            </div>

            {onOpenAddPerson && (
              <button
                onClick={() => onOpenAddPerson(selectedTerritory?.id)}
                className="h-10 px-4 flex items-center gap-1.5 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-95 rounded-[10px] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Person</span>
              </button>
            )}
          </div>
        ) : mappedPeople.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#FCFBF8]/80 backdrop-blur-2xs z-15">
            <div className="w-12 h-12 rounded-full bg-[#B87545]/10 flex items-center justify-center text-[#B87545]">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-[#17201E]">
                Map locations not set
              </h3>
              <p className="text-xs text-[#68716D] leading-relaxed">
                {territoryPeople.length} {territoryPeople.length === 1 ? 'person is' : 'people are'} assigned to this territory. Add a location to place them on the map.
              </p>
            </div>

            <button
              onClick={() => setShowPeopleList(true)}
              className="h-9 px-3.5 flex items-center gap-1.5 text-xs font-semibold text-[#183A35] bg-white border border-[#DCDDD5] hover:border-[#183A35] active:scale-95 rounded-[10px] transition-all shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-[#B87545]" />
              <span>Show people</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* 5. CONTEXTUAL PEOPLE DISCOVERY (Compact Contextual List, Not Large Directory) */}
      {territoryPeople.length > 0 && (
        <div className="space-y-2 pt-1">
          <button
            onClick={() => setShowPeopleList(!showPeopleList)}
            className="w-full flex items-center justify-between p-3 bg-[#FCFBF8] border border-[#DCDDD5] rounded-[14px] text-xs font-semibold text-[#183A35] hover:bg-[#F5F3ED] transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#B87545]" />
              <span>People in {selectedTerritory?.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F5F3ED] rounded border border-[#DCDDD5]">
                {territoryPeople.length}
              </span>
            </div>
            <span className="text-[11px] text-[#68716D] font-medium">
              {showPeopleList ? 'Hide list' : 'Show list'}
            </span>
          </button>

          {showPeopleList && (
            <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5] bg-[#FCFBF8] rounded-[14px] overflow-hidden">
              {territoryPeople.map((person) => {
                const isMapped = isValidCoordinate(person.location);

                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      if (onPreviewPerson) {
                        onPreviewPerson(person);
                      } else {
                        onSelectPerson(person.id);
                      }
                    }}
                    className="py-3 px-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F5F3ED] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <InitialsAvatar name={person.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-xs uppercase text-[#17201E] group-hover:text-[#183A35] truncate">
                            {person.name}
                          </span>
                          <StatusIndicator status={person.status} showText={false} />
                        </div>
                        <p className="text-[11px] text-[#68716D] truncate">
                          {person.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isMapped
                            ? 'bg-[#183A35]/10 text-[#183A35] font-semibold'
                            : 'bg-[#DCDDD5]/50 text-[#68716D]'
                        }`}
                      >
                        {isMapped ? 'Mapped' : 'Address only'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#68716D] group-hover:text-[#183A35]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT TERRITORY MODAL */}
      <AddTerritoryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTerritoryToEdit(null);
        }}
        territoryToEdit={territoryToEdit}
        onSave={(newTerr) => {
          onAddTerritory(newTerr);
        }}
        onUpdate={(tId, updates) => {
          if (onUpdateTerritory) {
            onUpdateTerritory(tId, updates);
          }
        }}
        onDelete={(tId) => {
          if (onDeleteTerritory) {
            onDeleteTerritory(tId);
            const remaining = territories.filter((t) => t.id !== tId);
            if (remaining.length > 0) {
              setSelectedTerritoryId(remaining[0].id);
            }
          }
        }}
      />
    </div>
  );
};
