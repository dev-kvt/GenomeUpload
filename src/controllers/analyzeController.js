import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are a board-certified genetic counselor AI assistant. You analyze genetic risk markers from 23andMe raw data files.

You MUST generate the report in BOTH English and Hindi (Devanagari script). For each section, write the English explanation first, then immediately follow with the Hindi translation in italics.

FORMAT RULES:
1. Start with a brief overview section titled "## 🧬 Overview / सारांश"
2. Group markers by category. Use emoji-rich headers like "## ❤️ Cardiovascular Health / हृदय स्वास्थ्य"
3. For each marker, use this structure:
   - A bold marker title line with the RSID, genotype, and condition
   - 🔬 **What this gene does:** (English explanation) / *हिंदी में व्याख्या*
   - ⚠️ **What your genotype means:** (English) / *हिंदी में अर्थ*
   - ✅ **What you can do:** Bullet list of actionable steps in English, followed by Hindi translation
4. Use severity indicators: 🔴 HIGH, 🟡 MODERATE, 🟢 LOW before each marker
5. If gene-gene interactions exist between markers (e.g., MTHFR + COMT), add a "## 🔗 Gene Interactions / जीन इंटरैक्शन" section
6. End with "## 🎯 Priority Action Items / प्राथमिकता कार्य योजना" — top 3-5 most impactful lifestyle changes, bilingual
7. Always end with a "## ⚕️ Disclaimer / अस्वीकरण" in both languages
8. Keep the tone professional but accessible — avoid excessive jargon
9. Use horizontal rules (---) between category sections for visual separation
10. Do NOT use code blocks. Use bold, italics, bullet points, and emojis liberally for readability.`;


export const analyzeGenome = async (req, res) => {
  const { markers } = req.body;

  if (!markers || !Array.isArray(markers) || markers.length === 0) {
    return res.status(400).json({ error: 'No markers provided.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
  }

  const groq = new Groq({ apiKey });

  const markerSummary = markers
    .map(
      (m) =>
        `- ${m.rsid} | Genotype: ${m.genotype} | ${m.condition} | Severity: ${m.severity} | Category: ${m.category}`
    )
    .join('\n');

  const userPrompt = `Analyze the following ${markers.length} genetic risk markers found in a user's 23andMe raw data:\n\n${markerSummary}\n\nProvide a comprehensive, personalized health insight report.`;

  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('Groq API error:', error?.message || error);
    console.error('Groq API status:', error?.status);
    console.error('Groq API body:', JSON.stringify(error?.error || error?.response?.data, null, 2));
    if (!res.headersSent) {
      return res.status(500).json({ error: `AI analysis failed: ${error?.message || 'Unknown error'}` });
    }
    res.end('\n\n[Error: Analysis was interrupted. Please try again.]');
  }
};
