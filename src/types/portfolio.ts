export interface Company {
  name: string;
  logoUrl?: string;
  Img?: string;
}

export interface Project {
  title: string;
  description: string;
  images: string[];
  prodLink: string;
  affiliation: string;
}

export interface UserInfo {
  name?: string;
  description?: string;
  profileImg?: string;
  email?: string;
  phoneNumber?: string | number;
  githubUrl?: string;
  linkedInUrl?: string;
  companies?: Company[];
}
