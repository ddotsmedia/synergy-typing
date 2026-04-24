# Service Catalogue — Abu Dhabi Typing Centre (seed-data reference)

> Handed to Claude Code in STEP 2 as the source for `packages/db/seed/services.ts`. Every fee marked `TO VERIFY` — Claude Code will use placeholder values and flag them until you confirm from the live Synergy site or the official government portal.

## Immigration & Residency (ICA / GDRFA)

1. Employment Residence Visa — new
2. Employment Residence Visa — renewal
3. Employment Residence Visa — cancellation
4. Family Residence Visa — spouse
5. Family Residence Visa — children
6. Family Residence Visa — parents
7. Visit Visa — 30 days / 90 days
8. Golden Visa application
9. Investor / Partner Visa
10. Emirates ID — new
11. Emirates ID — renewal
12. Emirates ID — replacement (lost / damaged)
13. Entry Permit — new / extension

## Labour (MOHRE / Tas'heel)

14. Work Permit — new
15. Work Permit — renewal
16. Work Permit — cancellation
17. Labour Contract — new / amendment
18. Wage Protection System registration
19. Domestic Helper Visa
20. Tawjeeh worker-awareness typing

## Company Formation & PRO

21. Mainland Trade Licence — new
22. Mainland Trade Licence — renewal
23. Freezone Licence (liaison with freezone authority)
24. Chamber of Commerce membership
25. Corporate Sponsorship
26. PRO services retainer

## Transport (ADP / ITC)

27. Driving Licence — new (theory + road test support)
28. Driving Licence — renewal
29. Driving Licence — transfer from foreign licence
30. Vehicle Registration (Mulkiya) — new / renewal / transfer
31. Traffic File opening
32. Number Plate reservation / auction

## Real Estate (TAMM / ADM)

33. Tawtheeq tenancy registration
34. ADDC utility connection
35. Completion certificate

## Attestation & Translation

36. MOFA attestation
37. MOE certificate attestation
38. Embassy attestation
39. Legal translation (AR <-> EN)

## Medical & Insurance

40. Medical fitness typing (pre-visa)
41. Health insurance typing (Daman / Thiqa / private)

## Other TAMM / Amer / Tas'heel

42. Good Conduct Certificate (police clearance)
43. VAT registration (FTA)
44. Misc. TAMM e-services

---

## Schema Claude Code should use per service

```ts
{
  slug: string,
  title: { en: string, ar: string },
  shortDescription: { en: string, ar: string },
  longDescription: { en: string, ar: string }, // 2 paragraphs each
  authority: "MOHRE" | "ICA" | "TAMM" | "ADP" | "ADM" | "MOFA" | "MOE" | "FTA" | "OTHER",
  category: string, // one of the 8 above
  requiredDocuments: Array<{
    name: { en: string, ar: string },
    format: string,           // PDF/JPEG/etc
    sizeMaxMB: number,
    rulesNotes: { en: string, ar: string },
  }>,
  fees: {
    governmentFeeAED: number,   // TO VERIFY
    serviceFeeAED: number,      // TO VERIFY
    vatIncluded: boolean,
    urgentUpchargeAED?: number,
  },
  processingTimeDays: { min: number, max: number },
  eligibility: { en: string, ar: string },
  requiresVisit: boolean,           // if customer must appear in branch
  allowsOnlineSubmission: boolean,
  tags: string[],
  isFeatured: boolean,
}
```

## FAQs to seed (per category, 4-6 each)

- What documents do I need for X?
- How long does X take?
- Can I apply for X online?
- What if I don't have document Y?
- How much is the government fee vs service fee?
- Can I track the status of X?

---

### Note on fees

All numeric fees are `TO VERIFY` placeholders until confirmed. Typing centres in the UAE are regulated on what service fees they can charge; **do not publish live fees without confirming against the current Synergy Typing pricing list and the official government portal**. The admin panel's service / fee CMS is there so you can update these without another deploy.
