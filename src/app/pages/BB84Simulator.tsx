import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BlochSphere } from '../components/BlochSphere';
import { useQKD, PhotonData } from '../context/QKDContext';
import { Check, Copy, CheckCheck, CheckCircle } from 'lucide-react';

export function BB84Simulator() {
  const navigate = useNavigate();
  const { setSharedKey, setSimulationData } = useQKD();
  
  const [photonCount, setPhotonCount] = useState(1024);
  const [speed, setSpeed] = useState('fast');
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhoton, setCurrentPhoton] = useState(0);
  const [photons, setPhotons] = useState<PhotonData[]>([]);
  const [stats, setStats] = useState({
    totalPhotons: 0,
    sameBasisCases: 0,
    matchingBits: 0,
    finalKeyBits: 0
  });
  const [finalKey, setFinalKey] = useState<string>('');
  const [currentState, setCurrentState] = useState('|0⟩');
  const [currentAliceBasis, setCurrentAliceBasis] = useState('+');
  const [currentBobBasis, setCurrentBobBasis] = useState('+');
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const TARGET_KEY_BITS = 256;

  const speeds = {
    slow: 100,
    medium: 20,
    fast: 5
  };

  const generatePhotonData = (photonNumber: number): PhotonData => {
    const aliceBit = Math.random() > 0.5 ? 1 : 0;
    const aliceBasis = Math.random() > 0.5 ? '×' : '+';
    const bobBasis = Math.random() > 0.5 ? '×' : '+';
    
    const sameBasis = aliceBasis === bobBasis;
    let bobBit: number;
    
    if (sameBasis) {
      bobBit = aliceBit;
    } else {
      bobBit = Math.random() > 0.5 ? 1 : 0;
    }
    
    const match = sameBasis && (aliceBit === bobBit);
    const keyBit = sameBasis ? aliceBit : null;

    return {
      photonNumber,
      aliceBit,
      aliceBasis,
      bobBasis,
      bobBit,
      sameBasis,
      match,
      keyBit
    };
  };

  const getQuantumState = (bit: number, basis: string): string => {
    if (basis === '+') {
      return bit === 0 ? '|0⟩' : '|1⟩';
    } else {
      return bit === 0 ? '|+⟩' : '|-⟩';
    }
  };

  useEffect(() => {
    // Check if we've reached the target key bits
    if (stats.finalKeyBits >= TARGET_KEY_BITS) {
      setIsRunning(false);
      setIsComplete(true);
      return;
    }

    if (!isRunning || currentPhoton >= photonCount) {
      if (currentPhoton >= photonCount && photons.length > 0) {
        setIsComplete(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      const newPhoton = generatePhotonData(currentPhoton + 1);
      setPhotons(prev => [...prev, newPhoton]);
      
      setCurrentState(getQuantumState(newPhoton.aliceBit, newPhoton.aliceBasis));
      setCurrentAliceBasis(newPhoton.aliceBasis);
      setCurrentBobBasis(newPhoton.bobBasis);

      setStats(prev => {
        const newStats = {
          totalPhotons: prev.totalPhotons + 1,
          sameBasisCases: prev.sameBasisCases + (newPhoton.sameBasis ? 1 : 0),
          matchingBits: prev.matchingBits + (newPhoton.match ? 1 : 0),
          finalKeyBits: prev.finalKeyBits + (newPhoton.keyBit !== null ? 1 : 0)
        };
        return newStats;
      });

      setCurrentPhoton(prev => prev + 1);
    }, speeds[speed as keyof typeof speeds]);

    return () => clearTimeout(timer);
  }, [isRunning, currentPhoton, photonCount, speed, stats.finalKeyBits]);

  useEffect(() => {
    if (isComplete) {
      const keyBits = photons
        .filter(p => p.keyBit !== null)
        .map(p => p.keyBit)
        .join('')
        .slice(0, TARGET_KEY_BITS); // Only take first 256 bits
      setFinalKey(keyBits);
      
      // Save to context for other pages
      setSharedKey(keyBits);
      setSimulationData({
        photons,
        totalPhotons: stats.totalPhotons,
        sameBasisCases: stats.sameBasisCases,
        matchingBits: stats.matchingBits,
        finalKeyBits: keyBits.length
      });
    }
  }, [isComplete, photons, stats, setSharedKey, setSimulationData]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPhoton(0);
    setPhotons([]);
    setStats({
      totalPhotons: 0,
      sameBasisCases: 0,
      matchingBits: 0,
      finalKeyBits: 0
    });
    setFinalKey('');
    setIsComplete(false);
    setCurrentState('|0⟩');
    setCurrentAliceBasis('+');
    setCurrentBobBasis('+');
  };

  const formatKey = (key: string) => {
    const chunks = [];
    for (let i = 0; i < key.length; i += 8) {
      chunks.push(key.slice(i, i + 8));
    }
    return chunks;
  };

  const formatKeyForDisplay = (key: string) => {
    // Split into three lines: 88 bits, 88 bits, 80 bits (remaining)
    const firstLine = key.slice(0, 88);
    const secondLine = key.slice(88, 176);
    const thirdLine = key.slice(176, 256);
    
    const formatLine = (line: string) => {
      const chunks = [];
      for (let i = 0; i < line.length; i += 8) {
        chunks.push(line.slice(i, i + 8));
      }
      return chunks;
    };
    
    return [formatLine(firstLine), formatLine(secondLine), formatLine(thirdLine)];
  };

  const handleCopy = () => {
    // Use fallback method for clipboard API
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(finalKey).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          // Fallback if clipboard API fails
          fallbackCopyTextToClipboard(finalKey);
        });
      } else {
        // Use fallback method directly
        fallbackCopyTextToClipboard(finalKey);
      }
    } catch (error) {
      fallbackCopyTextToClipboard(finalKey);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy. Please manually select and copy the key.');
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl text-white mb-2">BB84 Quantum Key Distribution Simulator</h2>
        <p className="text-gray-400">Fast simulation with quantum state visualization</p>
      </div>

      {/* Controls */}
      <div className="bg-[#1a1f35] rounded-lg p-6 grid grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-300 mb-2">Number of Photons</label>
          <select
            value={photonCount}
            onChange={(e) => setPhotonCount(Number(e.target.value))}
            disabled={isRunning}
            className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
          >
            <option value={256}>256 photons</option>
            <option value={512}>512 photons</option>
            <option value={720}>720 photons</option>
            <option value={1024}>1024 photons</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Simulation Speed</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
          >
            <option value="slow">Slow</option>
            <option value="medium">Medium</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Actions</label>
          <div className="flex gap-3">
            {!isRunning && currentPhoton < photonCount ? (
              <button
                onClick={handleStart}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Start Simulation
              </button>
            ) : isRunning ? (
              <button
                onClick={handleStop}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Stop Simulation
              </button>
            ) : null}
            <button
              onClick={handleReset}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded hover:from-red-600 hover:to-pink-600 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-cyan-400 font-mono mb-2">{stats.totalPhotons}</div>
          <div className="text-gray-400">Total Photons Sent</div>
        </div>
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-cyan-400 font-mono mb-2">{stats.sameBasisCases}</div>
          <div className="text-gray-400">Same Basis Cases</div>
        </div>
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-cyan-400 font-mono mb-2">{stats.matchingBits}</div>
          <div className="text-gray-400">Matching Bits</div>
        </div>
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-cyan-400 font-mono mb-2">{stats.finalKeyBits}</div>
          <div className="text-gray-400">Final Key Bits</div>
        </div>
      </div>

      {/* Photon Table */}
      {photons.length > 0 && (
        <div className="bg-[#1a1f35] rounded-lg overflow-hidden border border-gray-800">
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-[#252b47] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-cyan-400 text-left">Photon #</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Alice Bit</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Alice Basis</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Bob Basis</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Same?</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Bob Bit</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Match?</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Key Bit</th>
                </tr>
              </thead>
              <tbody>
                {photons.slice().reverse().map((photon) => (
                  <tr key={photon.photonNumber} className="border-t border-gray-800 hover:bg-[#252b47]">
                    <td className="px-4 py-3 text-white">{photon.photonNumber}</td>
                    <td className="px-4 py-3 text-cyan-400 font-mono">{photon.aliceBit}</td>
                    <td className="px-4 py-3 text-yellow-400 font-mono">{photon.aliceBasis}</td>
                    <td className="px-4 py-3 text-yellow-400 font-mono">{photon.bobBasis}</td>
                    <td className="px-4 py-3">
                      {photon.sameBasis ? (
                        <span className="text-green-400">YES</span>
                      ) : (
                        <span className="text-red-400">NO</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-mono">{photon.bobBit}</td>
                    <td className="px-4 py-3">
                      {photon.sameBasis ? (
                        photon.match ? (
                          <Check className="text-green-400 w-5 h-5" />
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {photon.keyBit !== null ? (
                        <span className="text-cyan-400 font-mono">{photon.keyBit}</span>
                      ) : (
                        <span className="text-gray-600 text-sm">Discard (Diff Basis)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Final Key Display */}
      {finalKey && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 text-2xl flex items-center gap-2">
              <CheckCircle className="w-8 h-8" />
              256-bit Secure Quantum Key Generated!
            </h3>
            <div className="text-green-400 text-lg font-mono">
              {finalKey.length} / 256 bits
            </div>
          </div>
          
          <div className="bg-[#0f1321] p-4 rounded border border-green-500/30 mb-4">
            <div className="font-mono text-sm leading-relaxed">
              {formatKeyForDisplay(finalKey).map((line, idx) => (
                <div key={idx} className="mb-2">
                  {line.map((chunk, chunkIdx) => (
                    <span key={chunkIdx} className="mr-3">
                      <span className="text-red-400">{chunk.slice(0, 4)}</span>
                      <span className="text-green-400">{chunk.slice(4)}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/50 rounded p-4 mb-4 text-blue-200 text-sm">
            <strong>How to use this key:</strong>
            <ol className="list-decimal list-inside ml-2 mt-2 space-y-1">
              <li>Click the "Copy Key" button below to copy the 256-bit key to your clipboard</li>
              <li>Go to the Encryption page and paste this key in the encryption field</li>
              <li>Only someone with this exact key can decrypt your messages</li>
            </ol>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded hover:from-blue-600 hover:to-indigo-600 transition-all"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-5 h-5" />
                  <span>Key Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Key to Clipboard</span>
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/encryption')}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Use Key for Encryption →
            </button>
          </div>
        </div>
      )}

      {/* Bloch Sphere */}
      <BlochSphere
        currentState={currentState}
        aliceBasis={currentAliceBasis}
        bobBasis={currentBobBasis}
      />

      {isComplete && (
        <div className="text-center text-green-400 text-lg">
          Simulation complete.
        </div>
      )}
    </div>
  );
}