# LinkedIn Post Drafts — India UPI & K-Economy Atlas

## Short post (~200 words)

I built an interactive atlas mapping India's UPI adoption across all 36 states and union territories.

Not just how much digital money moves — but where UPI runs deepest in everyday life.

The project combines:
→ 3D interactive globe with state-level choropleth
→ Volume vs intensity analysis (market size ≠ per-capita adoption)
→ K-Economy composite score (UPI + rural wages + MGNREGA demand)
→ Full analytical report with the Goa anomaly case study

Key finding: In one month, India processed ~13 billion UPI transactions — but intensity ranges from 23.9 txn/person in Goa to 3.9 in Bihar. Maharashtra dominates volume; small states often lead on depth.

Explore the live demo:
https://ritiksunia.github.io/India--UPI-K-Economy/

Code & report on GitHub:
https://github.com/RitikSunia/India--UPI-K-Economy

Built with React, Three.js, and real NPCI/RBI state data.

#UPI #DigitalIndia #DataVisualization #React #ThreeJS #Fintech #India #OpenData #KEconomy #DataAnalytics

---

## Long post (~450 words)

India's UPI story is usually told in billions of transactions. I wanted to tell it state by state.

So I built the India UPI & K-Economy Interactive Atlas — a 3D data explorer covering all 36 states and UTs with real NPCI/RBI ecosystem data (May 2026 reference month).

What it does

The atlas separates two questions that often get conflated:

1. Volume — Where is the UPI market largest? (Maharashtra alone: 17.4% of national transactions)
2. Intensity — Where is UPI woven into daily life? (Goa: 23.9 transactions per person per month vs national average of 9.1)

Seven views: national overview, 3D globe, state rankings, scatter plot, state detail profiles, methodology, and K-Economy dashboard with CPI/Sensex/GDP context.

The Goa anomaly

Goa ranks #1 on per-capita UPI intensity but contributes only 0.29% of national volume. India's smallest state by population creates an extreme per-capita signal — tourism, remittances, and a tiny denominator all play a role. The atlas includes a toggle to include or exclude Goa from comparative analysis, because outliers should be visible, not hidden.

K-Economy framework

Beyond UPI, a composite score blends digital payment depth with rural wage levels and inverse MGNREGA demand — capturing how digital and labour-market conditions align across states. Rajasthan, for example, ranks 7th by UPI volume but 29th on K-Economy — lots of transactions, shallow per-capita adoption, high rural employment-programme demand.

Try it

Live demo: https://ritiksunia.github.io/India--UPI-K-Economy/
GitHub: https://github.com/RitikSunia/India--UPI-K-Economy
Full report in the repo docs/

Stack: React 19, React Three Fiber, GSAP, Zustand, Vite. Earth textures via CDN; dataset pipeline from raw UPI + MGNREGA + population projections.

If you work in fintech, policy, or development economics — I'd welcome your feedback on the framework and findings.

#UPI #DigitalIndia #DataVisualization #React #ThreeJS #Fintech #India #OpenData #KEconomy #DataAnalytics #MGNREGA #Economics

---

## Carousel slide outline (6 slides)

**Slide 1 — Hook**
Title: India's UPI Revolution Isn't Even
Visual: Globe screenshot
Text: 13 billion transactions/month nationally — but adoption depth varies 6× between states.

**Slide 2 — Volume vs Intensity**
Title: Two Different Questions
Visual: Scatter plot screenshot
Text: Maharashtra leads volume. Goa leads intensity. Only 2 states top both lists.

**Slide 3 — The Goa Anomaly**
Title: When Small States Distort Rankings
Visual: Goa state panel
Text: #1 per-capita (23.9 txn/person) · 0.29% national volume · Toggle to include/exclude

**Slide 4 — K-Economy**
Title: Digital + Labour Combined
Visual: K-Economy dashboard
Text: UPI intensity + rural wages + MGNREGA demand = composite state score

**Slide 5 — Rajasthan Example**
Title: Volume ≠ Depth
Text: 7th by volume · 6.9 txn/person · K-Economy rank #29

**Slide 6 — CTA**
Title: Explore the Atlas
Links: Live demo + GitHub
QR or URL: ritiksunia.github.io/India--UPI-K-Economy

---

## Posting tips

1. Add 2–3 screenshots (Overview, Globe, Rankings) before publishing
2. Pin a comment with direct links to demo + report
3. Best posting times (India): Tue–Thu, 8–10 AM IST
4. Tag NPCI / RBI only if you want institutional visibility (optional)
