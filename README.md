An optimized, production-ready genetic health interpretation engine that scans raw DNA exports (like 23andMe) and generates interactive, bilingual (English + Hindi) health insight reports in real-time. Built specifically to handle large-scale genomic data under serverless hosting constraints.

---

## 🛠️ How It Works (System Architecture)

Processing raw genome files (~20MB, 600,000+ lines of text) on free serverless platforms (like Vercel Hobby) presents two key engineering challenges:
1. **Request Timeouts:** Serverless functions have a strict 10-second execution limit.
2. **Payload Limits:** Maximum POST request payload size is 4.5MB.

To circumvent these limits, this application employs a **hybrid browser-edge processing architecture**:

```
[ User Browser ]                                    [ Vercel Edge Serverless ]
┌──────────────────────────────┐                   ┌──────────────────────────────┐
│ 1. Local File Upload         │                   │                              │
│ 2. Chunked Stream Parsing    │   ~1KB Genotypes  │                              │
│    (FileReader API, <100ms)   │ ────────────────▶ │                              │
│ 3. Filter against Local JSON │    (POST payload) │                              │
│    ClinVar SNP Index (27)    │                   │                              │
│                              │                   │ 4. Groq Llama-3.3-70B        │
│                              │                   │    Streaming Analysis        │
│ 5. Streams & Renders         │ ◀─── text/event ─ │                              │
│    Markdown Progressive UI   │        stream     │                              │
└──────────────────────────────┘                   └──────────────────────────────┘
```

1. **Client-Side Stream Parsing:** The raw `.txt` file never leaves the user's browser. The application streams the file locally using the browser's `FileReader` API, parsing it line-by-line in under 100 milliseconds.
2. **Index Filtering:** The parsed SNPs are cross-referenced with a local catalog of 27 high-impact, clinically relevant markers (Methylation, Lipid metabolism, Cardiovascular, Inflammation).
3. **Payload Reduction:** The frontend sends a clean, filtered JSON payload containing only matching risk genotypes (~1KB) instead of the raw 20MB file.
4. **Edge Streaming Completion:** The edge function streams response tokens from the Groq API back to the client as they generate, bypassing serverless idle timeouts.

---

## ✨ Features

- 🔒 **Absolute Privacy:** 100% client-side file parsing. Zero genomic data persists on any server.
- ⚡ **Sub-Second Processing:** Near-instant client-side parsing of half a million database rows.
- 🤖 **Bilingual Agentic Reports:** Real-time generation of custom wellness and lifestyle guides in English and Hindi (Devanagari script), using the ultra-fast `llama-3.3-70b-versatile` model.
- 🚦 **Priority Risk Ranking:** Matches are automatically categorized and sorted by clinical severity (🔴 High, 🟡 Moderate, 🟢 Low) so action items are addressed sequentially.
- 📑 **Rich UI Layout:** Elegant glassmorphic dashboard built using TailwindCSS, React, Lucide Icons, and React-Markdown for rendering interactive reports.
