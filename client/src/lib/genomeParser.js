/**
 * Client-side genome file parser.
 * Parses 23andMe raw data files directly in the browser,
 * matching against a curated database of clinically relevant SNPs.
 * Only matched risk markers are returned (~1KB payload).
 */

const healthDatabase = new Map([
  // Methylation & Folate Metabolism
  ['rs1801133', { risk_genotype: 'TT', condition: 'MTHFR C677T – Reduced Folate Metabolism', category: 'Methylation', severity: 'moderate' }],
  ['rs1801131', { risk_genotype: 'AC', condition: 'MTHFR A1298C – Impaired BH4 Recycling', category: 'Methylation', severity: 'low' }],
  ['rs1051266', { risk_genotype: 'GG', condition: 'SLC19A1 – Reduced Folate Transport', category: 'Methylation', severity: 'low' }],

  // Neurotransmitter Metabolism
  ['rs4680', { risk_genotype: 'AA', condition: 'COMT Val158Met – Slow Dopamine/Estrogen Breakdown', category: 'Neurotransmitter', severity: 'moderate' }],
  ['rs6265', { risk_genotype: 'TT', condition: 'BDNF Val66Met – Reduced Neuroplasticity Factor', category: 'Neurotransmitter', severity: 'moderate' }],
  ['rs1800497', { risk_genotype: 'TT', condition: 'DRD2/ANKK1 Taq1A – Reduced Dopamine Receptor Density', category: 'Neurotransmitter', severity: 'moderate' }],

  // B12 & Homocysteine
  ['rs1801394', { risk_genotype: 'GG', condition: 'MTRR A66G – Impaired B12 Recycling', category: 'B-Vitamins', severity: 'low' }],
  ['rs602662', { risk_genotype: 'GG', condition: 'FUT2 – Reduced B12 Absorption', category: 'B-Vitamins', severity: 'moderate' }],

  // Detoxification & Drug Metabolism
  ['rs762551', { risk_genotype: 'CC', condition: 'CYP1A2 – Slow Caffeine Metabolizer', category: 'Detoxification', severity: 'low' }],
  ['rs1229984', { risk_genotype: 'AA', condition: 'ADH1B – Fast Alcohol → Acetaldehyde', category: 'Detoxification', severity: 'moderate' }],
  ['rs671', { risk_genotype: 'AA', condition: 'ALDH2 – Alcohol Flush / Acetaldehyde Buildup', category: 'Detoxification', severity: 'high' }],

  // Cardiovascular
  ['rs10757278', { risk_genotype: 'GG', condition: '9p21.3 – Elevated Coronary Artery Disease Risk', category: 'Cardiovascular', severity: 'high' }],
  ['rs1333049', { risk_genotype: 'CC', condition: '9p21.3 – Additional CAD Risk Locus', category: 'Cardiovascular', severity: 'moderate' }],
  ['rs1801282', { risk_genotype: 'CC', condition: 'PPARG Pro12Ala – Insulin Sensitivity Variant', category: 'Cardiovascular', severity: 'low' }],

  // Lipid / ApoE
  ['rs429358', { risk_genotype: 'CC', condition: 'ApoE ε4 Allele – Elevated Alzheimer & CVD Risk', category: 'Lipid Metabolism', severity: 'high' }],
  ['rs7412', { risk_genotype: 'CC', condition: 'ApoE ε2 – Altered Lipid Clearance', category: 'Lipid Metabolism', severity: 'moderate' }],

  // Inflammation
  ['rs1800629', { risk_genotype: 'AA', condition: 'TNF-α -308 – Elevated Inflammatory Response', category: 'Inflammation', severity: 'high' }],
  ['rs1205', { risk_genotype: 'CC', condition: 'CRP – Elevated Baseline Inflammation', category: 'Inflammation', severity: 'moderate' }],
  ['rs20417', { risk_genotype: 'CC', condition: 'PTGS2/COX-2 – Altered Prostaglandin Synthesis', category: 'Inflammation', severity: 'low' }],

  // Omega-3 & Fat Metabolism
  ['rs174537', { risk_genotype: 'TT', condition: 'FADS1 – Impaired Omega-3/6 Conversion', category: 'Fat Metabolism', severity: 'moderate' }],
  ['rs1799883', { risk_genotype: 'TT', condition: 'FABP2 – Increased Dietary Fat Absorption', category: 'Fat Metabolism', severity: 'low' }],

  // Vitamin D
  ['rs2228570', { risk_genotype: 'TT', condition: 'VDR FokI – Reduced Vitamin D Receptor Activity', category: 'Vitamin D', severity: 'moderate' }],
  ['rs10741657', { risk_genotype: 'GG', condition: 'CYP2R1 – Impaired Vitamin D Synthesis', category: 'Vitamin D', severity: 'moderate' }],

  // Iron Metabolism
  ['rs1800562', { risk_genotype: 'AA', condition: 'HFE C282Y – Hereditary Hemochromatosis Risk', category: 'Iron Metabolism', severity: 'high' }],
  ['rs1799945', { risk_genotype: 'GG', condition: 'HFE H63D – Mild Iron Overload Risk', category: 'Iron Metabolism', severity: 'moderate' }],

  // Circadian / Sleep
  ['rs57875989', { risk_genotype: 'AA', condition: 'ADRB1 – Natural Short Sleeper Variant', category: 'Sleep', severity: 'low' }],

  // Celiac / Gluten
  ['rs2187668', { risk_genotype: 'TT', condition: 'HLA-DQ2.5 – Elevated Celiac Disease Risk', category: 'Autoimmune', severity: 'high' }],
]);

/**
 * Parse a 23andMe raw data file in the browser.
 * @param {File} file - The .txt file from a file input.
 * @param {function} onProgress - Optional callback with progress (0-100).
 * @returns {Promise<Array>} Matched risk markers.
 */
export function parseGenomeFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file.'));

    reader.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const results = [];

      for (const line of lines) {
        if (!line || line.startsWith('#')) continue;

        const parts = line.split('\t');
        const rsid = parts[0]?.trim();
        const chromosome = parts[1]?.trim();
        const position = parts[2]?.trim();
        const genotype = parts[3]?.trim()?.toUpperCase();

        if (!rsid || !genotype) continue;

        const record = healthDatabase.get(rsid);
        if (record && genotype === record.risk_genotype) {
          results.push({
            rsid,
            chromosome,
            position,
            genotype,
            condition: record.condition,
            category: record.category,
            severity: record.severity,
          });
        }
      }

      // Sort by severity: high → moderate → low
      const order = { high: 0, moderate: 1, low: 2 };
      results.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));

      if (onProgress) onProgress(100);
      resolve(results);
    };

    reader.readAsText(file);
  });
}

export { healthDatabase };
