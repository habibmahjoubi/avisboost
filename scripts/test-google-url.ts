import { toGoogleWriteReviewUrl } from "../src/lib/utils";

const tests: [string, string][] = [
  ["Place ID brut", "ChIJD7fiBh9u5kcRYJSMaMOCCwQ"],
  ["writereview directe", "https://search.google.com/local/writereview?placeid=ChIJD7fiBh9u5kcRYJSMaMOCCwQ"],
  ["Maps longue avec hex", "https://www.google.com/maps/place/Boulangerie/@48.8,2.3,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e2964e34e2d:0x48d8c9d45f3e8c41!8m2"],
  ["Maps SANS hex (juste coordonnées)", "https://www.google.com/maps/place/Boulangerie/@48.8,2.3,17z/"],
  ["maps.app.goo.gl (lien court Partager)", "https://maps.app.goo.gl/abc123xyz"],
  ["Google Search avec lrd", "https://www.google.com/search?q=boulangerie#lrd=0x47e66e2964e34e2d:0x48d8c9d45f3e8c41,1"],
  ["g.page review", "https://g.page/r/CUGMPl_JyNhI/review"],
  ["place_id dans query param", "https://www.google.com/maps/place/?q=place_id:ChIJD7fiBh9u5kcRYJSMaMOCCwQ"],
  // Tests réels de l'utilisateur
  ["Google Search (maison cloarec)", "https://www.google.com/search?q=maison+cloarec&sca_esv=1a21c3da2ea2dcfe&hl=fr&sxsrf=ANbL-n7DJJoQ237iNzZ-NWlATp1bMG5iXg%3A1776007918369&source=hp&ei=7rrbafPXFIqmkdUP0MHn4Q0"],
  ["Google Maps (maison cloarec)", "https://www.google.com/maps/place/Maison+Cloarec/@47.2232406,-1.6156836,17z/data=!3m1!4b1!4m6!3m5!1s0x4805ed08046de4f7:0x9946a68021666b19!8m2!3d47.223237!4d-1.6131087!16s%2Fg%2F11ndwbd4qb?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D"],
];

console.log("Test de conversion des URLs Google → writereview\n");

let pass = 0;
let fail = 0;

for (const [label, url] of tests) {
  const result = toGoogleWriteReviewUrl(url);
  const ok = result.includes("writereview?placeid=") || result.includes("/review");
  if (ok) {
    console.log(`  ✅ ${label}`);
    console.log(`     → ${result}`);
    pass++;
  } else {
    console.log(`  ❌ ${label}`);
    console.log(`     Input:  ${url}`);
    console.log(`     Output: ${result || "(vide)"}`);
    fail++;
  }
}

console.log(`\nRésultat: ${pass} OK, ${fail} ECHEC`);
if (fail > 0) process.exit(1);
