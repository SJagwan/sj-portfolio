"use client";

import React, { useState, useEffect } from "react";
import { Typography, Button, Card } from "@material-tailwind/react";
import { ArrowRightOnRectangleIcon, ArrowLeftIcon, CheckCircleIcon, UserPlusIcon, PlusIcon, HomeIcon, StarIcon } from "@heroicons/react/24/solid";
import { checkPasscode, hasActiveSession, clearSession, fetchFamilyMembers, saveFamilyMember } from "../../firebase/family.utils";
import {
  SecurityGate,
  MemberCard,
  FamilySearch,
  MemberDetailsModal,
  AddMemberModal,
  FocusedTreeView
} from "../../components/family";
import FullTreeView from "../../components/family/full-tree-view";

interface FamilyMember {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  bio?: string;
  photoUrl?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
}

interface PrefilledRelation {
  memberId: string;
  memberName: string;
  relationType: "father" | "mother" | "spouse" | "child" | "sibling";
}

export default function FamilyPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Genealogy Explorer States
  const [familyData, setFamilyData] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>("");
  const [startMemberId, setStartMemberId] = useState<string>("shubhanshu");
  const [showStartSelector, setShowStartSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<FamilyMember | null>(null);
  
  // Add Member Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prefilledRelation, setPrefilledRelation] = useState<PrefilledRelation | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [viewMode, setViewMode] = useState<"hourglass" | "full">("hourglass");

  // Navigation Trail Stack
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  // Check for active session on mount & load family data
  useEffect(() => {
    const authenticated = hasActiveSession();
    setIsAuthenticated(authenticated);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("family_tree_start_member_id");
      if (stored) {
        setStartMemberId(stored);
      }
    }
    if (authenticated) {
      loadFamilyData();
    }
  }, []);

  const loadFamilyData = async () => {
    try {
      const data = await fetchFamilyMembers();
      if (data && data.length > 0) {
        setFamilyData(data);
        const storedId = typeof window !== "undefined" ? localStorage.getItem("family_tree_start_member_id") : null;
        if (storedId && data.some(m => m.id === storedId)) {
          setStartMemberId(storedId);
          setActiveMemberId(storedId);
          setShowStartSelector(false);
        } else {
          setShowStartSelector(true);
        }
      } else {
        setFamilyData([]);
        setActiveMemberId("");
        setShowStartSelector(false);
      }
    } catch (err) {
      console.warn("Firestore fetch failed:", err);
      setFamilyData([]);
      setActiveMemberId("");
    }
  };

  const handleSetAsStartMember = (memberId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("family_tree_start_member_id", memberId);
      setStartMemberId(memberId);
    }
  };

  const handleSelectStartMemberInitial = (memberId: string) => {
    handleSetAsStartMember(memberId);
    setActiveMemberId(memberId);
    setShowStartSelector(false);
    setSearchQuery("");
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg("Please enter a passcode.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const isValid = await checkPasscode(passcode);
      if (isValid) {
        setIsAuthenticated(true);
        setPasscode("");
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("family_tree_start_member_id");
          if (stored) {
            setStartMemberId(stored);
          }
        }
        loadFamilyData();
      } else {
        setErrorMsg("Incorrect passcode. Access denied.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setFamilyData([]);
    setHistoryStack([]);
  };

  // Find related members dynamically
  const activeMember = familyData.find((m) => m.id === activeMemberId);
  const father = familyData.find((m) => m.id === activeMember?.fatherId);
  const mother = familyData.find((m) => m.id === activeMember?.motherId);
  const spouse = familyData.find((m) => m.id === activeMember?.spouseId);
  
  const children = familyData.filter(
    (m) => m.fatherId === activeMemberId || m.motherId === activeMemberId
  );

  const siblings = familyData.filter(
    (m) =>
      m.id !== activeMemberId &&
      ((activeMember?.fatherId && m.fatherId === activeMember.fatherId) ||
       (activeMember?.motherId && m.motherId === activeMember.motherId))
  );

  // Navigation handlers
  const handleNavigateToMember = (id: string) => {
    if (id === activeMemberId) return;
    setHistoryStack((prev) => [...prev, activeMemberId]);
    setActiveMemberId(id);
    setSearchQuery("");
  };

  const handleGoBack = () => {
    if (historyStack.length === 0) return;
    const newStack = [...historyStack];
    const prevId = newStack.pop();
    setHistoryStack(newStack);
    if (prevId) {
      setActiveMemberId(prevId);
    }
  };

  const handleTrailClick = (id: string, index: number) => {
    const newStack = historyStack.slice(0, index);
    setHistoryStack(newStack);
    setActiveMemberId(id);
  };

  const openDetails = (member: FamilyMember) => {
    setSelectedMemberForDetail(member);
    setIsDetailOpen(true);
  };

  // Add relative modal opening pre-fills
  const handleOpenAddRelation = (
    memberId: string,
    name: string,
    relationType: "father" | "mother" | "spouse" | "child" | "sibling"
  ) => {
    setPrefilledRelation({ memberId, memberName: name, relationType });
    setMemberToEdit(null);
    setIsAddOpen(true);
  };

  const handleOpenAddNewMember = () => {
    setPrefilledRelation(null);
    setMemberToEdit(null);
    setIsAddOpen(true);
  };

  const handleOpenEditMember = (member: FamilyMember) => {
    setPrefilledRelation(null);
    setMemberToEdit(member);
    setIsDetailOpen(false);
    setIsAddOpen(true);
  };

  const handleAddMemberSubmit = async (
    slugId: string,
    memberData: Partial<FamilyMember>,
    relationshipLink?: PrefilledRelation,
    isEdit?: boolean,
    siblingLinkIds?: string[]
  ) => {
    try {
      // 1. Save or update member record to database
      if (Object.keys(memberData).length > 0) {
        await saveFamilyMember(slugId, memberData);
      }

      // 2. If relationship context is pre-filled, update the links
      if (relationshipLink) {
        const refId = relationshipLink.memberId;
        const relType = relationshipLink.relationType;

        if (relType === "father") {
          await saveFamilyMember(refId, { fatherId: slugId });
          if (siblingLinkIds && siblingLinkIds.length > 0) {
            for (const sId of siblingLinkIds) {
              await saveFamilyMember(sId, { fatherId: slugId });
            }
          }
        } else if (relType === "mother") {
          await saveFamilyMember(refId, { motherId: slugId });
          if (siblingLinkIds && siblingLinkIds.length > 0) {
            for (const sId of siblingLinkIds) {
              await saveFamilyMember(sId, { motherId: slugId });
            }
          }
        } else if (relType === "spouse") {
          // Double link spouses to each other
          await saveFamilyMember(refId, { spouseId: slugId });
          await saveFamilyMember(slugId, { spouseId: refId });
          if (siblingLinkIds && siblingLinkIds.length > 0) {
            const focusMember = familyData.find(m => m.id === refId);
            const parentGender = focusMember?.gender;
            for (const cId of siblingLinkIds) {
              if (parentGender === "male") {
                // The new spouse is female, so she is the mother of the children
                await saveFamilyMember(cId, { motherId: slugId });
              } else if (parentGender === "female") {
                // The new spouse is male, so he is the father of the children
                await saveFamilyMember(cId, { fatherId: slugId });
              }
            }
          }
        } else if (relType === "child") {
          const parent = familyData.find(m => m.id === refId);
          if (parent) {
            const updateObj: Partial<FamilyMember> = {};
            if (parent.gender === "female") {
              updateObj.motherId = refId;
            } else {
              updateObj.fatherId = refId;
            }
            await saveFamilyMember(slugId, updateObj);
          }
        } else if (relType === "sibling") {
          const active = familyData.find(m => m.id === refId);
          const sibling = familyData.find(m => m.id === slugId);
          if (active) {
            const fatherId = active.fatherId || (sibling ? sibling.fatherId : undefined);
            const motherId = active.motherId || (sibling ? sibling.motherId : undefined);

            if (fatherId || motherId) {
              const updateObj: Partial<FamilyMember> = {};
              if (fatherId) updateObj.fatherId = fatherId;
              if (motherId) updateObj.motherId = motherId;
              
              await saveFamilyMember(slugId, updateObj);
              await saveFamilyMember(active.id, updateObj);
            } else {
              // Self-healing: create a placeholder father to establish relation link
              const placeholderFatherId = `father-of-${active.id}`;
              await saveFamilyMember(placeholderFatherId, {
                name: `Father of ${active.name}`,
                gender: "male"
              });
              await saveFamilyMember(active.id, { fatherId: placeholderFatherId });
              await saveFamilyMember(slugId, { fatherId: placeholderFatherId });
            }
          }
        }
      }

      // 3. If editing, handle reciprocal relationship changes (like spouse links)
      if (isEdit) {
        const original = familyData.find((m) => m.id === slugId);
        if (original) {
          const oldSpouseId = original.spouseId;
          const newSpouseId = memberData.spouseId;
          if (newSpouseId !== oldSpouseId) {
            if (oldSpouseId) {
              // Clear old spouse's link
              await saveFamilyMember(oldSpouseId, { spouseId: "" });
            }
            if (newSpouseId) {
              // Link new spouse reciprocally
              await saveFamilyMember(newSpouseId, { spouseId: slugId });
            }
          }
        }
      }

      // 4. Reload from Firestore and refocus the member
      const isFirstMember = familyData.length === 0;
      await loadFamilyData();
      setActiveMemberId(slugId);
      if (isFirstMember) {
        handleSetAsStartMember(slugId);
      }
    } catch (err) {
      console.error("Failed to save and link member:", err);
      throw err;
    }
  };

  // Prevent flicker during initial session checks
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Security Gate Full-Screen View
  if (!isAuthenticated) {
    return (
      <SecurityGate
        passcode={passcode}
        setPasscode={setPasscode}
        handleUnlock={handleUnlock}
        isLoading={isLoading}
        errorMsg={errorMsg}
      />
    );
  }

  // Genealogy Explorer Dashboard
  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 relative bg-slate-50 text-slate-800">
      {/* Background radial glows and dotted mesh */}
      <div className="absolute inset-0 bg-image bg-size pointer-events-none opacity-40" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200/80 pb-6">
          <div>
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading tracking-tight"
              placeholder={undefined}
            >
              Heritage Archive
            </Typography>
            <Typography className="text-slate-500 font-sans text-sm mt-1" placeholder={undefined}>
              Private genealogy record index & relative explorer
            </Typography>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {familyData.length > 0 && !showStartSelector && (
              <FamilySearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                familyData={familyData}
                onMemberSelect={handleNavigateToMember}
              />
            )}

            {familyData.length > 0 && !showStartSelector && activeMemberId !== startMemberId && (
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleNavigateToMember(startMemberId)}
                className="flex items-center gap-1.5 border-slate-300 hover:border-slate-800 text-slate-600 hover:text-slate-900 rounded-xl capitalize font-bold text-sm tracking-wide bg-white hover:bg-slate-50 transition-all duration-150 py-2"
                placeholder={undefined}
                title="Return to starting family member"
              >
                <HomeIcon className="h-4 w-4 text-indigo-500" />
                Go to Start Member
              </Button>
            )}

            {!showStartSelector && (
              <Button
                size="sm"
                onClick={handleOpenAddNewMember}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl capitalize font-bold text-sm tracking-wide shadow-md px-4 py-2 transition-all"
                placeholder={undefined}
              >
                <UserPlusIcon className="h-4 w-4" />
                Add Member
              </Button>
            )}

            <Button
              size="sm"
              variant="outlined"
              onClick={handleLogout}
              className="flex items-center gap-2 border-slate-300 hover:border-slate-800 text-slate-600 hover:text-slate-900 rounded-xl capitalize font-bold text-sm tracking-wide bg-white hover:bg-slate-50 transition-all duration-150"
              placeholder={undefined}
            >
              Lock
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Trail Breadcrumbs & Back Button Controls */}
        {historyStack.length > 0 && (
          <div className="flex items-center justify-between gap-4 mb-10 flex-wrap bg-white/40 border border-slate-200/50 p-3 rounded-2xl backdrop-blur-sm">
            {/* Clickable Trail */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium font-sans">
              <button
                onClick={() => handleTrailClick(familyData[0]?.id || "", 0)}
                className="hover:text-indigo-600 transition-colors duration-150 font-bold uppercase tracking-wider text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md"
              >
                Root
              </button>
              <span className="text-slate-300 font-normal">→</span>
              
              {historyStack.map((id, index) => {
                const member = familyData.find(m => m.id === id);
                if (!member) return null;
                return (
                  <React.Fragment key={id}>
                    <button
                      onClick={() => handleTrailClick(id, index)}
                      className="hover:text-indigo-600 transition-colors duration-150"
                    >
                      {member.name}
                    </button>
                    <span className="text-slate-300 font-normal">→</span>
                  </React.Fragment>
                );
              })}
              {activeMember && (
                <span className="text-slate-900 font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                  {activeMember.name}
                </span>
              )}
            </div>

            {/* Quick Back Controller */}
            <Button
              size="sm"
              variant="text"
              onClick={handleGoBack}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold capitalize text-xs tracking-wide p-1.5"
              placeholder={undefined}
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={2} />
              Go Back
            </Button>
          </div>
        )}

        {/* View Mode Toggle Segmented Control */}
        {familyData.length > 0 && !showStartSelector && (
          <div className="flex justify-center mb-8">
            <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-300/10">
              <button
                type="button"
                onClick={() => setViewMode("hourglass")}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
                  viewMode === "hourglass"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-250/30"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Focused View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("full")}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
                  viewMode === "full"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-250/30"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Full Family Tree
              </button>
            </div>
          </div>
        )}

        {/* Onboarding Start Member Selector Screen */}
        {familyData.length > 0 && showStartSelector && (
          <div className="flex justify-center items-center py-20 px-4">
            <Card
              className="p-8 md:p-12 border border-slate-200/60 bg-white/90 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center max-w-lg w-full rounded-[32px] relative overflow-visible"
              placeholder={undefined}
            >
              {/* Subtle background glow decorator */}
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-100 rounded-full blur-3xl pointer-events-none opacity-60" />
              <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-pink-100 rounded-full blur-3xl pointer-events-none opacity-60" />

              <div className="h-20 w-20 mb-6 flex items-center justify-center rounded-3xl bg-indigo-50/80 border border-indigo-100/50 text-indigo-600 shadow-inner relative z-10">
                <StarIcon className="h-10 w-10 text-indigo-500 drop-shadow-sm animate-pulse" />
              </div>

              <Typography
                variant="h4"
                className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading mb-3 tracking-tight relative z-10"
                placeholder={undefined}
              >
                Set Starting Point
              </Typography>
              <Typography
                className="text-slate-500 font-normal leading-relaxed text-sm max-w-sm mb-8 font-sans relative z-10"
                placeholder={undefined}
              >
                Choose the initial member to center your family tree around. Search by name to begin.
              </Typography>

              {/* Search bar autocomplete area */}
              <div className="w-full relative z-50">
                <FamilySearch
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  familyData={familyData}
                  onMemberSelect={handleSelectStartMemberInitial}
                  className="w-full"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Empty State Banner when Firestore collection is empty */}
        {familyData.length === 0 && (
          <Card
            className="p-8 border border-slate-200/60 bg-white shadow-sm flex flex-col items-center justify-center text-center py-20 rounded-3xl"
            placeholder={undefined}
          >
            <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100/30 text-indigo-600">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <Typography
              variant="h4"
              className="text-2xl font-bold text-slate-900 font-heading mb-3"
              placeholder={undefined}
            >
              Heritage Archive is Empty
            </Typography>
            <Typography
              className="text-slate-500 font-normal leading-relaxed text-base font-sans max-w-md mb-8"
              placeholder={undefined}
            >
              Please add your first family member to begin building your interactive lineage tree explorer.
            </Typography>
            <Button
              size="md"
              onClick={handleOpenAddNewMember}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl capitalize font-bold text-sm tracking-wide shadow-md px-6 py-3 transition-all"
              placeholder={undefined}
            >
              <UserPlusIcon className="h-4 w-4" />
              Add First Member
            </Button>
          </Card>
        )}

        {/* Dynamic Pedigree Explorer Layout Canvas */}
        {familyData.length > 0 && activeMember && viewMode === "hourglass" && !showStartSelector && (
          <FocusedTreeView
            activeMember={activeMember}
            father={father}
            mother={mother}
            spouse={spouse}
            siblings={siblings}
            childrenList={children}
            onNavigateToMember={handleNavigateToMember}
            onAddRelation={handleOpenAddRelation}
            onViewDetails={openDetails}
          />
        )}

        {/* Full Family Tree View (View-Only) */}
        {familyData.length > 0 && viewMode === "full" && !showStartSelector && (
          <FullTreeView
            familyData={familyData}
            activeMemberId={activeMemberId}
            onSelectMember={(memberId) => {
              handleNavigateToMember(memberId);
              setViewMode("hourglass");
            }}
          />
        )}

        {/* Member Details Popup Modal Dialog */}
        <MemberDetailsModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          member={selectedMemberForDetail}
          onEdit={handleOpenEditMember}
        />

        {/* Add Family Member Modal */}
        <AddMemberModal
          isOpen={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            setMemberToEdit(null);
          }}
          onSubmit={handleAddMemberSubmit}
          existingMembers={familyData}
          prefilledRelation={prefilledRelation}
          memberToEdit={memberToEdit}
        />
      </div>
    </div>
  );
}
