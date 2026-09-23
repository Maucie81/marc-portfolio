// Yahoo Partner Portal case study (public/ypp/videos). One function per clip;
// each mirrors the original hand-made recording's sequence, and the timestamps
// in comments are from that original.
//
// Prototype: ~/Documents/Web Projects/ypp-prototype, served as a production
// build on port 3101 (npm run build && npm run start -- --port 3101, or the
// "ypp-prototype-prod" preview entry in .claude/launch.json).

/** Where the prototype is running. */
export const baseUrl = "http://localhost:3101";
/** Where finished videos are written, relative to the portfolio root. */
export const outputDir = "public/ypp/videos";
const DIALOG = "[role=dialog]";

/** Lengths of the original recordings, in seconds. */
export const TARGET = { Overview: 49.65, TopContent: 38.97, KPIDeepDives: 33.47, FeedHealth: 73.32, IssueTrend: 13.7, StoryDetails: 35.48, Search: 33.38, Takedowns: 25.85, UserManagement: 40.57 };
/** Pause multipliers that bring each clip to its original length. */
export const STRETCH = { Search: 0.989, Overview: 1.133, TopContent: 1.061, KPIDeepDives: 1.179, IssueTrend: 1.423, StoryDetails: 1.426, FeedHealth: 1.359, Takedowns: 1.377, UserManagement: 1.177 };

/** Put a page's date filter on a preset before capture starts. */
async function setRange(r, label) {
  const chip = await r.ev(`[...document.querySelectorAll("main button")].find(b => /^(Last|Custom|Today)/.test(b.innerText.trim()) && b.getClientRects().length)?.innerText.trim()`);
  if (!chip || chip === label) return;
  await r.move({ re: "^(last \\d+ (days|hours)|custom)$", within: "main" }, { dur: 0.05 }); await r.click(); await r.wait(0.4);
  await r.move({ text: label }, { dur: 0.05 }); await r.click(); await r.wait(0.6);
}

