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
} from "../firebase/firebase.utils";
import { DocumentData } from "firebase/firestore";

export default function Portfolio() {
  const [userInfo, setUserInfo] = useState<DocumentData | undefined>();

  const getUserData = async () => {
    const data = await getUserDataAPI();
    if (data) {
      setUserInfo(data);
    }
  };

  const getProjectDetails = async () => {
    const data = await getProjectDetailsAPI();
    if (data) {
      console.log("-->", data);
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
      <Projects />
      <Resume />
      <Testimonial />
      <PopularClients />
      <ContactForm />
      <Footer />
    </>
  );
}
