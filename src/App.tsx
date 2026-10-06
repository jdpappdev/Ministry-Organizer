/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMinistryData, NewPersonInput, NewVisitInput, NewTerritoryInput } from './data/store';
import { NavigationTab, Person, Visit, Territory } from './types';
import { AppShell } from './components/layout/AppShell';
import { HomeView } from './components/home/HomeView';
import { PeopleView } from './components/people/PeopleView';
import { PersonProfileView } from './components/people/PersonProfileView';
import { TerritoriesView } from './components/territories/TerritoriesView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { GrowthView } from './components/growth/GrowthView';
import { ActivityView } from './components/activity/ActivityView';
import { AddPersonModal } from './components/people/AddPersonModal';
import { AddVisitModal } from './components/visits/AddVisitModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { PersonPreviewSheet } from './components/people/PersonPreviewSheet';
import { TerritoryPreviewSheet } from './components/territories/TerritoryPreviewSheet';

export default function App() {
  const {
    people,
    visits,
    territories,
    activities,
    userName,
    setUserDisplayName,
    getPerson,
    getTerritory,
    getVisitsForPerson,
    addPerson,
    updatePerson,
    deletePerson,
    addVisit,
    updateVisit,
    deleteVisit,
    addTerritory,
    updateTerritory,
    deleteTerritory,
    resetToDefault,
  } = useMinistryData();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activePersonId, setActivePersonId] = useState<string | null>(null);
  const [filterTerritoryId, setFilterTerritoryId] = useState<string>('all');

  // Bottom Sheet Preview State
  const [previewPerson, setPreviewPerson] = useState<Person | null>(null);
  const [previewTerritoryObject, setPreviewTerritoryObject] = useState<Territory | null>(null);

  // Modal dialog states
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isRecordVisitOpen, setIsRecordVisitOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPersonForAction, setSelectedPersonForAction] = useState<string | undefined>(undefined);

  // Subtle save confirmation toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3200);
  };

  // Quick navigation handlers
  const handleSelectPerson = (personId: string) => {
    setActivePersonId(personId);
    setCurrentTab('people');
    setPreviewPerson(null);
  };

  const handleSelectTerritory = (territoryId: string) => {
    setActivePersonId(null);
    setFilterTerritoryId(territoryId);
    setCurrentTab('territories');
  };

  const handleTabChange = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setPreviewPerson(null);
    if (tab !== 'people') {
      setActivePersonId(null);
    }
  };

  const handleAddPerson = (
    personInput: NewPersonInput,
    firstVisit?: Omit<NewVisitInput, 'personId'>
  ) => {
    const created = addPerson(personInput, firstVisit);
    showToast(`Registered ${created.name} to journal`);
    setActivePersonId(created.id);
    setCurrentTab('people');
  };

  const handleAddVisit = (visitInput: NewVisitInput) => {
    addVisit(visitInput);
    const person = getPerson(visitInput.personId);
    showToast(`Visit recorded for ${person?.name || 'contact'}`);
    setActivePersonId(visitInput.personId);
    setCurrentTab('people');
  };

  const handleUpdateVisit = (id: string, updates: Partial<Visit>) => {
    updateVisit(id, updates);
    showToast('Visit record updated');
  };

  const handleDeleteVisit = (id: string) => {
    deleteVisit(id);
    showToast('Historical visit removed');
  };

  const handleAddTerritory = (territoryInput: NewTerritoryInput) => {
    const created = addTerritory(territoryInput);
    showToast(`Territory ${created.name} created`);
    setFilterTerritoryId(created.id);
  };

  const handleUpdateTerritory = (id: string, updates: Partial<Territory>) => {
    updateTerritory(id, updates);
    showToast('Territory details updated');
  };

  const handleDeleteTerritory = (id: string) => {
    deleteTerritory(id);
    showToast('Territory removed, assigned contacts cleared');
    if (filterTerritoryId === id) {
      setFilterTerritoryId('all');
    }
  };

  // Determine active person if on profile
  const activePerson = activePersonId ? getPerson(activePersonId) : undefined;
  const activePersonTerritory = activePerson ? getTerritory(activePerson.territoryId) : undefined;
  const activePersonVisits = activePerson ? getVisitsForPerson(activePerson.id) : [];

  // Preview person helpers
  const previewTerritory = previewPerson ? getTerritory(previewPerson.territoryId) : undefined;
  const previewVisits = previewPerson ? getVisitsForPerson(previewPerson.id) : [];
  const previewLatestVisit = previewVisits[0];

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={handleTabChange}
      onOpenSearch={() => setIsSearchOpen((prev) => !prev)}
      onOpenAddPerson={() => {
        setSelectedPersonForAction(undefined);
        setIsAddPersonOpen(true);
      }}
      onOpenRecordVisit={() => {
        setSelectedPersonForAction(activePersonId || undefined);
        setIsRecordVisitOpen(true);
      }}
      userName={userName}
      onSaveName={(name) => {
        setUserDisplayName(name);
        showToast(name ? `Hello, ${name}` : 'Name updated');
      }}
    >
      {/* SUBTLE TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-[12px] bg-[#183A35] text-white text-xs font-semibold shadow-lg border border-white/15 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-[#B99A62]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HOME VIEW */}
      {currentTab === 'home' && (
        <HomeView
          people={people}
          visits={visits}
          territories={territories}
          onSelectPerson={handleSelectPerson}
          onSelectTerritory={handleSelectTerritory}
          onOpenAddPerson={() => {
            setSelectedPersonForAction(undefined);
            setIsAddPersonOpen(true);
          }}
          onOpenRecordVisit={() => {
            setSelectedPersonForAction(undefined);
            setIsRecordVisitOpen(true);
          }}
          onNavigateTab={handleTabChange}
          onPreviewPerson={(p) => setPreviewPerson(p)}
          userName={userName}
        />
      )}

      {/* PEOPLE VIEW (List or Profile) */}
      {currentTab === 'people' && (
        <>
          {activePerson ? (
            <PersonProfileView
              person={activePerson}
              territory={activePersonTerritory}
              territories={territories}
              visits={activePersonVisits}
              onBack={() => setActivePersonId(null)}
              onRecordVisit={handleAddVisit}
              onUpdateVisit={handleUpdateVisit}
              onDeleteVisit={handleDeleteVisit}
              onUpdatePerson={updatePerson}
              onDeletePerson={(id) => {
                deletePerson(id);
                showToast('Contact record removed');
                setActivePersonId(null);
              }}
              allPeople={people}
            />
          ) : (
            <PeopleView
              people={people}
              territories={territories}
              visits={visits}
              onSelectPerson={handleSelectPerson}
              onOpenAddPerson={() => {
                setSelectedPersonForAction(undefined);
                setIsAddPersonOpen(true);
              }}
              selectedTerritoryId={filterTerritoryId}
              onSelectTerritoryFilter={(tId) => setFilterTerritoryId(tId)}
              onPreviewPerson={(p) => setPreviewPerson(p)}
            />
          )}
        </>
      )}

      {/* TERRITORIES VIEW */}
      {currentTab === 'territories' && (
        <TerritoriesView
          territories={territories}
          people={people}
          visits={visits}
          onSelectPerson={handleSelectPerson}
          onAddTerritory={handleAddTerritory}
          onUpdateTerritory={handleUpdateTerritory}
          onDeleteTerritory={handleDeleteTerritory}
          initialSelectedTerritoryId={filterTerritoryId !== 'all' ? filterTerritoryId : undefined}
          onPreviewPerson={(p) => setPreviewPerson(p)}
          onOpenAddPerson={(tId) => {
            setSelectedPersonForAction(undefined);
            setFilterTerritoryId(tId || 'all');
            setIsAddPersonOpen(true);
          }}
        />
      )}

      {/* SCHEDULE VIEW (Derived 100% from visits) */}
      {currentTab === 'schedule' && (
        <ScheduleView
          people={people}
          visits={visits}
          territories={territories}
          onSelectPerson={handleSelectPerson}
          onUpdateVisit={handleUpdateVisit}
        />
      )}

      {/* GROWTH VIEW (Living Botanical Garden) */}
      {currentTab === 'growth' && (
        <GrowthView
          people={people}
          visits={visits}
          territories={territories}
          onSelectPerson={handleSelectPerson}
          onOpenAddPerson={() => {
            setSelectedPersonForAction(undefined);
            setIsAddPersonOpen(true);
          }}
          onRecordVisit={(pId) => {
            setSelectedPersonForAction(pId);
            setIsRecordVisitOpen(true);
          }}
        />
      )}

      {/* ACTIVITY VIEW */}
      {currentTab === 'activity' && (
        <ActivityView
          activities={activities}
          onSelectPerson={handleSelectPerson}
          onSelectTerritory={handleSelectTerritory}
        />
      )}

      {/* MOBILE FLOATING ACTION BUTTON (on Home and People list) */}
      {(currentTab === 'home' || (currentTab === 'people' && !activePersonId)) && (
        <FloatingActionButton
          onAddPerson={() => {
            setSelectedPersonForAction(undefined);
            setIsAddPersonOpen(true);
          }}
          onRecordVisit={() => {
            setSelectedPersonForAction(undefined);
            setIsRecordVisitOpen(true);
          }}
          onScheduleVisit={() => {
            setSelectedPersonForAction(undefined);
            setIsRecordVisitOpen(true);
          }}
        />
      )}

      {/* BOTTOM SHEET ENTITY PEEKS */}
      <PersonPreviewSheet
        person={previewPerson}
        territory={previewTerritory}
        latestVisit={previewLatestVisit}
        isOpen={Boolean(previewPerson)}
        onClose={() => setPreviewPerson(null)}
        onViewProfile={(pId) => handleSelectPerson(pId)}
        onRecordVisit={(pId) => {
          setSelectedPersonForAction(pId);
          setIsRecordVisitOpen(true);
        }}
      />

      <TerritoryPreviewSheet
        territory={previewTerritoryObject}
        peopleCount={
          previewTerritoryObject
            ? people.filter((p) => p.territoryId === previewTerritoryObject.id).length
            : 0
        }
        mappedCount={
          previewTerritoryObject
            ? people.filter(
                (p) =>
                  p.territoryId === previewTerritoryObject.id &&
                  p.location != null &&
                  typeof p.location.latitude === 'number' &&
                  typeof p.location.longitude === 'number' &&
                  isFinite(p.location.latitude) &&
                  isFinite(p.location.longitude)
              ).length
            : 0
        }
        isOpen={Boolean(previewTerritoryObject)}
        onClose={() => setPreviewTerritoryObject(null)}
        onOpenTerritory={(tId) => handleSelectTerritory(tId)}
      />

      {/* GLOBAL MODALS */}
      <AddPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        territories={territories}
        onSave={handleAddPerson}
        initialTerritoryId={filterTerritoryId !== 'all' ? filterTerritoryId : undefined}
      />

      <AddVisitModal
        isOpen={isRecordVisitOpen}
        onClose={() => {
          setIsRecordVisitOpen(false);
          setSelectedPersonForAction(undefined);
        }}
        people={people}
        selectedPersonId={selectedPersonForAction || activePersonId || undefined}
        onSave={handleAddVisit}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        people={people}
        visits={visits}
        territories={territories}
        onSelectPerson={handleSelectPerson}
        onSelectTerritory={handleSelectTerritory}
      />
    </AppShell>
  );
}