export const clips = {
  async Search(r) {
    await r.open("/overview");
    await setRange(r, "Last 24 hours");
    r.place({ x: 1342, y: 141 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.3);                                                  // 0.0  Overview, idle
    await r.move({ sel: "[aria-label='Open search']" }, { dur: 0.9 });  // 1.0→1.9
    await r.wait(0.35); await r.click();                                // 2.3  open search
    await r.wait(0.9);
    await r.move({ text: "Recently published" }, { dur: 0.8 });        // →4.2
    await r.wait(0.9);
    await r.move({ sel: "button.px-8.py-5", nth: 1, ax: 0.55 }, { dur: 0.7 }); // hover 2nd item ~6.2
    await r.wait(0.6);
    await r.scroll(190, { dur: 0.9 });                                  // ~7.2 scroll the list
    await r.wait(0.4);
    await r.move({ sel: "input[placeholder]", ax: 0.2 }, { dur: 0.6 }); // →8.5 back to the field
    await r.wait(1.1);
    await r.type("Storm", { cps: 4.5 });                                // 9.3–10.6
    await r.wait(1.6);                                                  // searching… → results
    await r.move({ text: "Winter storms forecast to hit much of U.S. as Americans gear up for Thanksgiving travel", ax: 0.25, dy: 16 }, { dur: 0.7 });
    await r.wait(0.35);
    await r.move({ text: "Winter storms forecast to hit much of U.S. as Americans gear up for Thanksgiving travel", ax: 0.35 }, { dur: 0.35 });
    await r.wait(0.2); await r.click();                                 // 13.7 open article details
    await r.wait(1.3);
    await r.move({ sel: `${DIALOG} canvas`, ax: 0.18, ay: 0.4 }, { dur: 0.8 }); // 16.2 hover point
    await r.wait(1.3);
    await r.move({ sel: `${DIALOG} canvas`, ax: 0.55, ay: 0.55 }, { dur: 0.8 }); // 18.2 hover point
    await r.wait(1.0);
    await r.move({ text: "Views", exact: false, within: DIALOG }, { dur: 0.9 });  // 20.2
    await r.wait(0.6);
    await r.moveClick({ text: "Dwell", exact: false, within: DIALOG }, { dur: 0.9 }); // 22.2 Dwell tab
    await r.wait(0.8);
    await r.move({ sel: `${DIALOG} canvas`, ax: 0.42, ay: 0.6 }, { dur: 0.8 }); // 24.2 hover point
    await r.wait(1.1);
    await r.move({ text: "Yahoo URL", within: DIALOG }, { dur: 0.9 });  // 26.2
    await r.wait(1.1);
    await r.move({ text: "Document ID", within: DIALOG }, { dur: 0.7 }); // 28.2 tooltip
    await r.wait(1.2);
    await r.move({ sel: `${DIALOG} [aria-label='Close']`, dx: 10, dy: -30 }, { dur: 1.0 });
    await r.wait(0.4);
    await r.moveClick({ sel: `${DIALOG} [aria-label='Close']` }, { dur: 0.6 }); // 31.3 close
    await r.wait(0.4);
    await r.move({ x: 1438, y: 20 }, { dur: 0.7 });                     // 32.0 up to the corner
    await r.wait(1.3);                                                  // end 33.4
  },

  async Overview(r) {
    await r.open("/overview");
    await r.move({ sel: "[aria-label='Expand Business settings']" }, { dur: 0.05 }); await r.click(); await r.wait(0.4);
    r.place({ x: 1157, y: 347 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.2);                                                          // 0.0 idle
    await r.move({ text: "Views", exact: false, after: "Licenses" }, { dur: 0.9 }); // 2.2 hover Views card
    await r.wait(1.0);
    await r.move({ text: "Items published", exact: false }, { dur: 0.8 });     // 4.2
    await r.wait(1.0);
    await r.moveClick({ text: "Last 7 days" }, { dur: 0.8 });                  // 6.4 date chip
    await r.wait(0.6);
    await r.move({ text: "Last 24 hours" }, { dur: 0.7 });                     // 8.2
    await r.wait(0.4); await r.click();
    await r.wait(0.5);
    await r.move({ sel: "canvas", after: "Content items by publishing outcome", ax: 0.12, ay: 0.55 }, { dur: 0.8 }); // 10.2 tooltip
    await r.wait(1.1);
    await r.move({ sel: "canvas", after: "Content items by publishing outcome", ax: 0.5, ay: 0.5 }, { dur: 0.7 });    // 12.2
    await r.wait(1.1);
    await r.move({ sel: "tbody tr", after: "Ranked content", nth: 0, ax: 0.3 }, { dur: 0.8 });                       // 14.2
    await r.wait(0.6);
    await r.scroll(430, { dur: 0.8 });                                                                              // 15.2 down to Video
    await r.move({ sel: "canvas", after: "Video", ax: 0.22, ay: 0.4 }, { dur: 0.6 });                              // 16.2
    await r.wait(1.2);
    await r.move({ sel: "canvas", after: "Video", ax: 0.16, ay: 0.45 }, { dur: 0.6 });                             // 18.2
    await r.wait(0.8);
    await r.moveClick({ text: "Total watched minutes" }, { dur: 0.7 });        // 19.9
    await r.wait(1.0);
    await r.moveClick({ text: "Median view time" }, { dur: 0.7 });             // 22.0
    await r.wait(0.6);
    await r.move({ sel: "canvas", after: "Video", ax: 0.45, ay: 0.45 }, { dur: 0.7 });                             // 24.2
    await r.wait(0.9);
    await r.moveClick({ text: "Last 24 hours" }, { dur: 0.8 });                // 25.8 sticky date chip
    await r.wait(0.4);
    await r.move({ text: "Last 14 days" }, { dur: 0.5 }); await r.wait(0.3); await r.click(); // 26.9
    await r.wait(0.5);
    await r.move({ sel: "canvas", after: "Video", ax: 0.42, ay: 0.4 }, { dur: 0.7 });                              // 28.2
    await r.wait(0.6);
    await r.scroll(360, { dur: 0.8 });                                                                              // 29.4 to Brand comparison
    await r.move({ sel: "tbody tr", after: "Brand comparison", nth: 0, ax: 0.2 }, { dur: 0.6 });                    // 30.2
    await r.wait(1.1);
    await r.move({ sel: "tbody tr", after: "Brand comparison", nth: 1, ax: 0.2 }, { dur: 0.5 });                    // 32.2
    await r.wait(0.8);
    await r.moveClick({ sel: "[aria-label='Download']", after: "Brand comparison" }, { dur: 0.7 });                // 33.6 export menu
    await r.move({ text: "Download .xls" }, { dur: 0.5 });                     // 34.2
    await r.wait(0.8);
    await r.key("Escape");
    await r.move({ x: 810, y: 602 }, { dur: 0.6 });
    await r.moveClick({ sel: "[aria-label='Collapse menu']" }, { dur: 0.9 }); // 36.9 collapse sidebar
    await r.wait(0.6);
    await r.move({ x: 1226, y: 613 }, { dur: 0.8 });                           // 38.2
    await r.scroll(-900, { dur: 0.9 });                                         // back to top
    await r.moveClick({ sel: "[aria-label='Expand menu'],[aria-label='Collapse menu']" }, { dur: 0.9 }); // 40.4 expand
    await r.wait(0.5);
    await r.moveClick({ sel: "[aria-label='Search businesses']" }, { dur: 0.8 }); // 42.6 business picker
    await r.wait(0.7);
    await r.move({ text: "Datapulse Finance" }, { dur: 0.7 });                 // 44.2
    await r.wait(0.5); await r.click();                                        // 45.0
    await r.wait(0.5);
    await r.move({ x: 648, y: 174 }, { dur: 0.7 });                            // 46.2
    await r.wait(0.6);
    await r.move({ x: 1365, y: 602 }, { dur: 0.7 });
    await r.scroll(240, { dur: 0.8 });                                          // 48.2
    await r.wait(1.1);                                                          // end 49.6
  },

  async TopContent(r) {
    await r.open("/overview");
    r.place({ x: 255, y: 856 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.3);
    await r.moveClick({ text: "Content performance" }, { dur: 0.9 });          // 2.5 expand
    await r.wait(0.7);
    await r.move({ text: "Top content", within: "aside" }, { dur: 0.6 }); // 4.2
    await r.wait(0.4); await r.click();                                        // 4.8
    await r.wait(1.0);
    await r.moveClick({ text: "Last 7 days" }, { dur: 0.8 });                  // 7.0
    await r.wait(0.4);
    await r.move({ text: "Last 24 hours" }, { dur: 0.6 }); await r.wait(0.3); await r.click(); // 8.6
    await r.wait(0.5);
    await r.move({ sel: "tbody tr", nth: 0, ax: 0.22 }, { dur: 0.7 });          // 10.2
    await r.wait(0.5);
    await r.moveClick({ text: "Granularity" }, { dur: 0.6 });                  // 11.5
    await r.wait(0.9);
    await r.moveClick({ text: "Licenses" }, { dur: 0.6 });                     // 13.3
    await r.wait(0.8);
    await r.key("Escape");
    await r.moveClick({ sel: "tbody tr td:nth-child(2) button", nth: 0, ax: 0.15 }, { dur: 0.8 }); // 15.4 open row 1
    await r.wait(1.0);
    await r.moveClick({ re: "^last \\d+ (days|hours)$", within: DIALOG }, { dur: 0.8 });  // 17.4 modal date
    await r.wait(0.5);
    await r.move({ text: "Last 14 days" }, { dur: 0.5 }); await r.wait(0.3); await r.click(); // 18.9
    await r.wait(0.4);
    await r.move({ sel: `${DIALOG} canvas`, ax: 0.08, ay: 0.4 }, { dur: 0.7 }); // 20.2
    await r.wait(1.2);
    await r.move({ sel: `${DIALOG} canvas`, ax: 0.2, ay: 0.35 }, { dur: 0.5 });  // 22.2
    await r.wait(1.2);
    await r.moveClick({ text: "Uniques", exact: false, within: DIALOG }, { dur: 0.7 }); // 24.4
    await r.wait(0.9);
    await r.moveClick({ text: "Dwell", exact: false, within: DIALOG }, { dur: 0.7 });   // 26.2
    await r.wait(0.8);
    await r.move({ text: "Source feed", within: DIALOG }, { dur: 0.7 });       // 28.2
    await r.wait(1.1);
    await r.move({ text: "GUID", within: DIALOG }, { dur: 0.5 });              // 30.2 copy tooltip
    await r.wait(1.1);
    await r.moveClick({ text: "Delete", exact: false, within: DIALOG, sel: undefined }, { dur: 0.7 }); // 32.0 delete
    await r.wait(0.8);
    await r.moveClick({ text: "Please select reason", exact: false }, { dur: 0.6 }); // 33.6
    await r.wait(0.5);
    await r.move({ text: "Legal/rights issue" }, { dur: 0.4 }); await r.wait(0.3); await r.click(); // 35.0
    await r.wait(0.4);
    await r.moveClick({ text: "Delete", within: DIALOG }, { dur: 0.6 });       // 35.9
    await r.wait(0.4);
    await r.move({ x: 1226, y: 706 }, { dur: 0.9 });
    await r.wait(1.6);                                                          // toast, end 39.0
  },

  async KPIDeepDives(r) {
    await r.open("/overview");
    await setRange(r, "Last 24 hours");
    r.place({ x: 1157, y: 827 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.3);
    await r.move({ text: "Last 24 hours" }, { dur: 0.8 });                     // 2.2
    await r.wait(0.8);
    await r.move({ text: "Views", exact: false, after: "Licenses" }, { dur: 0.7 }); // 3.8
    await r.wait(0.5); await r.click();                                         // 4.5 open Views
    await r.wait(0.8);
    await r.move({ text: "Median views", exact: false }, { dur: 0.7 });        // 6.2
    await r.wait(0.4);
    await r.moveClick({ text: "Last 24 hours" }, { dur: 0.7 });                // 7.6
    await r.wait(0.3);
    await r.move({ text: "Last 7 days" }, { dur: 0.4 }); await r.wait(0.2); await r.click(); // 8.8
    await r.wait(0.4);
    await r.move({ sel: "canvas", ax: 0.5, ay: 0.7 }, { dur: 0.7 });           // 10.2
    await r.wait(0.8);
    await r.scroll(120, { dur: 0.5 });
    await r.move({ text: "Headline" }, { dur: 0.6 });                          // 12.2
    await r.wait(0.6);
    await r.moveClick({ text: "Region" }, { dur: 0.6 });                       // 13.4
    await r.wait(1.2);
    await r.moveClick({ sel: "[aria-label='Expand Content performance']" }, { dur: 0.9 }); // 15.4 open sub-menu
    await r.wait(0.3);
    await r.move({ text: "Views", within: "aside" }, { dur: 0.5 });        // 16.2
    await r.wait(0.5);
    await r.moveClick({ text: "Visitors", within: "aside" }, { dur: 0.5 }); // 17.3
    await r.wait(1.3);
    await r.moveClick({ text: "Uniques", within: "aside" }, { dur: 0.7 }); // 20.2
    await r.wait(1.3);
    await r.moveClick({ text: "Overview", within: "aside" }, { dur: 0.9 }); // 23.5
    await r.wait(0.8);
    await r.move({ text: "Video streams", exact: false, after: "Licenses" }, { dur: 0.9 }); // 26.2
    await r.wait(0.5); await r.click();                                         // 27.0
    await r.wait(0.5);
    await r.move({ sel: "canvas", ax: 0.62, ay: 0.55 }, { dur: 0.7 });          // 28.2
    await r.wait(1.1);
    if (await r.ev("!!document.querySelector(\"aside [aria-label='Expand Content performance']\")")) {
      await r.moveClick({ sel: "aside [aria-label='Expand Content performance']" }, { dur: 0.9 }); // 30.6
    } else await r.move({ text: "Content performance" }, { dur: 0.9 });
    await r.wait(0.7);
    await r.move({ text: "Video", within: "aside" }, { dur: 0.6 });        // 32.2
    await r.wait(1.0);                                                          // end 33.5
  },

  async IssueTrend(r) {
    await r.open("/feed-health/issues/missing-required-image-field/warning");
    await setRange(r, "Last 24 hours");
    await r.move({ sel: "canvas", ax: 0.04, ay: 0.3 }, { dur: 0.05 });
    await r.wait(0.4);
    r.start(r.outDir);
    await r.wait(0.9);                                                          // 0.2 tooltip on first bar
    await r.move({ sel: "canvas", ax: 0.38, ay: 0.45 }, { dur: 0.8 });          // 2.2
    await r.wait(0.9);
    await r.move({ sel: "canvas", ax: 0.33, ay: 0.55 }, { dur: 0.6 });          // 4.2
    await r.wait(0.9);
    await r.move({ text: "Content volume", exact: false }, { dur: 0.7 });      // 6.2
    await r.wait(0.8);
    await r.move({ x: 903, y: 544 }, { dur: 0.6 });
    await r.scroll(330, { dur: 0.8 });                                          // 8.2
    await r.wait(0.6);
    await r.scroll(420, { dur: 0.9 });                                          // 10.2
    await r.move({ sel: ".gap-6.py-5", after: "All content with warnings", nth: 1, ax: 0.25 }, { dur: 0.6 });
    await r.wait(0.4);
    await r.scroll(600, { dur: 0.9 });                                          // 12.2 bottom
    await r.wait(0.9);                                                          // end 13.7
  },

  async StoryDetails(r) {
    await r.open("/feed-health");
    await setRange(r, "Last 24 hours");
    r.place({ x: 1099, y: 382 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.0);
    await r.scroll(420, { dur: 0.9 });                                          // 2.2
    await r.wait(0.5);
    await r.scroll(560, { dur: 1.0 });                                          // 4.2 issues detected
    await r.move({ text: "Warning", inRow: "Stale sitemap detected" }, { dur: 0.9 }); // 6.2
    await r.wait(0.6); await r.click();                                         // 7.0 open warning
    await r.wait(0.8);
    await r.moveClick({ text: "Content warning: Restricted word", within: DIALOG }, { dur: 0.7 }); // 8.7 expand
    await r.wait(0.5);
    await r.move({ text: "Our system detected a restricted word", exact: false, within: DIALOG, ax: 0.3 }, { dur: 0.8 }); // 10.2
    await r.wait(1.0);
    await r.move({ text: "Content excerpt", within: DIALOG, dy: 40, dx: 160 }, { dur: 0.8 });    // 12.2
    await r.wait(0.8);
    await r.moveClick({ sel: `${DIALOG} [aria-label='Close']` }, { dur: 0.8 }); // 13.8 close
    await r.move({ sel: "canvas", after: "Content items by publishing outcome", ax: 0.7, ay: 0.6 }, { dur: 0.6 }); // 14.2
    await r.wait(0.8);
    await r.moveClick({ text: "Failure", inRow: "High 5xx response rate" }, { dur: 0.8 }); // 16.0 open failure
    await r.wait(0.9);
    await r.move({ text: "This item", exact: false, within: DIALOG, ax: 0.2 }, { dur: 0.6 }); // 18.2
    await r.wait(1.1);
    await r.move({ text: "View documentation", within: DIALOG }, { dur: 0.9 }); // 20.2
    await r.wait(1.0);
    await r.move({ sel: `${DIALOG} [aria-label='Close']` }, { dur: 0.9 });   // 22.2
    await r.wait(0.3); await r.click();
    await r.wait(0.5);
    await r.move({ text: "High tragedy score" }, { dur: 0.8 }); // 24.2
    await r.wait(0.9);
    await r.move({ text: "Failure", inRow: "Unexpected drop in items ingested" }, { dur: 0.8 }); // 26.2
    await r.wait(1.0);
    await r.click();                                                            // 28.6 another failure
    await r.wait(1.2);
    await r.move({ sel: `${DIALOG} [aria-label='Close']` }, { dur: 0.9 });   // 32.2
    await r.wait(0.4); await r.click();
    await r.wait(0.4);
    await r.scroll(-500, { dur: 0.9 });                                         // 34.2
    await r.wait(0.4);                                                          // end 35.5
  },

  async FeedHealth(r) {
    await r.open("/feed-health");
    r.place({ x: 1180, y: 330 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.3);
    await r.move({ text: "Content success rate", exact: false }, { dur: 0.9 });          // 2.2
    await r.wait(0.5);
    await r.move({ sel: "[aria-label='About Content success rate']" }, { dur: 0.5 }); // 4.2 info tooltip
    await r.wait(1.2);
    await r.move({ sel: "[aria-label='About Published with warnings']" }, { dur: 0.8 }); // 6.2
    await r.wait(1.0);
    await r.move({ x: 900, y: 560 }, { dur: 0.5 });
    await r.scroll(380, { dur: 0.9 });                                                    // 8.2 feeds list
    await r.wait(0.5);
    await r.scroll(420, { dur: 0.9 });                                                    // 10.2 outcome chart
    await r.move({ sel: "canvas", after: "Content items by publishing outcome", ax: 0.22, ay: 0.55 }, { dur: 0.6 });
    await r.wait(0.8);
    await r.scroll(360, { dur: 0.8 });                                                    // 12.2 issues
    await r.move({ sel: "tbody tr", after: "Issues detected", nth: 1, ax: 0.32 }, { dur: 0.6 });
    await r.wait(0.8);
    await r.move({ text: "Failure", inRow: "High tragedy score" }, { dur: 0.7 });         // 14.2
    await r.wait(0.6); await r.click();                                                   // 15.0 failure pop-up
    await r.wait(1.0);
    await r.moveClick({ text: "Missing required field", within: DIALOG, nth: 0 }, { dur: 0.8 }); // 16.9 expand row
    await r.wait(0.9);
    await r.move({ text: "Content wasn't assembled", within: DIALOG, nth: 0 }, { dur: 0.9 });    // 20.2
    await r.wait(0.4); await r.click();                                                   // 21.0
    await r.wait(0.5);
    await r.move({ text: "View documentation", within: DIALOG, nth: 0 }, { dur: 0.7 });   // 22.2
    await r.wait(0.6);
    await r.moveClick({ sel: `${DIALOG} [aria-label='Close']` }, { dur: 0.7 });       // 23.6 close
    await r.move({ x: 960, y: 420 }, { dur: 0.6 });                                       // 24.2
    await r.scroll(-620, { dur: 1.0 });                                                   // 26.2 back up to feeds
    await r.move({ sel: "tbody tr", after: "List of feeds", nth: 5, ax: 0.3 }, { dur: 0.7 });
    await r.wait(0.6);
    await r.move({ text: "Yahoo Sports · EN · US", after: "List of feeds" }, { dur: 0.7 }); // 28.2
    await r.wait(0.5); await r.click();                                                   // 29.4 open feed
    await r.until("/^\\/feed-health\\/[^/]+$/.test(location.pathname)");
    await r.wait(0.8);
    await r.moveClick({ text: "Last 7 days" }, { dur: 0.8 });                             // 31.4
    await r.wait(0.4);
    await r.move({ text: "Last 24 hours" }, { dur: 0.5 }); await r.wait(0.3); await r.click(); // 32.8
    await r.wait(0.5);
    await r.move({ sel: "canvas", after: "Feed reliability", ax: 0.35, ay: 0.3 }, { dur: 0.7 }); // 34.2
    await r.wait(0.8);
    await r.moveClick({ text: "Last 24 hours" }, { dur: 0.7 });                           // 35.9
    await r.wait(0.3);
    await r.move({ text: "Last 14 days" }, { dur: 0.5 }); await r.wait(0.2); await r.click(); // 37.0
    await r.wait(0.4);
    await r.move({ sel: "canvas", after: "Feed reliability", ax: 0.5, ay: 0.45 }, { dur: 0.7 }); // 38.2
    await r.wait(1.0);
    await r.move({ sel: "canvas", after: "Feed reliability", ax: 0.37, ay: 0.62 }, { dur: 0.6 }); // 40.2
    await r.wait(0.6);
    await r.scroll(520, { dur: 0.9 });                                                    // 42.2 issues
    await r.move({ text: "Warning", inRow: "Stale sitemap detected" }, { dur: 0.6 });
    await r.wait(0.5); await r.click();                                                   // 43.3 warning pop-up
    await r.wait(0.5);
    await r.moveClick({ text: "Content warning: Restricted word", within: DIALOG }, { dur: 0.6 });
    await r.move({ text: "Yahoo URL", within: DIALOG }, { dur: 0.8 });                    // 46.2
    await r.wait(1.0);
    await r.move({ text: "Content excerpt", within: DIALOG, dx: 180, dy: 50 }, { dur: 0.8 }); // 48.2
    await r.wait(0.8);
    await r.key("Escape");                                                                // 50.0 close
    await r.move({ x: 1300, y: 560 }, { dur: 0.5 });
    await r.scroll(-900, { dur: 0.9 });
    await r.moveClick({ text: "Feed health", within: "main" }, { dur: 0.9 });            // 52.8 breadcrumb
    await r.until("location.pathname === '/feed-health'");
    await r.wait(0.3);
    await r.scroll(380, { dur: 0.7 });
    await r.move({ sel: "tbody tr", after: "List of feeds", nth: 2, ax: 0.4 }, { dur: 0.6 }); // 54.2
    await r.wait(0.4); await r.click();                                                   // 55.2 open another feed
    await r.until("/^\\/feed-health\\/[^/]+$/.test(location.pathname)");
    await r.wait(0.8);
    await r.move({ text: "Published", nth: 0, after: "Licenses" }, { dur: 0.8 });         // 58.2
    await r.wait(1.1);
    await r.move({ sel: "[aria-label='About Published with warnings']" }, { dur: 0.7 }); // 60.2
    await r.wait(0.9);
    await r.moveClick({ sel: "[aria-label='Download']", after: "Feed reliability" }, { dur: 0.8 }); // 61.9 export
    await r.wait(0.9);
    await r.key("Escape");
    await r.move({ sel: "canvas", after: "Feed reliability", ax: 0.62, ay: 0.7 }, { dur: 0.7 }); // 64.2
    await r.wait(0.8);
    await r.scroll(600, { dur: 1.0 });                                                    // 66.2
    await r.wait(0.4);
    await r.scroll(420, { dur: 0.9 });                                                    // 68.2 recent items
    await r.move({ sel: ".gap-6.py-5", after: "Most recent items", nth: 2, ax: 0.45 }, { dur: 0.6 });
    await r.wait(0.6);
    await r.scroll(420, { dur: 0.9 });                                                    // 70.2
    await r.wait(0.4);
    await r.scroll(700, { dur: 1.0 });                                                    // 72.2 bottom
    await r.wait(0.9);                                                                    // end 73.3
  },

  async Takedowns(r) {
    await r.open("/feed-health");
    await r.move({ sel: "[aria-label='Search businesses']" }, { dur: 0.05 }); await r.click(); await r.wait(0.5);
    await r.move({ text: "Datapulse Finance" }, { dur: 0.05 }); await r.click(); await r.wait(0.6);
    await setRange(r, "Last 14 days");
    await r.move({ text: "Yahoo News · EN · US", after: "List of feeds" }, { dur: 0.05 }); await r.click();
    await r.until("/^\\/feed-health\\/[^/]+$/.test(location.pathname)"); await r.wait(1.2);
    r.place({ x: 775, y: 168 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.0);
    await r.scroll(330, { dur: 0.9 });                                                    // 2.2 reliability
    await r.move({ sel: "canvas", after: "Feed reliability", ax: 0.62, ay: 0.3 }, { dur: 0.6 });
    await r.wait(0.5);
    await r.scroll(420, { dur: 0.9 });                                                    // 4.2 issues
    await r.move({ x: 1234, y: 170 }, { dur: 0.7 });
    await r.scroll(420, { dur: 0.9 });                                                    // 6.2 recent items
    await r.wait(0.4);
    await r.scroll(300, { dur: 0.8 });                                                    // 8.2
    await r.move({ sel: ".gap-6.py-5", after: "Most recent items", nth: 2, ax: 0.08 }, { dur: 0.9 }); // 10.2
    await r.wait(0.6); await r.click();                                                   // 11.0 open item
    await r.wait(0.9);
    await r.moveClick({ re: "^last \\d+ (days|hours)$", within: DIALOG }, { dur: 0.6 });
    await r.move({ text: "Last 7 days" }, { dur: 0.3 }); await r.wait(0.2); await r.click();
    await r.move({ sel: `${DIALOG} canvas`, ax: 0.18, ay: 0.25 }, { dur: 0.6 });    // 14.2
    await r.wait(1.0);
    await r.move({ text: "Delete", exact: false, within: DIALOG }, { dur: 0.9 });        // 16.2
    await r.wait(0.4); await r.click();
    await r.wait(0.5);
    await r.moveClick({ text: "Please select reason", exact: false }, { dur: 0.5 });      // 17.8 reason list
    await r.wait(0.7);
    await r.move({ text: "Content quality issue" }, { dur: 0.4 });
    await r.scroll(140, { dur: 0.6 });
    await r.move({ text: "Wrong Feed" }, { dur: 0.4 });                     // 20.2
    await r.wait(0.9);
    await r.move({ text: "Outdated" }, { dur: 0.5 });                       // 22.2
    await r.wait(0.3); await r.click();
    await r.wait(0.3);
    await r.moveClick({ text: "Delete", within: DIALOG }, { dur: 0.6 });                  // 23.6 confirm
    await r.wait(0.4);
    await r.move({ x: 1340, y: 835 }, { dur: 0.6 });                                      // 24.2 toast
    await r.wait(0.9);                                                                    // end 25.9
  },

  async UserManagement(r) {
    await r.open("/overview");
    r.place({ x: 340, y: 360 });
    await r.wait(0.3);
    r.start(r.outDir);
    await r.wait(1.0);
    await r.moveClick({ sel: "[aria-label='Expand Business settings']" }, { dur: 0.9 }); // 2.2
    await r.wait(0.6);
    await r.moveClick({ text: "User management" }, { dur: 0.6 });                         // 3.6
    await r.wait(0.9);
    await r.move({ sel: "tbody tr", nth: 2, ax: 0.45 }, { dur: 0.8 });                    // 6.2
    await r.wait(0.5);
    await r.moveClick({ text: "Taylor Labadie" }, { dur: 0.5 });                          // 7.4
    await r.wait(0.8);
    await r.move({ text: "Non-employee", exact: false }, { dur: 0.7 });                   // 8.2
    await r.wait(0.9);
    await r.move({ sel: "[aria-label='Expand Yahoo Partner Portal']" }, { dur: 0.8 });    // 10.2
    await r.wait(0.5); await r.click();                                                   // 10.8 expand
    await r.wait(0.5);
    await r.scroll(260, { dur: 0.8 });
    await r.move({ text: "Operational access" }, { dur: 0.6 });                           // 12.2
    await r.wait(0.5);
    await r.moveClick({ text: "Admin", after: "Operational access" }, { dur: 0.6 });      // 13.5 role list
    await r.wait(0.8);
    await r.moveClick({ text: "Admin", within: "[role=listbox]" }, { dur: 0.5 });         // keep Admin
    await r.wait(0.4);
    await r.move({ sel: "input[role=combobox]", after: "Brand access", ax: 0.5 }, { dur: 0.7 }); // 16.2 brands field
    await r.wait(0.3); await r.click();                                                   // 17.0 open list
    await r.wait(0.3);
    await r.scroll(240, { dur: 0.6 });                                                    // bring the list on screen
    await r.move({ text: "Datapulse Sports", within: "[role=listbox]" }, { dur: 0.5 });      // 18.2
    await r.wait(0.5);
    await r.moveClick({ text: "Datapulse Finance", within: "[role=listbox]" }, { dur: 0.6 }); // 19.3 add Finance
    await r.wait(0.9);
    await r.key("Escape");
    await r.moveClick({ text: "Save changes" }, { dur: 0.8 });                            // 22.4 save
    await r.wait(0.4);
    await r.move({ x: 1180, y: 1000 }, { dur: 0.6 });                                     // 24.2 toast
    await r.wait(0.9);
    await r.moveClick({ text: "User management" }, { dur: 1.0 });                         // 26.8
    await r.wait(1.4);
    await r.move({ text: "Add user" }, { dur: 1.0 });                                     // 30.2
    await r.wait(0.3); await r.click();                                                   // 30.8
    await r.wait(0.7);
    await r.moveClick({ text: "Yahoo Partner Portal" }, { dur: 0.8 });                    // 32.4 try to assign
    await r.wait(0.6);
    await r.moveClick({ text: "Employee (full-time or contract)", exact: false }, { dur: 0.8 }); // 34.6
    await r.wait(0.5);
    await r.moveClick({ sel: "[aria-label='Expand Yahoo Partner Portal']" }, { dur: 0.6 }); // 35.8 expand
    await r.wait(0.6);
    await r.moveClick({ text: "Brand access" }, { dur: 0.8 });                            // 37.4
    await r.wait(0.6);
    await r.move({ sel: "input[role=combobox]", after: "Brand access", ax: 0.5 }, { dur: 0.7 }); // 39.4
    await r.wait(0.2); await r.click();                                                   // 40.0 open list
    await r.wait(0.5);                                                                    // end 40.6
  },
};
