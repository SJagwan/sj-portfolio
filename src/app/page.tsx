"use client";

import { Navbar, Footer } from "../components";
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
} from "../firebase/firebase.utils";
import { DocumentData } from "firebase/firestore";

export default function Portfolio() {
  const [userInfo, setUserInfo] = useState<DocumentData | undefined>(undefined);
  const [projectInfo, setProjectInfo] = useState<DocumentData[] | undefined>(
    []
  ); // Array for multiple projects
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [error, setError] = useState<any>(null); // Track potential errors

  const getUserData = async () => {
    try {
      const data = await getUserDataAPI();
      if (data) {
        setUserInfo(data);
      }
    } catch (err: any) {
      setError(err); // Handle errors gracefully
    } finally {
      setIsLoading(false); // Update loading state after fetching
    }
  };

  const getProjectDetails = async () => {
    try {
      const data = await getProjectDetailsAPI();
      if (data) {
        const updatedProjectInfo = await Promise.all(
          data?.projects.map(async (project: any) => {
            const images = await Promise.all(
              project.images.map(async (image: string) => {
                return await getImage(image);
              })
            );
            return {
              ...project,
              images,
            };
          })
        );
        setProjectInfo(updatedProjectInfo);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
    getProjectDetails();
  }, []);

  return (
    <>
      {/* {isLoading ? (
        <div>Loading data...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <> */}
      <Navbar />
      <Hero userInfo={userInfo} />
      <Resume />
      <Projects projectInfo={projectInfo} />
      <Skills />
      <PopularClients />
      <ContactForm userInfo={userInfo} />
      <Footer />
      {/* </>
      )} */}
    </>
  );
}
