"use client";

// components
import { Navbar, Footer } from "@/components";

// sections
import Hero from "./hero";
import Clients from "./clients";
import Skills from "./skills";
import Projects from "./projects";
import Resume from "./resume";
import Testimonial from "./testimonial";
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
  const [userInfo, setUserInfo] = useState<DocumentData | undefined>();
  const [projectInfo, setProjectInfo] = useState<DocumentData | undefined>();

  const getUserData = async () => {
    const data = await getUserDataAPI();
    if (data) {
      setUserInfo(data);
    }
  };

  const getProjectDetails = async () => {
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
  };
  useEffect(() => {
    getUserData();
    getProjectDetails();
  }, []);

  return (
    <>
      <Navbar />
      <Hero userInfo={userInfo} />
      <Clients />
      <Skills />
      <Projects projectInfo={projectInfo} />
      <Resume />
      <Testimonial />
      <PopularClients />
      <ContactForm />
      <Footer />
    </>
  );
}
