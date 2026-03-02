import React, { useState } from 'react';
import { Plus, Trash2, Copy, Play, Check } from 'lucide-react';

const DATA_TYPES = [
  'First Name',
  'Last Name',
  'Email',
  'UUID',
  'Avatar URL',
  'Company',
  'Job Title',
  'City',
  'Country',
];

function App() {
  const [fields, setFields] = useState([
    { id: crypto.randomUUID(), name: 'id', type: 'UUID' },
    { id: crypto.randomUUID(), name: 'firstName', type: 'First Name' },
    { id: crypto.randomUUID(), name: 'lastName', type: 'Last Name' },
    { id: crypto.randomUUID(), name: 'email', type: 'Email' },
  ]);
  const [rowCount, setRowCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const addField = () => {
    setFields([...fields, { id: crypto.randomUUID(), name: `field${fields.length + 1}`, type: 'First Name' }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(field => field.id === id ? { ...field, [key]: value } : field));
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const generateEndpoint = async () => {
    try {
      setLoading(true);
      setError('');
      setGeneratedUrl('');

      const response = await fetch('http://localhost:5000/api/create-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowCount: Number(rowCount),
          fields: fields.map(f => ({ fieldName: f.name, dataType: f.type }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create endpoint');
      }

      const data = await response.json();
      setGeneratedUrl(data.url);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate a mock preview representation
  const generatePreview = () => {
    const obj = {};
    fields.forEach(f => {
      let val = '...';
      if (f.type === 'UUID') val = '"b5a1..."';
      if (f.type === 'First Name') val = '"John"';
      if (f.type === 'Last Name') val = '"Doe"';
      if (f.type === 'Email') val = '"john@example.com"';
      obj[f.name] = val;
    });

    // We display an array containing one representative object
    return `[\n  ${JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ')}\n  // ... ${rowCount - 1} more items\n]`.replace(/"\.\.\."/g, '...');
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="w-full mb-12 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-blue-600 flex items-center gap-2 mb-4 tracking-tight">
          <Play className="w-8 h-8" /> Mockify
        </h1>
        <p className="text-gray-500 text-lg">Define your JSON schema and instantly get a live REST API.</p>
      </header>

      <div className="flex flex-col lg:flex-row w-full gap-8">

        {/* Left Column: Schema Builder */}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Schema Builder</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">Rows:</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={rowCount}
                onChange={(e) => setRowCount(e.target.value)}
                className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {fields.map((field) => (
              <div key={field.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 transition duration-200 hover:border-blue-200 hover:shadow-sm">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(field.id, 'name', e.target.value)}
                  placeholder="Field Name"
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, 'type', e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  {DATA_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeField(field.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addField}
            className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Field
          </button>

          <button
            onClick={generateEndpoint}
            disabled={loading || fields.length === 0}
            className="w-full mt-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.98]"
          >
            {loading ? 'Generating...' : 'Generate API Endpoint'}
          </button>

          {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
        </div>

        {/* Right Column: Preview & Output */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">

          {/* Live Endpoint Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center min-h-[200px]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Live Endpoint</h2>

            {generatedUrl ? (
              <div className="space-y-4">
                <div className="flex bg-blue-50 border border-blue-100 p-1 rounded-xl overflow-hidden shadow-inner">
                  <div className="flex-1 px-4 py-3 text-blue-700 font-mono text-sm overflow-x-auto whitespace-nowrap flex items-center">
                    {generatedUrl}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-6 bg-white text-blue-600 border border-blue-100 rounded-lg font-medium shadow-sm hover:bg-blue-50 flex items-center justify-center gap-2 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Endpoint is live and ready to accept GET requests.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
                <Play className="w-12 h-12 mb-3 opacity-20" />
                <p>Configure your schema and generate an endpoint to see it here.</p>
              </div>
            )}
          </div>

          {/* JSON Preview Box */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden flex-1 flex flex-col">
            <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <span className="ml-2">response.json</span>
              </span>
            </div>
            <div className="p-6 overflow-auto custom-scrollbar flex-1">
              <pre className="text-green-400 font-mono text-sm leading-relaxed">
                <code>{generatePreview()}</code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
