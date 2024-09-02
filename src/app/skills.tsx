import { Typography } from "@material-tailwind/react";
import {
  RectangleGroupIcon,
  SwatchIcon,
  HashtagIcon,
} from "@heroicons/react/24/solid";
import { SkillCard } from "@/components";

const SKILLS = [
  {
    icon: RectangleGroupIcon,
    title: "Full-Stack Web Development:",
    children:
      "I craft user-friendly and scalable web applications, seamlessly integrating frontend and backend development to deliver a smooth and intuitive user experience.",
  },
  {
    icon: SwatchIcon,
    title: "Technology Stack:",
    children:
      "I'm proficient in ReactJS, NodeJS, and familiar with AWS cloud services. This allows me to create robust and efficient web applications.",
  },
  {
    icon: HashtagIcon,
    title: "Web Performance Optimization:",
    children:
      "Speed matters. I optimize web applications for fast loading times and smooth responsiveness, delivering a positive user experience that keeps users engaged.",
  },
];

export function Skills() {
  return (
    <section className="px-8 py-8 ">
      <div className="container mx-auto mb-20 text-center border-t border-gray-200 pt-12">
        <Typography
          variant="h2"
          color="blue-gray"
          className="mb-2 font-bold uppercase"
          placeholder={undefined}
        >
          my skills
        </Typography>
        <Typography
          variant="lead"
          className="mx-auto w-full !text-gray-500 lg:w-10/12"
          placeholder={undefined}
        >
          I thrive on tackling complex web development challenges and
          transforming them into elegant and efficient solutions. My strong
          problem-solving skills and attention to detail allow me to deliver
          high-quality applications that exceed your expectations.
        </Typography>
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((props, idx) => (
          <SkillCard key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

export default Skills;
