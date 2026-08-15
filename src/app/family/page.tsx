"use client";

import React, { useState, useEffect } from "react";
import { Typography, Button, Card } from "@material-tailwind/react";
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UserPlusIcon,
  HomeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import {
  checkPasscode,
  hasActiveSession,
  clearSession,
  fetchFamilyMembers,
  saveFamilyMember,
  deleteFamilyMemberAPI,
} from "../../firebase/family.utils";
import {
  SecurityGate,
  MemberCard,
  FamilySearch,
  MemberDetailsModal,
  AddMemberModal,
  FocusedTreeView,
} from "../../components/family";
import FullTreeView from "../../components/family/full-tree-view";
import { exportTreeToPng } from "../../components/family/export-utils";
import { FamilyMember, PrefilledRelation } from "@/types";

export default function FamilyPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Genealogy Explorer States
  const [familyData, setFamilyData] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>("");
  const [startMemberId, setStartMemberId] = useState<string>("shubhanshu");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] =
    useState<FamilyMember | null>(null);

  // Add Member Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prefilledRelation, setPrefilledRelation] =
    useState<PrefilledRelation | null>(null);
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
        const storedId =
          typeof window !== "undefined"
            ? localStorage.getItem("family_tree_start_member_id")
            : null;

        let initialId = "";
        if (storedId && data.some((m) => m.id === storedId)) {
          initialId = storedId;
        } else if (
          data.some(
            (m) =>
              m.id === "shubhanshu" ||
              m.name.toLowerCase().includes("shubhanshu"),
          )
        ) {
          const shubhanshu = data.find(
            (m) =>
              m.id === "shubhanshu" ||
              m.name.toLowerCase().includes("shubhanshu"),
          );
          initialId = shubhanshu ? shubhanshu.id : data[0].id;
        } else {
          initialId = data[0].id;
        }

        setStartMemberId(initialId);
        setActiveMemberId(initialId);
      } else {
        setFamilyData([]);
        setActiveMemberId("");
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
    (m) => m.fatherId === activeMemberId || m.motherId === activeMemberId,
  );

  const siblings = familyData.filter(
    (m) =>
      m.id !== activeMemberId &&
      ((activeMember?.fatherId && m.fatherId === activeMember.fatherId) ||
        (activeMember?.motherId && m.motherId === activeMember.motherId)),
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

  const handleExportTree = async () => {
    if (!activeMember) return;
    try {
      setIsExporting(true);
      const filename = `${activeMember.name.replace(/\s+/g, "_")}_Family_Lineage.png`;
      await exportTreeToPng("focused-tree-canvas", filename);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const openDetails = (member: FamilyMember) => {
    setSelectedMemberForDetail(member);
    setIsDetailOpen(true);
  };

  // Add relative modal opening pre-fills
  const handleOpenAddRelation = (
    memberId: string,
    name: string,
    relationType: "father" | "mother" | "spouse" | "child" | "sibling",
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
    siblingLinkIds?: string[],
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

          // Auto-link Father and Mother as spouses if child already has a mother and neither has another spouse
          const childMember = familyData.find((m) => m.id === refId);
          if (childMember?.motherId) {
            const motherDoc = familyData.find((m) => m.id === childMember.motherId);
            const fatherDoc = familyData.find((m) => m.id === slugId) || memberData;
            if (motherDoc && !motherDoc.spouseId && !fatherDoc?.spouseId) {
              await saveFamilyMember(motherDoc.id, { spouseId: slugId });
              await saveFamilyMember(slugId, { spouseId: motherDoc.id });
            }
          }
        } else if (relType === "mother") {
          await saveFamilyMember(refId, { motherId: slugId });
          if (siblingLinkIds && siblingLinkIds.length > 0) {
            for (const sId of siblingLinkIds) {
              await saveFamilyMember(sId, { motherId: slugId });
            }
          }

          // Auto-link Father and Mother as spouses if child already has a father and neither has another spouse
          const childMember = familyData.find((m) => m.id === refId);
          if (childMember?.fatherId) {
            const fatherDoc = familyData.find((m) => m.id === childMember.fatherId);
            const motherDoc = familyData.find((m) => m.id === slugId) || memberData;
            if (fatherDoc && !fatherDoc.spouseId && !motherDoc?.spouseId) {
              await saveFamilyMember(fatherDoc.id, { spouseId: slugId });
              await saveFamilyMember(slugId, { spouseId: fatherDoc.id });
            }
          }
        } else if (relType === "spouse") {
          // Double link spouses to each other
          await saveFamilyMember(refId, { spouseId: slugId });
          await saveFamilyMember(slugId, { spouseId: refId });
          if (siblingLinkIds && siblingLinkIds.length > 0) {
            const focusMember = familyData.find((m) => m.id === refId);
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
          const parent = familyData.find((m) => m.id === refId);
          if (parent) {
            const updateObj: Partial<FamilyMember> = {};
            if (parent.gender === "female") {
              updateObj.motherId = refId;
              // If parent has a spouse and no fatherId is explicitly provided, link spouse as father
              if (parent.spouseId && !memberData.fatherId) {
                updateObj.fatherId = parent.spouseId;
              }
            } else {
              updateObj.fatherId = refId;
              // If parent has a spouse and no motherId is explicitly provided, link spouse as mother
              if (parent.spouseId && !memberData.motherId) {
                updateObj.motherId = parent.spouseId;
              }
            }
            await saveFamilyMember(slugId, updateObj);
          }
        } else if (relType === "sibling") {
          const active = familyData.find((m) => m.id === refId);
          const sibling = familyData.find((m) => m.id === slugId);
          if (active) {
            const fatherId =
              active.fatherId || (sibling ? sibling.fatherId : undefined);
            const motherId =
              active.motherId || (sibling ? sibling.motherId : undefined);

            if (fatherId || motherId) {
              const updateObj: Partial<FamilyMember> = {};
              if (fatherId) updateObj.fatherId = fatherId;
              if (motherId) updateObj.motherId = motherId;

              await saveFamilyMember(slugId, updateObj);
              await saveFamilyMember(active.id, updateObj);
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

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteFamilyMemberAPI(memberId, familyData);
      setIsDetailOpen(false);
      setIsAddOpen(false);
      await loadFamilyData();

      // If active member was deleted, navigate to start member or first remaining
      if (memberId === activeMemberId) {
        const remaining = familyData.filter((m) => m.id !== memberId);
        if (remaining.length > 0) {
          const nextId = remaining.some((m) => m.id === startMemberId)
            ? startMemberId
            : remaining[0].id;
          setActiveMemberId(nextId);
        } else {
          setActiveMemberId("");
        }
      }
    } catch (err) {
      console.error("Failed to delete member:", err);
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
        {/* Modern Responsive Header */}
        <header className="mb-8 border-b border-slate-200/80 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2.5">
                <Typography
                  variant="h2"
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight"
                  placeholder={undefined}
                >
                  Family Heritage
                </Typography>
                {familyData.length > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {familyData.length} {familyData.length === 1 ? "Member" : "Members"}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-sans">
                Explore family lineage, relations & history
              </p>
            </div>

            {/* Top Primary Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                size="sm"
                onClick={handleOpenAddNewMember}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl capitalize font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md px-3.5 sm:px-4 py-2 transition-all"
                placeholder={undefined}
              >
                <UserPlusIcon className="h-4 w-4" />
                <span>Add Member</span>
              </Button>

              <Button
                size="sm"
                variant="outlined"
                onClick={handleLogout}
                className="flex items-center gap-1.5 border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 rounded-xl capitalize font-bold text-xs sm:text-sm tracking-wide bg-white hover:bg-slate-50 transition-all px-3 py-2"
                placeholder={undefined}
                title="Lock / Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">Lock</span>
              </Button>
            </div>
          </div>

          {/* Search & Quick Nav Bar */}
          {familyData.length > 0 && (
            <div className="mt-5 flex items-center gap-2.5 max-w-lg">
              <FamilySearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                familyData={familyData}
                onMemberSelect={handleNavigateToMember}
                className="flex-1"
              />

              {activeMemberId !== startMemberId && (
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => handleNavigateToMember(startMemberId)}
                  className="shrink-0 flex items-center gap-1.5 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-2xl capitalize font-bold text-xs tracking-wide bg-white hover:bg-indigo-50/40 transition-all py-2.5 px-3 shadow-2xs"
                  placeholder={undefined}
                  title="Return to starting member"
                >
                  <HomeIcon className="h-4 w-4 text-indigo-500" />
                  <span className="hidden sm:inline">Start Member</span>
                </Button>
              )}
            </div>
          )}
        </header>

        {/* View Mode Toggle & Export Controls */}
        {familyData.length > 0 && (
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            {/* Quick Back Button (Only visible when user navigated deeper) */}
            {historyStack.length > 0 && (
              <button
                type="button"
                onClick={handleGoBack}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200/90 shadow-sm transition-all duration-150"
                title="Go back to previously focused member"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5 text-indigo-500" strokeWidth={2.5} />
                <span>Go Back</span>
              </button>
            )}

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

            {/* Focused View Download Picture Button */}
            {viewMode === "hourglass" && activeMember && (
              <button
                type="button"
                onClick={handleExportTree}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl bg-white hover:bg-indigo-50/50 text-slate-800 hover:text-indigo-600 border border-slate-200/90 shadow-sm transition-all duration-150 disabled:opacity-50"
                title="Download a picture of this family tree to save or share on WhatsApp"
              >
                <ArrowDownTrayIcon
                  className={`h-4 w-4 text-indigo-600 ${isExporting ? "animate-bounce" : ""}`}
                />
                <span>{isExporting ? "Saving Picture..." : "Download Family Photo"}</span>
              </button>
            )}
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
              Please add your first family member to begin building your
              interactive lineage tree explorer.
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
        {familyData.length > 0 &&
          activeMember &&
          viewMode === "hourglass" && (
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
        {familyData.length > 0 && viewMode === "full" && (
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
          onDelete={handleDeleteMember}
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
