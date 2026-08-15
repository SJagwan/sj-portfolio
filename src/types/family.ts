export type Gender = "male" | "female";

export type RelationshipType = "father" | "mother" | "spouse" | "child" | "sibling";

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  bio?: string;
  photoUrl?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
}

export interface PrefilledRelation {
  memberId: string;
  memberName: string;
  relationType: RelationshipType;
}

export interface FamilySearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  familyData: FamilyMember[];
  onMemberSelect: (id: string) => void;
}
