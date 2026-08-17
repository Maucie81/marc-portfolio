export default function HotelTonightPerksCaseStudy() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:py-16">
      <main className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="space-y-3 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Case Study
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            HotelTonight Perks
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Revamping HotelTonight&apos;s loyalty program to better balance guest
            value, hotel partner needs, and business outcomes — with a focus on
            clarity, fairness, and delight.
          </p>
        </header>

        <section className="grid gap-6 border-b border-zinc-200 pb-10 text-sm leading-relaxed dark:border-zinc-800 sm:grid-cols-3 sm:gap-10">
          <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]">
                Project Definition
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]">
                The Problem
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]">
                Product / Business Goals
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]">
                My Role
              </p>
            </div>
          </div>

          <div className="space-y-6 sm:col-span-2">
            <div>
              <h2 className="sr-only">Project Definition</h2>
              <blockquote className="border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <p>
                  HotelTonight aspires to have &quot;the world&apos;s best loyalty
                  program,&quot; simpler to understand and a better value than the
                  loyalty programs offered by other online travel agencies.
                </p>
                <p className="mt-3">
                  Based on 2016 numbers, we estimated that by revamping the
                  program, we would provide $2.7m in incremental revenue and
                  139k additional room nights (6.47% of total 2016 room nights).
                  Room night growth has been a KPI for HotelTonight, in part
                  because increasing room nights improves our value prop to
                  hotels, allowing us to onboard more supply and drive hotel
                  adoption of features.
                </p>
              </blockquote>
            </div>

            <div>
              <h2 className="sr-only">The Problem</h2>
              <blockquote className="border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <p>
                  Some hotels were already offering Perks to guests and were
                  unhappy with the program because they were seeing too many
                  bookings from high-level Perks users, resulting in steep
                  discounts. Hotels who were not offering Perks didn&apos;t want to
                  opt in because they feared exactly that happening.
                </p>
                <p className="mt-3">
                  Many users didn&apos;t understand the benefits of the Perks
                  program, and overall awareness of Perks was low, especially
                  among new users.
                </p>
              </blockquote>
            </div>

            <div>
              <h2 className="sr-only">Product / Business Goals</h2>
              <blockquote className="border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <p>
                  Get more hotels to opt-in to providing Perks, and stay
                  opted-in, by making the program more useful and fair to them.
                  In addition, drive the usage of Perks by more deeply
                  integrating it into the booking experience and positioning the
                  value prop to the right customers:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>Increase awareness of benefits.</li>
                  <li>Increase motivation to reach the next level.</li>
                  <li>Make leveling-up feel more celebratory.</li>
                  <li>Better reward our most loyal users (MVBs) at higher levels.</li>
                  <li>Ensure that the program remains financially beneficial.</li>
                </ul>
              </blockquote>
            </div>

            <div>
              <h2 className="sr-only">My Role</h2>
              <blockquote className="border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <p>
                  I was the lead designer, and worked closely with my Project
                  Manager and Eng Lead throughout the process. I concepted all
                  interaction designs, but final motion was executed by another
                  designer on the team, who produced Lottie files for the Eng
                  team to integrate.
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="space-y-6 border-b border-zinc-200 pb-10 text-sm leading-relaxed dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Brainstorming
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              Members of the build team, as well as a few key stakeholders,
              huddled in a room to brainstorm how the Perks program could be
              improved to provide a more amazing experience for our users. We
              used the IDEO &quot;How Might We&quot; framework to generate ideas to
              open‑ended questions.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Wireframes &amp; Low Fidelity Mocks
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              My PM and I evaluated the ideas surfaced during our
              brainstorming session, and I took the most promising concepts
              into wireframes. I mapped which parts of the app would be
              affected and explored how Perks could be more deeply integrated
              throughout the booking flow.
            </p>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              A key question was how leveling should work. When a user reaches
              a certain spend amount, they reach a new level. We wanted this to
              feel fun and celebratory — something users would look forward to
              and potentially brag about.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight">
              UI Exploration &amp; Implementation
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              From the strongest wireframed directions, I explored multiple UI
              options, pushing and pulling the design to work with existing
              content and align with HotelTonight&apos;s visual language. I then
              partnered with engineering to refine details like hierarchy,
              states, and edge cases as we implemented the designs in product.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Motion &amp; Level-Up Animations
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              To make leveling up feel special, we explored several animation
              directions that would play once a user completed a booking and
              reached a new Perks level. I developed the core motion concepts,
              then collaborated with a motion designer who produced final
              Lottie files for engineering to integrate.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight">
              User Testing
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              I created an InVision prototype and ran a remote unmoderated
              study via UserTesting to understand how well users grasped the
              new Perks levels and &quot;Save for Later&quot; feature, and to surface
              pain points in the end‑to‑end experience.
            </p>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              Participants generally found the checkout experience easy and
              straightforward, but struggled to understand the benefits at each
              Perks level. Copy such as &quot;Another 5% off from Perks 2&quot; didn&apos;t
              clearly communicate what the underlying discounts actually were.
            </p>
          </div>
        </section>

        <section className="space-y-6 border-b border-zinc-200 pb-10 text-sm leading-relaxed dark:border-zinc-800">
          <h2 className="text-base font-semibold tracking-tight">
            Outcome
          </h2>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold">
                Goal 1 — Make Perks more useful and fair for hotels
              </h3>
              <blockquote className="mt-2 border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Raised entry spend for the program from $100 to $250,
                    creating a higher fence for participation.
                  </li>
                  <li>
                    Decreased the percentage of users receiving a 20% discount
                    by ~35% by reorganizing which benefits appeared at which
                    levels.
                  </li>
                  <li>
                    Early results showed an increase in hotel adoption of Perks
                    from 62% to 73%.
                  </li>
                </ul>
              </blockquote>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Goal 2 — Deepen integration into the booking experience
              </h3>
              <blockquote className="mt-2 border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Repositioned Perks to be more visible within the booking
                    tab so users could easily see their status and progress to
                    the next level.
                  </li>
                  <li>
                    Made the level‑up moment more celebratory to create delight
                    and a sense of achievement.
                  </li>
                  <li>
                    Extended Perks levels infinitely so that highly engaged
                    guests could always earn additional rewards.
                  </li>
                </ul>
              </blockquote>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Goal 3 — Keep the program financially healthy
              </h3>
              <blockquote className="mt-2 border-l-2 border-zinc-300 pl-4 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Pivoted from perpetual credits to coupons that expire after
                    180 days and auto‑apply to qualifying bookings, reducing
                    long‑term liability from stockpiled value.
                  </li>
                  <li>
                    Set a minimum booking amount of $150 for coupon use.
                  </li>
                  <li>
                    Updated policy so Perks credits are no longer refundable if
                    a booking is canceled.
                  </li>
                </ul>
              </blockquote>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4 pt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Additional work available upon request.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="http://linkedin.com/in/marcfavro"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-800 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-300"
            >
              LinkedIn
            </a>
            <a
              href="mailto:marcfavro@gmail.com"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-800 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-300"
            >
              Email
            </a>
            <a
              href="https://www.instagram.com/m.o.u.c/?hl=en"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-800 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-300"
            >
              Instagram
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

