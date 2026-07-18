"use client";

import { Navbar, Footer } from "@/components/portfolio";
import Hero from "./hero";
import Skills from "./skills";
import Resume from "./resume";
import Projects from "./projects";
import PopularClients from "./popular-clients";
import ContactForm from "./contact-form";

import { useEffect, useState } from "react";
import {
  getUserDataAPI,
  getProjectDetailsAPI,
  getImage,
} from "@/firebase/firebase.utils";
import { DocumentData } from "firebase/firestore";

export default function Portfolio() {
  const [userInfo, setUserInfo] = useState<DocumentData | undefined>(undefined);
  const [projectInfo, setProjectInfo] = useState<DocumentData[] | undefined>(
    []
  );
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch both in parallel
        const [userData, projectData] = await Promise.allSettled([
          getUserDataAPI(),
          getProjectDetailsAPI(),
        ]);

        // Process user data
        if (userData.status === "fulfilled" && userData.value) {
          const data = userData.value;
          let profileImgUrl = "";
          if (data.profileImg) {
            profileImgUrl = await getImage(data.profileImg);
          }

          let resolvedCompanies = [];
          if (data.companies && Array.isArray(data.companies)) {
            resolvedCompanies = await Promise.all(
              data.companies.map(async (company: any) => {
                let logoUrl = "";
                if (company.Img) {
                  logoUrl = await getImage(company.Img);
                }
                return {
                  ...company,
                  logoUrl: logoUrl || company.Img,
                };
              })
            );
          }

          setUserInfo({
            ...data,
            profileImg: profileImgUrl || data.profileImg,
            companies: resolvedCompanies,
          });
        }

        // Process project data
        if (projectData.status === "fulfilled" && projectData.value) {
          const data = projectData.value;
          const updatedProjectInfo = await Promise.all(
            data.projects.map(async (project: any) => {
              const images = await Promise.all(
                project.images.map(async (image: string) => {
                  return await getImage(image);
                })
              );
              return { ...project, images };
            })
          );
          setProjectInfo(updatedProjectInfo);
        }
      } catch (err: any) {
        console.error("Error loading portfolio data:", err);
      } finally {
        setDataReady(true);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Navbar />
      <Hero userInfo={userInfo} isLoading={!dataReady} />
      <Projects projectInfo={projectInfo} isLoading={!dataReady} />
      <Skills />
      <Resume />
      <PopularClients companies={userInfo?.companies} isLoading={!dataReady} />
      <ContactForm userInfo={userInfo} />
      <Footer userInfo={userInfo} />
    </>
  );
}

