import { useRef, useState } from 'react';
import axios from 'axios';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success'
};

const GenomeUpload = () => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const resetState = () => {
    setStatus(STATUS.IDLE);
    setResults([]);
    setError('');
    setProgress(0);
    setFileName('');
  };

  const validateFile = (file) => {
    if (!file) {
      setError('Please choose a file to upload.');
      return false;
    }

    const isTxt = file.name.toLowerCase().endsWith('.txt');
    if (!isTxt) {
      setError('Invalid file format. Please upload a .txt file.');
      return false;
    }

    return true;
  };

  const submitFile = async (file) => {
    if (!validateFile(file)) {
      return;
    }

    setError('');
    setResults([]);
    setStatus(STATUS.UPLOADING);
    setProgress(0);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload-genome', formData, {
        // Let axios/browser set the correct multipart boundary for FormData.
        headers: formData.getHeaders ? formData.getHeaders() : undefined,
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        }
      });

      const responseResults = response?.data?.results ?? [];
      setResults(responseResults);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setStatus(STATUS.IDLE);
      setError(
        err?.response?.data?.message ||
          'We could not process that file. Please try again.'
      );
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    submitFile(file);
  };

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    submitFile(file);
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-mist-200 bg-white/70 px-4 py-2 text-sm text-ink-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-tealish-500" />
          Genome Health Insight Scanner
        </div>
        <h1 className="text-3xl font-semibold text-ink-700 md:text-4xl">
          Upload your 23andMe file for a quick genetic risk summary
        </h1>
        <p className="max-w-2xl text-base text-ink-600">
          We process your raw genome file line-by-line in-memory to identify
          clinically relevant markers. No files are stored on disk.
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
        <div className="flex flex-col gap-6 rounded-3xl border border-mist-200 bg-white/80 p-6 shadow-soft">
          <div
            className={`flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragActive
                ? 'border-tealish-500 bg-tealish-500/10'
                : 'border-mist-200 bg-mist-50'
            } ${status === STATUS.UPLOADING ? 'opacity-70' : ''}`}
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
                or <button type="button" onClick={handleBrowse} className="font-semibold text-tealish-600">browse files</button>
              </p>
              <p className="text-xs text-ink-500">Max file size: 20MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={status === STATUS.UPLOADING}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-mist-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between text-sm text-ink-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{fileName || 'No file selected yet.'}</span>
              </div>
              {status === STATUS.SUCCESS ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Processed
                </span>
              ) : null}
            </div>

            {status === STATUS.UPLOADING ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing genome...
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-mist-100">
                  <div
                    className="h-full rounded-full bg-tealish-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-ink-500">
                  Uploading and streaming data securely. {progress}%
                </p>
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
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-mist-200 bg-white/80 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-700">Detected Risks</h2>
            <span className="rounded-full border border-mist-200 px-3 py-1 text-xs text-ink-500">
              {results.length} markers
            </span>
          </div>

          {status !== STATUS.SUCCESS ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-mist-200 bg-mist-50 px-4 py-10 text-center">
              <FileText className="h-8 w-8 text-ink-400" />
              <p className="text-sm font-semibold text-ink-600">
                Upload a file to see matching health insights.
              </p>
              <p className="text-xs text-ink-500">
                Results will appear here when processing completes.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-mist-200 bg-mist-50 px-4 py-6 text-sm text-ink-600">
              No risk genotypes were detected in the sample file.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((item, index) => (
                <div
                  key={`${item.rsid}-${item.genotype}-${item.position ?? index}`}
                  className="flex flex-col gap-2 rounded-2xl border border-mist-200 bg-white px-4 py-4 shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-tealish-600">
                    {item.condition}
                  </span>
                  <p className="text-sm text-ink-600">
                    RSID: <span className="font-semibold text-ink-700">{item.rsid}</span>
                  </p>
                  <p className="text-sm text-ink-600">
                    Genotype: <span className="font-semibold text-ink-700">{item.genotype}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
