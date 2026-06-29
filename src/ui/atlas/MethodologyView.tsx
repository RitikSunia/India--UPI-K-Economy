import { ViewHeader } from './AtlasComponents'

export function MethodologyView() {
  return (
    <section className="view-card">
      <ViewHeader kicker="Methodology" title="What this atlas can and cannot claim">
        A finished UPI state-level study with K-Economy composite scoring. District-level detail is
        intentionally excluded to keep the report national and state-level.
      </ViewHeader>
      <div className="method-grid">
        <article>
          <h3>Sources</h3>
          <p>UPI state totals: NPCI/RBI statewise UPI ecosystem extract (reference month in dataset).</p>
          <p>Population: MoHFW population projections for states and UTs, 2026.</p>
          <p>Rural wages: MGNREGA wage rates, FY 2022–23.</p>
          <p>MGNREGA demand: Person-days by state, FY 2023–24.</p>
        </article>
        <article>
          <h3>Formulas</h3>
          <p>Transactions per person = UPI transactions ÷ projected population.</p>
          <p>Value per person = UPI value (₹ cr) × 10,000,000 ÷ projected population.</p>
          <p>National share = state transactions ÷ all-state transactions.</p>
          <p>
            K-Economy score = 40% UPI per capita rank + 30% wage rank + 30% inverse MGNREGA rank
            (0–100).
          </p>
        </article>
        <article>
          <h3>Limitations</h3>
          <p>One month is a cross-section, not a causal trend.</p>
          <p>Population is projected, not a current census enumeration.</p>
          <p>Some UTs lack wage or MGNREGA series — shown as missing data.</p>
        </article>
        <article>
          <h3>K-economy note</h3>
          <p>
            CPI, Sensex, and GDP macro series provide national context. They do not directly enter
            the state K-Economy score except through the three state-level indicators.
          </p>
        </article>
      </div>
    </section>
  )
}
