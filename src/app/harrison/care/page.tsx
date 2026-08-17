"use client";

import { CareSection } from "@/components/CareSection";

export default function CareGuidePage() {
  return (
    <main className="mx-auto max-w-lg px-4 pb-8 pt-safe">
      <div className="mt-4 space-y-0">
        <CareSection title="Activity Restrictions" defaultOpen>
          <ul className="list-disc space-y-2 pl-5 text-[#56440f]">
            <li>No running, jumping, or playing for 8 weeks</li>
            <li><strong>Inside:</strong> Restrict to a small area — one room with good footing, or a crate/kennel</li>
            <li><strong>Outside:</strong> Leash only, for elimination only, under 10 minutes</li>
            <li>Do not allow play with other animals; separate when left alone</li>
            <li>Use a sling or towel to assist on slippery surfaces (wood floors, icy sidewalks)</li>
            <li>Always use the sling for leash walks and getting in/out of the house</li>
          </ul>
        </CareSection>
        <CareSection title="The E-Collar">
          <ul className="list-disc space-y-2 pl-5 text-[#56440f]">
            <li>The Elizabethan collar must stay on at all times</li>
            <li>Do not allow licking, scratching, or chewing near any incision site</li>
            <li>This applies until otherwise directed by the vet</li>
          </ul>
        </CareSection>
        <CareSection title="Incision Care">
          <p className="mb-2 text-[#56440f]">Harrison has incisions on the inside of the knee, the right groin area, and small sites on his right side, chest, and left elbow.</p>
          <ul className="list-disc space-y-2 pl-5 text-[#56440f]">
            <li>Check the knee incision once daily</li>
            <li><strong>Normal appearance:</strong> Dry, slightly red along margins, slightly swollen/thick at edges</li>
            <li>Over several days it should lose redness and swelling</li>
            <li>Ice pack the knee incision up to 3× daily, 10 minutes at a time, for the first few days (if he tolerates it)</li>
          </ul>
        </CareSection>
        <CareSection title="When to Call the Vet">
          <p className="mb-2 text-[#56440f]">Call BluePearl <a href="tel:+17185960099" className="font-medium text-[#ffa11c] underline">(718-596-0099)</a>, open 24 hrs, if you notice:</p>
          <ul className="list-disc space-y-2 pl-5 text-[#56440f]">
            <li>Incision edges separating or gapping (they should be touching)</li>
            <li>Discharge from the incision (other than minor crusting)</li>
            <li>Swelling beyond slightly raised skin near edges</li>
            <li>Lethargy, loss of appetite, vomiting, or diarrhea lasting more than 24–48 hours</li>
            <li>Persistent mild cough accompanied by loss of appetite, lethargy, or rapid breathing</li>
            <li><strong>Difficulty breathing at any time — call immediately</strong></li>
          </ul>
        </CareSection>
        <CareSection title="Post-Anesthesia (First Few Days)">
          <ul className="list-disc space-y-2 pl-5 text-[#56440f]">
            <li>It is normal for Harrison to sleep more, eat less, drink more, or skip a bowel movement for 2–4 days</li>
            <li>A mild cough for several days after anesthesia is common and not a concern unless persistent or accompanied by other symptoms</li>
          </ul>
        </CareSection>
        <CareSection title="Follow-Up Appointments">
          <ul className="list-disc space-y-2 pl-5 text-[#56440f]">
            <li><strong>Recheck:</strong> Schedule within 12–14 days of surgery (around March 14–16)</li>
            <li><strong>X-ray recheck:</strong> Schedule at 8–10 weeks post-surgery (around April 27 – May 4) to confirm bone healing — do not feed Harrison the morning of this appointment, as sedation may be required</li>
            <li><strong>Contact:</strong> Dr. Brian P. Grossbard — <a href="mailto:brian.grossbard@bluepearlvet.com" className="text-[#ffa11c] underline">brian.grossbard@bluepearlvet.com</a></li>
          </ul>
        </CareSection>
      </div>
    </main>
  );
}
