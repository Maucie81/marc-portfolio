import CaseStudyHeaderRiso from "@/components/riso/CaseStudyHeaderRiso";
import RegistrationMark from "@/components/riso/RegistrationMark";
import RisoBanding from "@/components/riso/RisoBanding";
import RisoDefs from "@/components/riso/RisoDefs";
import RisoGrain from "@/components/riso/RisoGrain";
import SectionDividerRiso from "@/components/riso/SectionDividerRiso";
import SignatureMarkRiso from "@/components/riso/SignatureMarkRiso";
import { RISO_PAPER, RISO_TEXT_INK } from "@/components/riso/palette";
import { containerStyle, editorialBody, stampLabel } from "@/components/riso/type";

const COLOPHON = [
  "Printed in two passes, by hand.",
  "No white ink — paper is the highlight.",
  "Registration held, not guaranteed.",
];

export default function RisoLabPage() {
  return (
    <main style={{ background: RISO_PAPER }}>
      <RisoDefs />

      <CaseStudyHeaderRiso
        runLabel="PRESS PROOF"
        index="04"
        title="STET"
        dek="A two-ink risograph system for the web: overprint, misregistration, and halftone built as structure — not a filter."
      />

      <SectionDividerRiso label="Overprint" index="02" />

      <section style={{ position: "relative", padding: "4rem 0 5rem" }}>
        <RisoGrain />
        <RisoBanding />
        <div style={{ ...containerStyle, position: "relative", display: "flex", gap: "4rem", flexWrap: "wrap", alignItems: "flex-start" }}>
          <SignatureMarkRiso size={104} />

          <div>
            <div style={{ ...stampLabel, fontSize: "0.75rem", color: RISO_TEXT_INK, marginBottom: "1.25rem" }}>
              Printer&rsquo;s device
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {COLOPHON.map((line) => (
                <li key={line} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <SignatureMarkRiso size={20} />
                  <span style={{ ...editorialBody, color: RISO_TEXT_INK }}>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ width: "100%", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <RegistrationMark size={26} />
            <span style={{ ...stampLabel, fontSize: "0.7rem", color: RISO_TEXT_INK }}>
              Run 04 — two plates, one sheet, no third drop
            </span>
            <RegistrationMark size={26} />
          </div>
        </div>
      </section>
    </main>
  );
}
