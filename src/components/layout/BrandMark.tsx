import { GraduationIcon } from "@/components/ui/icons";

// Logo lockup shared by the header and footer; the wrapping link supplies the accessible name.
export function BrandMark() {
  return (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
        <GraduationIcon width={20} height={20} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">Reltroner</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Learning Academy</span>
      </span>
    </>
  );
}
