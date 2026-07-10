import { useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { parseGenomeFile } from '../lib/genomeParser.js';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Dna,
  ShieldCheck,
} from 'lucide-react';

const STATUS = {
  IDLE: 'idle',
  PARSING: 'parsing',
  PARSED: 'parsed',
  ANALYZING: 'analyzing',
  DONE: 'done',
};

const SEVERITY_COLORS = {
  high: 'border-red-300 bg-red-50 text-red-700',
  moderate: 'border-amber-300 bg-amber-50 text-amber-700',
  low: 'border-emerald-300 bg-emerald-50 text-emerald-700',
};

const SEVERITY_DOT = {
  high: 'bg-red-500',
  moderate: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const GenomeUpload = () => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [aiReport, setAiReport] = useState('');
  const inputRef = useRef(null);

  const resetState = () => {
    setStatus(STATUS.IDLE);
    setResults([]);
    setError('');
    setProgress(0);
    setFileName('');
    setAiReport('');
  };

  const validateFile = (file) => {
    if (!file) {
      setError('Please choose a file to upload.');
      return false;
    }
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Invalid file format. Please upload a .txt file.');
      return false;
    }
    return true;
  };

  const analyzeWithAI = useCallback(async (markers) => {
    setStatus(STATUS.ANALYZING);
    setAiReport('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markers }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'AI analysis failed.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let report = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        report += chunk;
        setAiReport(report);
      }

      setStatus(STATUS.DONE);
    } catch (err) {
      setError(err.message || 'AI analysis failed. Please try again.');
      setStatus(STATUS.PARSED);
    }
  }, []);

  const submitFile = async (file) => {
    if (!validateFile(file)) return;

    setError('');
    setResults([]);
    setAiReport('');
    setStatus(STATUS.PARSING);
    setProgress(0);
    setFileName(file.name);

    try {
      const markers = await parseGenomeFile(file, setProgress);
      setResults(markers);
      setStatus(STATUS.PARSED);

      if (markers.length > 0) {
        await analyzeWithAI(markers);
      }
    } catch (err) {
      setStatus(STATUS.IDLE);
      setError('Failed to parse genome file. Ensure it is a valid 23andMe .txt export.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    submitFile(event.dataTransfer.files?.[0]);
  };

  const handleBrowse = () => inputRef.current?.click();

  const handleFileChange = (event) => {
    submitFile(event.target.files?.[0]);
  };

  const isParsing = status === STATUS.PARSING;
  const isAnalyzing = status === STATUS.ANALYZING;
  const isBusy = isParsing || isAnalyzing;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-mist-200 bg-white/70 px-4 py-2 text-sm text-ink-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-tealish-500" />
          Genome Health Insight Scanner
        </div>
        <h1 className="text-3xl font-semibold text-ink-700 md:text-4xl">
          Upload your 23andMe file for an AI-powered genetic risk analysis
        </h1>
        <p className="max-w-2xl text-base text-ink-600">
          Your genome file is parsed entirely in your browser — no raw data leaves your device.
          Only matched risk markers are sent to our AI for personalized analysis.
        </p>
      </header>

      {error ? (
        <div
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Upload issue</p>
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-xs font-semibold text-amber-700"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Upload Panel */}
        <div className="flex flex-col gap-6 rounded-3xl border border-mist-200 bg-white/80 p-6 shadow-soft">
          <div
            className={`flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragActive
                ? 'border-tealish-500 bg-tealish-500/10'
                : 'border-mist-200 bg-mist-50'
            } ${isBusy ? 'opacity-70' : ''}`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(true);
            }}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-10 w-10 text-tealish-600" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-ink-700">
                Drag and drop your 23andMe .txt file here
              </p>
              <p className="text-sm text-ink-600">
                or{' '}
                <button type="button" onClick={handleBrowse} className="font-semibold text-tealish-600">
                  browse files
                </button>
              </p>
              <p className="text-xs text-ink-500">Parsed locally in your browser · No upload</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-mist-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between text-sm text-ink-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{fileName || 'No file selected yet.'}</span>
              </div>
              {status === STATUS.DONE || status === STATUS.PARSED ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {results.length} markers found
                </span>
              ) : null}
            </div>

            {isParsing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing genome locally...
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-mist-100">
                  <div
                    className="h-full rounded-full bg-tealish-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-ink-500">
                  Reading file in your browser. No data is uploaded. {progress}%
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <Sparkles className="h-4 w-4 animate-pulse text-tealish-500" />
                AI is analyzing your markers...
              </div>
            ) : (
              <button
                type="button"
                onClick={resetState}
                className="w-fit text-xs font-semibold text-ink-500 hover:text-ink-700"
              >
                Reset
              </button>
            )}
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Your raw genome file never leaves your browser. Only matched risk markers are analyzed.</span>
          </div>
        </div>

        {/* Detected Risks Panel */}
        <div className="flex flex-col gap-4 rounded-3xl border border-mist-200 bg-white/80 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-700">Detected Risks</h2>
            <span className="rounded-full border border-mist-200 px-3 py-1 text-xs text-ink-500">
              {results.length} markers
            </span>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-mist-200 bg-mist-50 px-4 py-10 text-center">
              <Dna className="h-8 w-8 text-ink-400" />
              <p className="text-sm font-semibold text-ink-600">
                {status === STATUS.IDLE
                  ? 'Upload a file to see matching health insights.'
                  : 'No risk genotypes were detected.'}
              </p>
              <p className="text-xs text-ink-500">
                Results will appear here when processing completes.
              </p>
            </div>
          ) : (
            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              {results.map((item, index) => (
                <div
                  key={`${item.rsid}-${index}`}
                  className={`flex flex-col gap-1 rounded-xl border px-4 py-3 ${SEVERITY_COLORS[item.severity] || 'border-mist-200 bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[item.severity]}`} />
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{item.condition}</p>
                  <p className="text-xs opacity-80">
                    {item.rsid} · {item.genotype} · Chr{item.chromosome}:{item.position}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Report Section */}
      {(isAnalyzing || aiReport) ? (
        <section className="rounded-3xl border border-mist-200 bg-white/80 p-8 shadow-soft">
          <div className="mb-6 flex items-center gap-3 border-b border-mist-200 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tealish-500 to-violet-500">
              <Sparkles className={`h-5 w-5 text-white ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-700">AI Health Insight Report</h2>
              <p className="text-xs text-ink-600">Personalized genetic analysis · English & Hindi</p>
            </div>
            {isAnalyzing && (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-tealish-500/10 px-3 py-1 text-xs font-semibold text-tealish-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tealish-500" />
                Streaming live...
              </span>
            )}
          </div>
          <div className="ai-report-content">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mb-3 mt-6 flex items-center gap-2 text-xl font-bold text-ink-700 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-4 text-base font-semibold text-ink-700">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mb-1 mt-3 text-sm font-semibold text-ink-700">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-sm leading-relaxed text-ink-600">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-ink-700">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="not-italic text-ink-500" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 ml-1 space-y-1.5 text-sm text-ink-600">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tealish-500" />
                    <span className="leading-relaxed">{children}</span>
                  </li>
                ),
                hr: () => <hr className="my-6 border-mist-200" />,
              }}
            >
              {aiReport || 'Generating your personalized report...'}
            </ReactMarkdown>
          </div>
        </section>
      ) : null}

      <footer className="rounded-3xl border border-mist-200 bg-white/80 p-6 text-sm text-ink-600 shadow-soft">
        <p className="font-semibold text-ink-700">Medical Disclaimer</p>
        <p>
          This tool provides educational insights only and is not a substitute
          for professional medical advice, diagnosis, or treatment. Always seek
          guidance from a qualified healthcare provider.
        </p>
      </footer>
    </div>
  );
};

export default GenomeUpload;
