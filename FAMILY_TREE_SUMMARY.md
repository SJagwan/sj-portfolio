# Heritage Archive (Family Tree) Implementation Summary

This document provides a comprehensive end-to-end technical overview of the family tree implementation in the portfolio application. It covers the system architecture, security authentication, performance optimizations, circularity protection algorithms, profile editing, and the multi-sibling/relationship mapping UX.

---

## 1. Authentication & Security Gatekeeper

### Implementation
- **Cryptographic Hashing:** The passcode gate uses client-side SHA-256 hashing (`crypto.subtle.digest`) of the user's input passcode. It compares the computed hash against document IDs in the Firestore `gatekeeper/` collection.
- **Session Lifespan:** Once validated, the active session is stored in `localStorage` under `family_tree_session` with an expiration timestamp. The session is valid for exactly 30 minutes, preventing unauthorized access to archive records.

### Thought Process
- Client-side hashing against Firestore document IDs avoids storing plain-text passcodes in the database and eliminates the need for a complex custom authentication backend.
- Adding a session-expiring gatekeeper ensures the archive remains private while keeping the portfolio page light and fast.

---

## 2. Dynamic Pedigree Tree Layout

### Implementation
- **Three-Tier Rendering Hierarchy:**
  1. **Top Tier (Ancestors):** Renders the focus member's Mother and Father.
  2. **Center Tier (Focus & Siblings):** Renders the primary focused member in the middle, and their siblings stacked vertically on the left side.
  3. **Bottom Tier (Descendants):** Renders all children of the focus member.
- **Relationship Derivation:** Children are not stored as arrays in parent documents. Instead, they are resolved dynamically in `page.tsx` by querying:
  `member.fatherId === activeId || member.motherId === activeId`.
- **Navigation Stack:** Clicking any family card updates the `activeMemberId`, refocusing the tree around them, while pushing the previous ID to `historyStack` to enable breadcrumb back-navigation.

### Thought Process
- Dynamic resolution of children simplifies the Firestore schema and avoids synchronization anomalies (e.g. updating parent pointer without updating child array).
- Storing ancestors (Father/Mother) directly on the child document is the standard relational format for family database management.

---

## 3. Modular Code Architecture & Refactoring

