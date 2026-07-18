import { Typography } from "@material-tailwind/react";

interface SkillCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export function SkillCard({ icon: Icon, title, children }: SkillCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100/30 text-indigo-600">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <Typography
        variant="h5"
        className="mb-3 text-slate-900 font-bold text-lg font-heading"
        placeholder={undefined}
      >
        {title}
      </Typography>
      <Typography
        className="text-slate-500 font-normal leading-relaxed text-base font-sans"
        placeholder={undefined}
      >

        {children}
      </Typography>
    </div>
  );
}

export default SkillCard;
