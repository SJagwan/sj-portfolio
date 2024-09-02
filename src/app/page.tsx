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
        if (data?.profileImg) {
          const imgData = await getImage(data.profileImg);
          setUserInfo({ ...data, profileImg: imgData });
        } else {
          setUserInfo(data);
        }
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
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loading">
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-ping"></div>
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse delay-100"></div>
            <div className="h-3 w-3 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          <Navbar />
          <Hero userInfo={userInfo} />
          <Resume />
          <Projects projectInfo={projectInfo} />
          <Skills />
          <PopularClients />
          <ContactForm userInfo={userInfo} />
          <Footer />
        </>
      )}
    </>
  );
}
