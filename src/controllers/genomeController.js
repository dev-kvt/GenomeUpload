import multer from 'multer';
import { Readable } from 'stream';
import readline from 'readline';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

const healthDatabase = new Map([
  ['rs1801133', { risk_genotype: 'TT', condition: 'MTHFR Anomaly' }],
  ['rs1801131', { risk_genotype: 'AC', condition: 'MTHFR A1298C' }],
  ['rs1051266', { risk_genotype: 'GG', condition: 'SLC19A1 Folate Transport' }],
  ['rs4680', { risk_genotype: 'AA', condition: 'COMT Dopamine/Estrogen Breakdown' }],
  ['rs1801394', { risk_genotype: 'GG', condition: 'MTRR B12 Recycling' }],
  ['rs1229984', { risk_genotype: 'AA', condition: 'ADH1B Alcohol Metabolism' }],
  ['rs762551', { risk_genotype: 'CC', condition: 'CYP1A2 Caffeine Metabolism' }],
  ['rs602662', { risk_genotype: 'GG', condition: 'FUT2 B12 Absorption' }],
  ['rs174537', { risk_genotype: 'TT', condition: 'FADS1 Omega-3 Conversion' }],
  ['rs10757278', { risk_genotype: 'GG', condition: '9p21 Coronary Risk' }],
  ['rs671', { risk_genotype: 'AA', condition: 'ALDH2 Flush Response' }],
  ['rs1800629', { risk_genotype: 'AA', condition: 'TNF-alpha Inflammation' }],
  ['rs429358', { risk_genotype: 'CC', condition: 'ApoE4 Risk' }],
  ['rs7412', { risk_genotype: 'CC', condition: 'ApoE2 Risk' }]
]);

const processGenomeBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const results = [];
    let settled = false;
    const readable = Readable.from([buffer]);
    readable.setEncoding('utf8');

    const rl = readline.createInterface({
      input: readable,
      crlfDelay: Infinity
    });

    const finish = (fn, value) => {
      if (settled) {
        return;
      }
      settled = true;
      fn(value);
    };

    const fail = (error) => {
      rl.close();
      finish(reject, error);
    };

    readable.on('error', fail);
    rl.on('error', fail);

    rl.on('line', (line) => {
      if (!line || line.startsWith('#')) {
        return;
      }

      const [rsidRaw, chromosomeRaw, positionRaw, genotypeRaw] = line.split('\t');
      const rsid = rsidRaw?.trim();
      const chromosome = chromosomeRaw?.trim();
      const position = positionRaw?.trim();
      const genotype = genotypeRaw?.trim()?.toUpperCase();

      if (!rsid || !genotype) {
        return;
      }

      const record = healthDatabase.get(rsid);
      if (record && genotype === record.risk_genotype) {
        results.push({
          rsid,
          chromosome,
          position,
          genotype,
          condition: record.condition
        });
      }
    });

    rl.on('close', () => finish(resolve, results));
  });

export const uploadGenome = (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload failed.',
        details: err.message
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded. Use multipart/form-data with field name "file".'
      });
    }

    try {
      const results = await processGenomeBuffer(req.file.buffer);
      return res.status(200).json({ status: 'ok', results });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process genome file.'
      });
    }
  });
};
