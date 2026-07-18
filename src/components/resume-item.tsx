import { Typography } from "@material-tailwind/react";

interface ResumeItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
}

export function ResumeItem({ icon: Icon, children }: ResumeItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-[18rem]">
      <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <Typography
        className="w-full font-semibold text-slate-700 text-base font-sans"
        placeholder={undefined}
      >
        {children}
      </Typography>
    </div>
  );
}

export default ResumeItem;
