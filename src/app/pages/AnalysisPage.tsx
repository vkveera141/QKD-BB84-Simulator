import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Shield } from 'lucide-react';

interface SimulationResult {
  scenario: string;
  evePresent: boolean;
  photonsTransmitted: number;
  sameBasisCases: number;
  bitsCompared: number;
  errors: number;
  errorRate: number;
  disturbanceRate: number;
}

export function AnalysisPage() {
  const [photonCount, setPhotonCount] = useState(256);
  const [sampleSize, setSampleSize] = useState(32);
  const [threshold, setThreshold] = useState(11);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const ERROR_THRESHOLD = threshold / 100; // Convert to decimal

  const runSimulation = (evePresent: boolean): SimulationResult => {
    let photonsTransmitted = 0;
    let sameBasisCases = 0;
    let errors = 0;
    let disturbedCount = 0;

    for (let i = 0; i < photonCount; i++) {
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? '×' : '+';
      const bobBasis = Math.random() > 0.5 ? '×' : '+';

      photonsTransmitted++;

      let bobBit: number;

      if (evePresent) {
        // Eve intercepts
        const eveBasis = Math.random() > 0.5 ? '×' : '+';
        let eveMeasurement: number;

        if (eveBasis === aliceBasis) {
          eveMeasurement = aliceBit;
        } else {
          eveMeasurement = Math.random() > 0.5 ? 1 : 0;
          disturbedCount++;
        }

        // Bob measures Eve's resent photon
        if (bobBasis === eveBasis) {
          bobBit = eveMeasurement;
        } else {
          bobBit = Math.random() > 0.5 ? 1 : 0;
        }
      } else {
        // Normal transmission
        if (aliceBasis === bobBasis) {
          bobBit = aliceBit;
        } else {
          bobBit = Math.random() > 0.5 ? 1 : 0;
        }
      }

      // Count same basis cases
      if (aliceBasis === bobBasis) {
        sameBasisCases++;
        // Check for errors in same basis cases
        if (aliceBit !== bobBit) {
          errors++;
        }
      }
    }

    const bitsCompared = Math.min(sampleSize, sameBasisCases);
    const errorRate = sameBasisCases > 0 ? (errors / sameBasisCases) * 100 : 0;
    const disturbanceRate = (disturbedCount / photonsTransmitted) * 100;

    return {
      scenario: evePresent ? 'With Eve' : 'Without Eve',
      evePresent,
      photonsTransmitted,
      sameBasisCases,
      bitsCompared,
      errors,
      errorRate,
      disturbanceRate
    };
  };

  const handleRunAnalysis = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const withoutEve = runSimulation(false);
      const withEve = runSimulation(true);
      setResults([withoutEve, withEve]);
      setIsRunning(false);
    }, 500);
  };

  const handleReset = () => {
    setResults([]);
  };

  const chartData = results.map(r => ({
    name: r.scenario,
    'Error Rate (%)': parseFloat(r.errorRate.toFixed(2)),
    'Disturbance (%)': parseFloat(r.disturbanceRate.toFixed(2))
  }));

  const detectionData = results.length > 0 ? [
    { photons: 0, errorRate: 0 },
    { photons: 50, errorRate: results[0].errorRate },
    { photons: 100, errorRate: results[0].errorRate },
    { photons: 150, errorRate: results[1].errorRate },
    { photons: 200, errorRate: results[1].errorRate },
    { photons: 256, errorRate: results[1].errorRate }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl text-white mb-2">Eve's Attack Analysis & Detection</h2>
        <p className="text-gray-400">Quantitative analysis of eavesdropping impact on QKD</p>
      </div>

      {/* Controls */}
      <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Photons to Send</label>
            <select
              value={photonCount}
              onChange={(e) => setPhotonCount(Number(e.target.value))}
              disabled={isRunning}
              className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
            >
              <option value={128}>128</option>
              <option value={256}>256</option>
              <option value={512}>512</option>
              <option value={1024}>1024</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Sample Size for Check</label>
            <input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              disabled={isRunning}
              className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
              min="8"
              max="128"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Error Threshold (%)</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              disabled={isRunning}
              className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
              min="1"
              max="25"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Actions</label>
            <div className="flex gap-3">
              <button
                onClick={handleRunAnalysis}
                disabled={isRunning}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Run Analysis'}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded hover:from-red-600 hover:to-pink-600 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-6">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`bg-[#1a1f35] rounded-lg p-6 border ${
                  result.evePresent ? 'border-red-500/50' : 'border-green-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {result.evePresent ? (
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  ) : (
                    <Shield className="w-8 h-8 text-green-400" />
                  )}
                  <h3 className={`text-2xl ${result.evePresent ? 'text-red-400' : 'text-green-400'}`}>
                    {result.scenario}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Photons Transmitted:</span>
                    <span className="text-white font-mono">{result.photonsTransmitted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Same Basis Cases:</span>
                    <span className="text-white font-mono">{result.sameBasisCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bits Compared:</span>
                    <span className="text-white font-mono">{result.bitsCompared}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Errors Detected:</span>
                    <span className="text-red-400 font-mono">{result.errors}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-700">
                    <span className="text-gray-400">Error Rate:</span>
                    <span className={`font-mono text-xl ${
                      result.errorRate > ERROR_THRESHOLD * 100 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {result.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Disturbance Rate:</span>
                    <span className="text-yellow-400 font-mono text-xl">
                      {result.disturbanceRate.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className={`mt-4 p-3 rounded ${
                  result.errorRate > ERROR_THRESHOLD * 100
                    ? 'bg-red-900/30 border border-red-500/50'
                    : 'bg-green-900/30 border border-green-500/50'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.errorRate > ERROR_THRESHOLD * 100 ? (
                      <>
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <span className="text-red-200 text-sm">
                          <strong>Key Rejected:</strong> Error rate exceeds threshold
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-green-200 text-sm">
                          <strong>Key Accepted:</strong> Error rate below threshold
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Error Rate Comparison */}
            <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
              <h3 className="text-cyan-400 text-xl mb-4">Error Rate Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1f35', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="Error Rate (%)" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Disturbance Rate */}
            <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
              <h3 className="text-cyan-400 text-xl mb-4">Photon Disturbance Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" label={{ value: 'Disturbance (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1f35', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="Disturbance (%)" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detection Timeline */}
          <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
            <h3 className="text-cyan-400 text-xl mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Error Detection Over Transmission
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={detectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="photons"
                  stroke="#9ca3af"
                  label={{ value: 'Photons Transmitted', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1f35', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  name="Error Rate (%)"
                  dot={{ fill: '#06b6d4', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Conclusion Panel */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/50 rounded-lg p-6">
            <h3 className="text-cyan-400 text-2xl mb-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              Security Guarantee
            </h3>
            <div className="space-y-3 text-gray-200">
              <p className="text-lg">
                <strong className="text-white">Quantum mechanics guarantees that eavesdropping introduces detectable errors.</strong>
              </p>
              <p>
                When Eve intercepts photons, she must measure them to gain information. This measurement 
                collapses the quantum state, and when she uses the wrong basis (50% of the time), 
                she introduces errors that Alice and Bob can detect.
              </p>
              <p>
                <strong className="text-cyan-300">Expected error rate with Eve:</strong> ~25% (when Eve intercepts all photons)
              </p>
              <p>
                <strong className="text-cyan-300">Expected error rate without Eve:</strong> ~0-2% (due to natural noise)
              </p>
              <p>
                By comparing a sample of their bits, Alice and Bob can:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Detect the presence of an eavesdropper</li>
                <li>Abort the key exchange if error rate exceeds threshold ({threshold}%)</li>
                <li>Guarantee the security of their final shared key</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Explanation */}
      {results.length === 0 && (
        <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
          <h3 className="text-cyan-400 text-xl mb-4">About This Analysis</h3>
          <div className="space-y-3 text-gray-300">
            <p>
              This page simulates the statistical analysis that Alice and Bob perform to detect eavesdropping.
            </p>
            <p>
              <strong className="text-white">How Detection Works:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong>Bit Comparison:</strong> After the quantum transmission, Alice and Bob publicly compare 
                a random sample of their bits (sacrificing these bits for security verification).
              </li>
              <li>
                <strong>Error Rate Calculation:</strong> They calculate what percentage of compared bits don't match.
              </li>
              <li>
                <strong>Threshold Check:</strong> If the error rate exceeds a predetermined threshold 
                (typically 11%), they conclude that an eavesdropper is present and abort.
              </li>
              <li>
                <strong>Key Acceptance:</strong> If the error rate is below the threshold, they proceed with 
                the remaining bits as their secure key.
              </li>
            </ul>
            <p className="pt-3 border-t border-gray-700">
              <strong className="text-white">Why This Works:</strong> Eve cannot gain information without measuring, 
              and measuring disturbs the quantum states in a detectable way. This is a fundamental property of quantum mechanics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
