const TEAM = [
    { name: "", role: "Team Leader", detail: "Project coordination & team direction", image: "/team/Screenshot 2026-11-07 082648.png", hoverImage: "/team/Screenshot 2026-11-07 082754.png" },
    { name: "", role: "Developer", detail: "Application development & C++ integration", image: "", hoverImage: "" },
    { name: "", role: "UI/UX Designer", detail: "Interface design & user experience", image: "", hoverImage: "" },
    { name: "", role: "Documenter", detail: "Project documentation & requirements", image: "", hoverImage: "" },
    { name: "", role: "Tester", detail: "Quality assurance & testing", image: "", hoverImage: "" },
];
export default function TeamProfiles() {
    return <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:gap-6">
    {TEAM.map(({ name, role, detail, image, hoverImage }, index) => {
        const displayName = name.trim() || role;
        const hasHoverImage = Boolean(image && hoverImage);
        return <article key={role} className={`rounded-2xl border border-mint-100 bg-white p-3 sm:p-5 text-center shadow-sm ${index === 0 ? "col-span-2 w-full max-w-sm justify-self-center" : ""}`}>
          <div tabIndex={hasHoverImage ? 0 : undefined} aria-label={hasHoverImage ? `${displayName}. Hover or focus to see the alternate photo.` : undefined} style={{ width: "min(128px, 100%)", aspectRatio: "1", borderRadius: "50%" }} className="group relative mx-auto mb-5 flex items-center justify-center overflow-hidden border-4 border-mint-50 bg-mint-50/50 text-forest-700 outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-4">
            {image ? <>
              <img src={image} alt={`${displayName} profile photo`} width={128} height={128} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${hasHoverImage ? "group-hover:opacity-0 group-focus:opacity-0" : ""}`}/>
              {hasHoverImage && <img src={hoverImage} alt="" aria-hidden="true" width={128} height={128} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 motion-reduce:transition-none"/>}
            </> : <svg aria-hidden="true" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="32" cy="23" r="11"/><path d="M12 55c0-11 9-19 20-19s20 8 20 19"/></svg>}
          </div>
          <h3 className="font-bold text-forest-900">{displayName}</h3>
          {name.trim() && <p className="mt-1 text-sm font-semibold text-forest-800">{role}</p>}
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">{detail}</p>
        </article>;
    })}
  </div>;
}
