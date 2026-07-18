import { Typography } from "@material-tailwind/react";
import {
  RectangleGroupIcon,
  SwatchIcon,
  HashtagIcon,
} from "@heroicons/react/24/solid";
import { SkillCard, ScrollReveal } from "@/components";

const SKILLS = [
  {
    icon: RectangleGroupIcon,
    title: "Full-Stack Craftsmanship",
    children:
      "I love building complete systems. From designing database schemas to coding responsive interfaces, I focus on creating applications where frontend and backend work together seamlessly.",
  },
  {
    icon: SwatchIcon,
    title: "Modern Ecosystems",
    children:
      "I work daily with React, Next.js, Node.js, and AWS. I choose tools that solve the actual product needs, keeping code clean, scalable, and easy to maintain.",
  },
  {
    icon: HashtagIcon,
    title: "Performance & Detail",
    children:
      "Every millisecond counts. I deeply care about page loading speeds, smooth animations, and clean accessibility, ensuring the final experience feels fluid and polished.",
  },
];

export function Skills() {
  return (
    <section className="px-6 py-20 bg-white" id="skills">
      <div className="container mx-auto">
        <ScrollReveal className="mb-16 text-center max-w-2xl mx-auto">
          <Typography
            className="mb-2 text-indigo-600 font-bold uppercase tracking-widest text-sm"
            placeholder={undefined}
          >
            My Expertise
          </Typography>
          <Typography
            variant="h2"
            className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mb-4"
            placeholder={undefined}
          >
            What I Do Best
          </Typography>
          <Typography
            variant="lead"
            className="text-slate-500 font-normal leading-relaxed text-base font-sans"
            placeholder={undefined}
          >
            A look at the skills and philosophies I bring to my code daily,
            forged through hands-on development and shipping real products.
          </Typography>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SKILLS.map((props, idx) => (
            <ScrollReveal key={idx} delay={idx * 120}>
              <SkillCard {...props} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;