To ensure long-term maintainability, the initial monolithic modal was split into focused modules:
1. **[utils.ts](file:///Users/sjagwan/Developer/Personal/sj-portfolio/src/components/family/utils.ts):** Houses structural traversals (`getAncestors`, `getDescendants`), type interfaces, and naming-slug algorithms.
2. **[create-member-form.tsx](file:///Users/sjagwan/Developer/Personal/sj-portfolio/src/components/family/create-member-form.tsx):** Renders name, dates, bio inputs, and parent/spouse selections.
3. **[link-member-form.tsx](file:///Users/sjagwan/Developer/Personal/sj-portfolio/src/components/family/link-member-form.tsx):** Handles selecting and linking pre-existing members.

---

## 4. Performance Optimizations ($O(N)$ Traversal)

### Implementation
- **Lookup Indexes:** Before performing traversals, we index the flat family data array into:
  - `memberMap = new Map(existingMembers.map(m => [m.id, m]))` for $O(1)$ node access.
  - `childrenMap` (parent ID $\rightarrow$ array of child IDs) to cache relationships.
- **Linear Complexity Traversals:** Using these index maps, BFS algorithms compile the list of ancestors and descendants in $O(N)$ time instead of nested $O(N^2)$ `.filter` loops.
- **React Render Caching:** Wrapped eligible link calculations in `useMemo` blocks so they only re-evaluate when `existingMembers` or `prefilledRelation` actually changes.

### Thought Process
- As family trees grow, nested traversals quickly degrade rendering performance. Indexing relations in a single-pass map resolves bottlenecks, making page responsiveness instantaneous even for hundreds of family nodes.

---

## 5. Circularity & Cycle Prevention

### Implementation
To keep the family tree mathematically valid and prevent circular dependencies (e.g., a person being their own grandparent), the candidate dropdown lists are strictly filtered:
- **Father & Mother Selections:** Excludes the focus member themselves and any of their descendants.
- **Spouse Selections:** Excludes the focus member themselves, their ancestors, their descendants, and their siblings.

### Thought Process
- Restricting relationships at the input level prevents user error and ensures that the tree remains a Directed Acyclic Graph (DAG).

---

## 6. Collision-Safe Slug ID Generator

### Implementation
- When adding a new member (e.g. `John Smith`), the generator creates a base slug (`john-smith`).
- It checks `existingIds`. If a collision is found, it automatically increments an index suffix (e.g. `john-smith-1`, `john-smith-2`) until it finds a unique key.

### Thought Process
- In real families, members frequently share identical names. Using auto-incremented slugs ensures they get unique document records in Firestore without failing on duplicate name submissions.

---

## 7. Profile Editing Flow

### Implementation
- Added an **Edit Profile** button inside the details popup.
- Clicking it pre-fills form fields and opens `AddMemberModal` in `"edit"` mode.
- The document ID is kept static (`slugId = memberToEdit.id`) to preserve all existing child and spouse links in other documents, while updates are written back to Firestore.
- Added dynamic button labels: the primary action button displays **"Save Changes"** (or **"Saving..."**) in edit mode instead of "Add Member".

---

## 8. Sibling Confirmation & Multi-Linking UX

### Implementation
- **Sibling & Child Checkboxes:** When adding a parent or spouse, the user is prompted with a list of siblings/children (pre-selected by default):
  - *Adding Parent to F:* *"Do you also want to link this parent to F's siblings?"*
  - *Adding Spouse to FF:* *"Do you also want to set this spouse as the parent of FF's children?"*
  - If checked, the submission handler updates all selected documents in Firestore. Unchecked members remain unlinked, supporting half-siblings and step-siblings naturally.
- **Bulk-Linking (Link Tab):** In the Link tab, if the relation type is `child` or `sibling`, the single select dropdown is replaced by checkbox options. This allows users to link multiple existing members in a single click.

### Thought Process
- A simple, auto-link structure is too rigid for complex families (such as step-siblings and half-siblings). Confirmation checkboxes give the user precise control over the lineage structure, ensuring accuracy while saving them repetitive link steps.

---

## 9. Modular View Architecture & Layout Algorithms

### Implementation
- **View Mode Segmented Control:** Toggles between a focus-centric interactive **Focused View** and a read-only **Full Family Tree** pedigree diagram.
- **Modularity:** Both views are extracted into separate, highly-maintainable React components:
  - **[FocusedTreeView](file:///Users/sjagwan/Developer/Personal/sj-portfolio/src/components/family/focused-tree-view.tsx):** A pure presentational component rendering the focused active pedigree node, siblings, spouse, parents, and children.
  - **[FullTreeView](file:///Users/sjagwan/Developer/Personal/sj-portfolio/src/components/family/full-tree-view.tsx):** Renders a multi-tier centered tree diagram mapping ancestors, siblings, children, and grandchildren.
- **5-Tier Centered Pedigree Layout Algorithm:**
  - **Level -2 (Grandparents - Top Row):** Renders paternal grandparents (`paternalGrandfather ─ paternalGrandmother`) on the left, and maternal grandparents (`maternalGrandfather ─ maternalGrandmother`) on the right. Both sides are visible simultaneously, preventing missing maternal/paternal branches.
  - **Level -1 (Parents - Second Row):** Renders the parent couple (`Father ─ Mother`) connected with a marriage line, alongside the father's siblings (paternal uncles/aunts) to provide broader context. Paternal uncles/aunts are visually de-emphasized.
  - **Level 0 (Focus, Siblings & Cousins - Third Row):** Renders the active member (focused with an indigo ring) and all of their siblings side-by-side, each paired with their spouse (`sibling ─ spouse`). Additionally renders paternal cousins (children of father's siblings) as de-emphasized collateral elements.
  - **Level +1 (Children - Fourth Row):** Renders children of the focal couple (`activeMember ─ spouse`) with solid connectors, and siblings' children (nieces/nephews) with dashed connectors (de-emphasized) to prevent visual layout clutter.
  - **Level +2 (Grandchildren - Bottom Row):** **Only** expands children of the Level +1 child couples.
- **Self-Healing Spouse Parent Resolver:** If a child has only one parent document ID set (e.g. only `fatherId`), the system automatically resolves the spouse of that parent (e.g. `mother`) via the spouse link, displaying them side-by-side as a couple (`Father ─ Mother`) on both Parent and Grandparent tiers.
- **Descriptive Naming Standard:** All coding abbreviations (like `fatherGF`, `sibSet`, `gc`, `idx`) have been fully refactored to clear, long-form variables (`paternalGrandfather`, `siblingIdSet`, `grandchild`, `index`).
- **Interactive Tracking Jumps:** Clicking any card inside the Full Tree switches the explorer view mode back to **Focused View** and calls the navigation history tracker `handleNavigateToMember(memberId)`, preserving breadcrumbs and allowing users to navigate and edit any relative dynamically.
