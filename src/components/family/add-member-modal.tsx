"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Typography, Dialog, DialogBody, Button } from "@material-tailwind/react";
import { UserPlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FamilyMember, PrefilledRelation, getDescendants, getAncestors, generateUniqueSlug } from "./utils";
import LinkMemberForm from "./link-member-form";
import CreateMemberForm from "./create-member-form";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    slugId: string,
    memberData: Partial<FamilyMember>,
    relationshipLink?: PrefilledRelation,
    isEdit?: boolean,
    siblingLinkIds?: string[]
  ) => Promise<void>;
  existingMembers: FamilyMember[];
  prefilledRelation: PrefilledRelation | null;
  memberToEdit?: FamilyMember | null;
}

export function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  existingMembers,
  prefilledRelation,
  memberToEdit = null,
}: AddMemberModalProps) {
  const [formMode, setFormMode] = useState<"create" | "link">("create");
  const [selectedLinkMemberIds, setSelectedLinkMemberIds] = useState<string[]>([]);
  const [selectedLinkRelatives, setSelectedLinkRelatives] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [bio, setBio] = useState("");

  // Relational IDs
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
  const [spouseId, setSpouseId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill form based on relationship context
  useEffect(() => {
    if (isOpen) {
      setSelectedLinkMemberIds([]);
      setSelectedLinkRelatives([]);

      if (memberToEdit) {
        setFormMode("create");
        setName(memberToEdit.name || "");
        setGender(memberToEdit.gender || "male");
        setBirthDate(memberToEdit.birthDate || "");
        setDeathDate(memberToEdit.deathDate || "");
        setBirthPlace(memberToEdit.birthPlace || "");
        setBio(memberToEdit.bio || "");
        setErrorMsg("");
        setFatherId(memberToEdit.fatherId || "");
        setMotherId(memberToEdit.motherId || "");
        setSpouseId(memberToEdit.spouseId || "");
      } else {
        setFormMode("create");
        setName("");
        setBirthDate("");
        setDeathDate("");
        setBirthPlace("");
        setBio("");
        setErrorMsg("");

        // Default selects
        setFatherId("");
        setMotherId("");
        setSpouseId("");

        if (prefilledRelation) {
          // Initialize checkbox states for parent or spouse confirmation prompts
          if (prefilledRelation.relationType === "father" || prefilledRelation.relationType === "mother") {
            const target = existingMembers.find(m => m.id === prefilledRelation.memberId);
            const sOptions = target
              ? existingMembers.filter(m =>
                  m.id !== target.id &&
                  ((target.fatherId && m.fatherId === target.fatherId) ||
                   (target.motherId && m.motherId === target.motherId))
                )
              : [];
            setSelectedLinkRelatives(sOptions.map(s => s.id));
          } else if (prefilledRelation.relationType === "spouse") {
            const cOptions = existingMembers.filter(m =>
              m.fatherId === prefilledRelation.memberId || m.motherId === prefilledRelation.memberId
            );
            setSelectedLinkRelatives(cOptions.map(c => c.id));
          }

          if (prefilledRelation.relationType === "father") {
            setGender("male");
          } else if (prefilledRelation.relationType === "mother") {
            setGender("female");
          } else if (prefilledRelation.relationType === "spouse") {
            const spouse = existingMembers.find((m) => m.id === prefilledRelation.memberId);
            if (spouse) {
              setGender(spouse.gender === "male" ? "female" : "male");
            } else {
              setGender("female");
            }
            setSpouseId(prefilledRelation.memberId);
          } else if (prefilledRelation.relationType === "child") {
            const parent = existingMembers.find((m) => m.id === prefilledRelation.memberId);
            if (parent) {
              if (parent.gender === "male") {
                setFatherId(parent.id);
              } else {
                setMotherId(parent.id);
              }
            }
          } else if (prefilledRelation.relationType === "sibling") {
            const active = existingMembers.find((m) => m.id === prefilledRelation.memberId);
            if (active) {
              setFatherId(active.fatherId || "");
              setMotherId(active.motherId || "");
            }
          }
        } else {
          setGender("male");
        }
      }
    }
  }, [isOpen, prefilledRelation, existingMembers, memberToEdit]);

  // Compute eligible link members with useMemo
  const eligibleLinkMembers = useMemo(() => {
    if (!prefilledRelation) return [];
    const relationType = prefilledRelation.relationType;
    const memberId = prefilledRelation.memberId;

    const descendants = getDescendants(memberId, existingMembers);
    const ancestors = getAncestors(memberId, existingMembers);
    const current = existingMembers.find((m) => m.id === memberId);

    // Filter out:
    // 1. The member themselves
    // 2. Any descendants (cannot be parents, spouses, or siblings)
    // 3. Any ancestors (cannot be children or spouses)
    let list = existingMembers.filter((m) => m.id !== memberId);

    if (relationType === "father") {
      list = list.filter(
        (m) =>
          m.gender === "male" &&
          !descendants.has(m.id) &&
          (!current || m.id !== current.motherId) &&
          (!current || m.id !== current.spouseId)
      );
    } else if (relationType === "mother") {
      list = list.filter(
        (m) =>
          m.gender === "female" &&
          !descendants.has(m.id) &&
          (!current || m.id !== current.fatherId) &&
          (!current || m.id !== current.spouseId)
      );
    } else if (relationType === "spouse") {
      const isSibling = (m: FamilyMember) => {
        if (!current) return false;
        return (
          (current.fatherId && m.fatherId === current.fatherId) ||
          (current.motherId && m.motherId === current.motherId)
        );
      };
      list = list.filter(
        (m) =>
          !descendants.has(m.id) &&
          !ancestors.has(m.id) &&
          !isSibling(m) &&
          (!current || m.id !== current.spouseId)
      );
    } else if (relationType === "child") {
      list = list.filter(
        (m) =>
          !ancestors.has(m.id) &&
          (!current || (m.id !== current.spouseId && m.id !== current.fatherId && m.id !== current.motherId))
      );
    } else if (relationType === "sibling") {
      list = list.filter(
        (m) =>
          !descendants.has(m.id) &&
          (!current || (m.id !== current.fatherId && m.id !== current.motherId && m.id !== current.spouseId))
      );
    }

    return list;
  }, [existingMembers, prefilledRelation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (formMode === "link") {
      if (selectedLinkMemberIds.length === 0) {
        setErrorMsg("Please select at least one relative to link.");
        setIsLoading(false);
        return;
      }
      try {
        for (const linkId of selectedLinkMemberIds) {
          await onSubmit(
            linkId,
            {},
            prefilledRelation || undefined,
            false,
            selectedLinkRelatives
          );
        }
        onClose();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to link record.";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (memberToEdit) {
      const slugId = memberToEdit.id;
      const memberData: Partial<FamilyMember> = {
        name: name.trim(),
        gender,
        birthDate: birthDate.trim() || "",
        deathDate: deathDate.trim() || "",
        birthPlace: birthPlace.trim() || "",
        bio: bio.trim() || "",
        fatherId: fatherId || "",
        motherId: motherId || "",
        spouseId: spouseId || "",
      };

      try {
        await onSubmit(slugId, memberData, undefined, true);
        onClose();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save record.";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!name.trim()) {
      setErrorMsg("Full name is required.");
      setIsLoading(false);
      return;
    }

    // Resolve slug conflicts automatically
    const existingIds = new Set(existingMembers.map((m) => m.id));
    const slugId = generateUniqueSlug(name, existingIds);

    const memberData: Partial<FamilyMember> = {
      name: name.trim(),
      gender,
    };

    if (birthDate.trim()) memberData.birthDate = birthDate.trim();
    if (deathDate.trim()) memberData.deathDate = deathDate.trim();
    if (birthPlace.trim()) memberData.birthPlace = birthPlace.trim();
    if (bio.trim()) memberData.bio = bio.trim();
    if (fatherId) memberData.fatherId = fatherId;
    if (motherId) memberData.motherId = motherId;
    if (spouseId) memberData.spouseId = spouseId;

    try {
      await onSubmit(slugId, memberData, prefilledRelation || undefined, false, selectedLinkRelatives);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save record.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMemberId = memberToEdit?.id || "";
  const editDescendants = useMemo(() => {
    if (!currentMemberId) return new Set<string>();
    return getDescendants(currentMemberId, existingMembers);
  }, [currentMemberId, existingMembers]);

  const editAncestors = useMemo(() => {
    if (!currentMemberId) return new Set<string>();
    return getAncestors(currentMemberId, existingMembers);
  }, [currentMemberId, existingMembers]);

  const potentialFathers = useMemo(() => {
    let list = existingMembers.filter((m) => m.gender === "male");
    if (currentMemberId) {
      list = list.filter((m) => m.id !== currentMemberId && !editDescendants.has(m.id));
    }
    return list;
  }, [existingMembers, currentMemberId, editDescendants]);

  const potentialMothers = useMemo(() => {
    let list = existingMembers.filter((m) => m.gender === "female");
    if (currentMemberId) {
      list = list.filter((m) => m.id !== currentMemberId && !editDescendants.has(m.id));
    }
    return list;
  }, [existingMembers, currentMemberId, editDescendants]);

  const potentialSpouses = useMemo(() => {
    let list = existingMembers.filter((m) => m.id !== spouseId);
    if (currentMemberId) {
      const current = existingMembers.find((m) => m.id === currentMemberId);
      const isSibling = (m: FamilyMember) => {
        if (!current) return false;
        return (
          (current.fatherId && m.fatherId === current.fatherId) ||
          (current.motherId && m.motherId === current.motherId)
        );
      };
      list = list.filter(
        (m) =>
          m.id !== currentMemberId &&
          !editDescendants.has(m.id) &&
          !editAncestors.has(m.id) &&
          !isSibling(m)
      );
    }
    return list;
  }, [existingMembers, currentMemberId, editDescendants, editAncestors, spouseId]);

  const siblingOptions = useMemo(() => {
    if (!prefilledRelation || (prefilledRelation.relationType !== "father" && prefilledRelation.relationType !== "mother")) {
      return [];
    }
    const target = existingMembers.find((m) => m.id === prefilledRelation.memberId);
    if (!target) return [];
    return existingMembers.filter(
      (m) =>
        m.id !== target.id &&
        ((target.fatherId && m.fatherId === target.fatherId) ||
          (target.motherId && m.motherId === target.motherId))
    );
  }, [prefilledRelation, existingMembers]);

  const childOptions = useMemo(() => {
    if (!prefilledRelation || prefilledRelation.relationType !== "spouse") {
      return [];
    }
    return existingMembers.filter(
      (m) => m.fatherId === prefilledRelation.memberId || m.motherId === prefilledRelation.memberId
    );
  }, [prefilledRelation, existingMembers]);

  return (
    <Dialog
      open={isOpen}
      handler={onClose}
      className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 overflow-hidden max-w-lg w-full mx-auto"
      placeholder={undefined}
    >
      <DialogBody className="text-slate-700 font-sans" placeholder={undefined}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-slate-900">
            <UserPlusIcon className="h-5 w-5 text-indigo-500" />
            <Typography variant="h5" className="font-bold font-heading" placeholder={undefined}>
              {memberToEdit
                ? `Edit Profile for ${memberToEdit.name}`
                : prefilledRelation
                  ? `${formMode === "link" ? "Link" : "Add"} ${prefilledRelation.relationType} for ${prefilledRelation.memberName}`
                  : "Add New Family Member"}
            </Typography>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher for when we have contextual link option */}
        {prefilledRelation && (
          <div className="flex gap-1.5 mb-5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/20">
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-150 ${
                formMode === "create"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create New Member
            </button>
            <button
              type="button"
              onClick={() => setFormMode("link")}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-150 ${
                formMode === "link"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Link Existing Member
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {formMode === "link" ? (
            <LinkMemberForm
              eligibleLinkMembers={eligibleLinkMembers}
              selectedLinkMemberIds={selectedLinkMemberIds}
              setSelectedLinkMemberIds={setSelectedLinkMemberIds}
              prefilledRelation={prefilledRelation}
            />
          ) : (
            <CreateMemberForm
              name={name}
              setName={setName}
              gender={gender}
              setGender={setGender}
              birthPlace={birthPlace}
              setBirthPlace={setBirthPlace}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              deathDate={deathDate}
              setDeathDate={setDeathDate}
              bio={bio}
              setBio={setBio}
              fatherId={fatherId}
              setFatherId={setFatherId}
              motherId={motherId}
              setMotherId={setMotherId}
              spouseId={spouseId}
              setSpouseId={setSpouseId}
              potentialFathers={potentialFathers}
              potentialMothers={potentialMothers}
              potentialSpouses={potentialSpouses}
              prefilledRelation={prefilledRelation}
              isEdit={!!memberToEdit}
            />
          )}

          {/* Confirmation checkbox prompts for siblings/children mapping */}
          {prefilledRelation && (
            <>
              {/* Parent Mode (Father/Mother) & target has siblings */}
              {(prefilledRelation.relationType === "father" || prefilledRelation.relationType === "mother") && siblingOptions.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <Typography className="text-xs font-bold text-slate-500 font-sans" placeholder={undefined}>
                    **{prefilledRelation.memberName}** has {siblingOptions.length} sibling(s). Do you also want to link this parent to them?
                  </Typography>
                  <div className="border border-slate-200/60 rounded-xl p-3 bg-slate-50/50 space-y-2.5 max-h-32 overflow-y-auto">
                    {siblingOptions.map((sib) => {
                      const isChecked = selectedLinkRelatives.includes(sib.id);
                      return (
                        <label key={sib.id} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLinkRelatives([...selectedLinkRelatives, sib.id]);
                              } else {
                                setSelectedLinkRelatives(selectedLinkRelatives.filter((id) => id !== sib.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                          />
                          {sib.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Spouse Mode & target has children */}
              {prefilledRelation.relationType === "spouse" && childOptions.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <Typography className="text-xs font-bold text-slate-500 font-sans" placeholder={undefined}>
                    **{prefilledRelation.memberName}** has {childOptions.length} child(ren). Do you also want to set this person as their parent?
                  </Typography>
                  <div className="border border-slate-200/60 rounded-xl p-3 bg-slate-50/50 space-y-2.5 max-h-32 overflow-y-auto">
                    {childOptions.map((child) => {
                      const isChecked = selectedLinkRelatives.includes(child.id);
                      return (
                        <label key={child.id} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLinkRelatives([...selectedLinkRelatives, child.id]);
                              } else {
                                setSelectedLinkRelatives(selectedLinkRelatives.filter((id) => id !== child.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                          />
                          {child.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {errorMsg && (
            <Typography className="text-red-400 font-sans text-sm font-semibold" placeholder={undefined}>
              ⚠️ {errorMsg}
            </Typography>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              size="md"
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-800 capitalize font-bold text-sm tracking-wide shadow-none"
              placeholder={undefined}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={isLoading || (formMode === "link" && (eligibleLinkMembers.length === 0 || selectedLinkMemberIds.length === 0))}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl capitalize font-bold text-sm tracking-wide px-6 py-2.5 transition-all duration-150"
              placeholder={undefined}
            >
              {isLoading
                ? memberToEdit
                  ? "Saving..."
                  : formMode === "link"
                    ? "Linking..."
                    : "Saving..."
                : memberToEdit
                  ? "Save Changes"
                  : formMode === "link"
                    ? "Link Member"
                    : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogBody>
    </Dialog>
  );
}

export default AddMemberModal;
