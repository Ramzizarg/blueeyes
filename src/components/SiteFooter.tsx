import { EMAIL } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="relative bg-[#eef1fb] px-5 pb-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-3 border-t border-ink/10 pt-5 text-[0.72rem] text-ink/50 sm:flex-row sm:items-center sm:justify-between">
        <a href="#top" className="display text-[1rem] tracking-[-0.06em] text-ink">
          blueeyes<span className="text-signal">.</span>
        </a>
        <a href={`mailto:${EMAIL}`} className="transition hover:text-ink">
          {EMAIL}
        </a>
        <p>Designed &amp; built by blueeyes.</p>
      </div>
    </footer>
  );
}
