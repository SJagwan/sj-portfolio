"use client";

import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  HomeIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import {
  getActiveSession,
  clearSession,
  checkPasscode,
  fetchFamilyMembers,
  saveFamilyMember,
  deleteFamilyMemberAPI,
} from "../../firebase/family.utils";
import {
  SecurityGate,
  FamilySearch,
  MemberDetailsModal,
  AddMemberModal,
  FocusedTreeView,
  AdminUnlockModal,
} from "../../components/family";
import FullTreeView from "../../components/family/full-tree-view";
import { exportTreeToPng } from "../../components/family/export-utils";
import { FamilyMember, PrefilledRelation } from "@/types";

export default function FamilyPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [familyData, setFamilyData] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>("");
  const [startMemberId, setStartMemberId] = useState<string>("shubhanshu");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] =
    useState<FamilyMember | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prefilledRelation, setPrefilledRelation] =
    useState<PrefilledRelation | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [viewMode, setViewMode] = useState<"hourglass" | "full">("hourglass");

  const [historyStack, setHistoryStack] = useState<string[]>([]);

  useEffect(() => {
    const session = getActiveSession();
    setIsAuthenticated(session.isAuthenticated);
    setIsAdmin(session.isAdmin);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("family_tree_start_member_id");
      if (stored) {
        setStartMemberId(stored);
      }
    }
    if (session.isAuthenticated) {
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
      const result = await checkPasscode(passcode);
      if (result.isValid) {
        setIsAuthenticated(true);
        setIsAdmin(result.role === "admin");
        setPasscode("");
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
    setIsAdmin(false);
    setFamilyData([]);
  };

  const handleNavigateToMember = (id: string) => {
    if (id !== activeMemberId) {
      setHistoryStack((prev) => [...prev, activeMemberId]);
      setActiveMemberId(id);
    }
  };

  const handleGoBack = () => {
    if (historyStack.length > 0) {
      const prevId = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, prev.length - 1));
      setActiveMemberId(prevId);
    }
  };

  const handleOpenMemberDetail = (member: FamilyMember) => {
    setSelectedMemberForDetail(member);
    setIsDetailOpen(true);
  };

  const handleOpenAddRelation = (
    refId: string,
    refName: string,
    relType: PrefilledRelation["relationType"],
  ) => {
    if (!isAdmin) {
      setIsUnlockModalOpen(true);
      return;
    }
    setPrefilledRelation({
      memberId: refId,
      memberName: refName,
      relationType: relType,
    });
    setMemberToEdit(null);
    setIsAddOpen(true);
  };

  const handleOpenAddNewMember = () => {
    if (!isAdmin) {
      setIsUnlockModalOpen(true);
      return;
    }
    setPrefilledRelation(null);
    setMemberToEdit(null);
    setIsAddOpen(true);
  };

  const handleOpenEditMember = (member: FamilyMember) => {
    if (!isAdmin) {
      setIsUnlockModalOpen(true);
      return;
    }
    setMemberToEdit(member);
    setPrefilledRelation(null);
    setIsDetailOpen(false);
    setIsAddOpen(true);
  };

  const handleSaveMemberAndLink = async (
    slugId: string,
    memberData: Partial<FamilyMember>,
    relationshipLink?: PrefilledRelation | null,
    isEdit?: boolean,
    siblingLinkIds?: string[],
  ) => {
    try {
      if (Object.keys(memberData).length > 0) {
        await saveFamilyMember(slugId, memberData);
      }

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
          await saveFamilyMember(refId, { spouseId: slugId });
          await saveFamilyMember(slugId, { spouseId: refId });
          if (siblingLinkIds && siblingLinkIds.length > 0) {
            const focusMember = familyData.find((m) => m.id === refId);
            const parentGender = focusMember?.gender;
            for (const cId of siblingLinkIds) {
              if (parentGender === "male") {
                await saveFamilyMember(cId, { motherId: slugId });
              } else if (parentGender === "female") {
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
              if (parent.spouseId && !memberData.fatherId) {
                updateObj.fatherId = parent.spouseId;
              }
            } else {
              updateObj.fatherId = refId;
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

      if (isEdit) {
        const original = familyData.find((m) => m.id === slugId);
        if (original) {
          const oldSpouseId = original.spouseId;
          const newSpouseId = memberData.spouseId;
          if (newSpouseId !== oldSpouseId) {
            if (oldSpouseId) {
              await saveFamilyMember(oldSpouseId, { spouseId: "" });
            }
            if (newSpouseId) {
              await saveFamilyMember(newSpouseId, { spouseId: slugId });
            }
          }
        }
      }

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

  const activeMember = familyData.find((m) => m.id === activeMemberId);
  const father = activeMember?.fatherId
    ? familyData.find((m) => m.id === activeMember.fatherId)
    : undefined;
  const mother = activeMember?.motherId
    ? familyData.find((m) => m.id === activeMember.motherId)
    : undefined;
  const spouse = activeMember?.spouseId
    ? familyData.find((m) => m.id === activeMember.spouseId)
    : undefined;

  const siblings = familyData.filter((m) => {
    if (!activeMember || m.id === activeMember.id) return false;
    const hasSameFather =
      activeMember.fatherId && m.fatherId === activeMember.fatherId;
    const hasSameMother =
      activeMember.motherId && m.motherId === activeMember.motherId;
    return hasSameFather || hasSameMother;
  });

  const childrenList = familyData.filter((m) => {
    if (!activeMember) return false;
    return m.fatherId === activeMember.id || m.motherId === activeMember.id;
  });

  const handleExportTree = async () => {
    if (!activeMember) return;
    try {
      setIsExporting(true);
      const canvasId = viewMode === "full" ? "full-tree-canvas" : "focused-tree-canvas";
      const fileName =
        viewMode === "full"
          ? "family-tree-full.png"
          : `${activeMember.name.toLowerCase().replace(/\s+/g, "-")}-family-tree.png`;
      await exportTreeToPng(canvasId, fileName);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <Typography className="text-sm font-bold text-slate-400 font-sans tracking-wide" placeholder={undefined}>
            Checking Access...
          </Typography>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-white text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <header className="mb-6 border-b border-slate-200/80 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Typography
                  variant="h2"
                  className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-heading"
                  placeholder={undefined}
                >
                  Jagwan Family Tree
                </Typography>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {familyData.length} Members
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3 text-emerald-500" />
                    Admin Mode
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-sans">
                Explore family lineage, relations & history
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {isAdmin ? (
                <>
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
                    title="Lock Admin Edit Mode"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 text-slate-500" />
                    <span>Lock</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl capitalize font-bold text-xs sm:text-sm tracking-wide shadow-sm px-3.5 py-2 transition-all"
                  placeholder={undefined}
                  title="Unlock Admin Edit Mode"
                >
                  <LockClosedIcon className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Admin Edit</span>
                </Button>
              )}
            </div>
          </div>

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

        {familyData.length > 0 && (
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
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

            {activeMember && (
              <button
                type="button"
                onClick={handleExportTree}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl bg-white hover:bg-indigo-50/50 text-slate-800 hover:text-indigo-600 border border-slate-200/90 shadow-sm transition-all duration-150 disabled:opacity-50"
                title="Download a picture of this family tree to save or share on WhatsApp"
              >
                <ArrowDownTrayIcon
                  className={`h-4 w-4 text-indigo-500 ${
                    isExporting ? "animate-bounce" : ""
                  }`}
                />
                <span className="font-semibold">
                  {isExporting ? "Generating Photo..." : "Save Tree Photo"}
                </span>
              </button>
            )}
          </div>
        )}

        {familyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg mx-auto mt-10">
            <Typography
              variant="h4"
              className="text-slate-800 font-extrabold font-heading mb-2"
              placeholder={undefined}
            >
              Family Records Empty
            </Typography>
            <Typography
              className="text-slate-500 text-sm font-normal mb-6"
              placeholder={undefined}
            >
              No family records found. Unlock Admin mode to record the root patriarch/matriarch.
            </Typography>
            <Button
              onClick={() => (isAdmin ? handleOpenAddNewMember() : setIsUnlockModalOpen(true))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl capitalize font-bold text-sm tracking-wide px-6 py-3 shadow-md"
              placeholder={undefined}
            >
              {isAdmin ? "Add Root Member" : "Unlock Admin Edit"}
            </Button>
          </div>
        ) : viewMode === "full" ? (
          <FullTreeView
            familyData={familyData}
            activeMemberId={activeMemberId}
            onSelectMember={handleNavigateToMember}
            onViewDetails={handleOpenMemberDetail}
          />
        ) : activeMember ? (
          <FocusedTreeView
            activeMember={activeMember}
            father={father}
            mother={mother}
            spouse={spouse}
            siblings={siblings}
            childrenList={childrenList}
            onNavigateToMember={handleNavigateToMember}
            onAddRelation={handleOpenAddRelation}
            onViewDetails={handleOpenMemberDetail}
            canEdit={isAdmin}
          />
        ) : null}
      </div>

      <MemberDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        member={selectedMemberForDetail}
        onEdit={handleOpenEditMember}
        onDelete={handleDeleteMember}
        canEdit={isAdmin}
      />

      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        prefilledRelation={prefilledRelation}
        memberToEdit={memberToEdit}
        existingMembers={familyData}
        onSubmit={handleSaveMemberAndLink}
      />

      <AdminUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}
