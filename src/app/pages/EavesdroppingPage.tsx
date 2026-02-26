import React, { useState, useEffect } from 'react';
import { ArrowRight, Radio, Eye, AlertTriangle } from 'lucide-react';

interface PhotonEveData {
  photonNumber: number;
  aliceBit: number;
  aliceBasis: string;
  eveIntercept: boolean;
  eveBasis?: string;
  eveMeasurement?: number;
  eveResent?: number;
  bobBasis: string;
  bobBit: number;
  sameBasis: boolean;
  keyBit: number | null;
  disturbed: boolean;
}

export function EavesdroppingPage() {
  const [eveEnabled, setEveEnabled] = useState(false);
  const [photonCount, setPhotonCount] = useState(128);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhoton, setCurrentPhoton] = useState(0);
  const [photons, setPhotons] = useState<PhotonEveData[]>([]);
  const [stats, setStats] = useState({
    totalPhotons: 0,
    eveInterceptions: 0,
    disturbedPhotons: 0,
    normalTransmissions: 0
  });
  const [animatingPhoton, setAnimatingPhoton] = useState<number | null>(null);

  const generatePhotonData = (photonNumber: number): PhotonEveData => {
    const aliceBit = Math.random() > 0.5 ? 1 : 0;
    const aliceBasis = Math.random() > 0.5 ? '×' : '+';
    const bobBasis = Math.random() > 0.5 ? '×' : '+';
    
    let bobBit: number;
    let disturbed = false;
    let eveData: Partial<PhotonEveData> = {};

    if (eveEnabled) {
      // Eve intercepts
      const eveBasis = Math.random() > 0.5 ? '×' : '+';
      
      // Eve measures (collapses state)
      let eveMeasurement: number;
      if (eveBasis === aliceBasis) {
        eveMeasurement = aliceBit; // Correct measurement
      } else {
        eveMeasurement = Math.random() > 0.5 ? 1 : 0; // Random
        disturbed = true; // State is disturbed
      }
      
      // Eve resends
      const eveResent = eveMeasurement;
      
      // Bob measures Eve's resent photon
      if (bobBasis === eveBasis) {
        bobBit = eveResent;
      } else {
        bobBit = Math.random() > 0.5 ? 1 : 0;
      }
      
      eveData = {
        eveIntercept: true,
        eveBasis,
        eveMeasurement,
        eveResent
      };
    } else {
      // Normal transmission without Eve
      const sameBasis = aliceBasis === bobBasis;
      if (sameBasis) {
        bobBit = aliceBit;
      } else {
        bobBit = Math.random() > 0.5 ? 1 : 0;
      }
      
      eveData = {
        eveIntercept: false
      };
    }

    const sameBasis = aliceBasis === bobBasis;
    const keyBit = sameBasis ? bobBit : null;

    return {
      photonNumber,
      aliceBit,
      aliceBasis,
      bobBasis,
      bobBit,
      sameBasis,
      keyBit,
      disturbed,
      ...eveData
    };
  };

  useEffect(() => {
    if (!isRunning || currentPhoton >= photonCount) return;

    const timer = setTimeout(() => {
      const newPhoton = generatePhotonData(currentPhoton + 1);
      setPhotons(prev => [...prev, newPhoton]);
      setAnimatingPhoton(currentPhoton + 1);

      setStats(prev => ({
        totalPhotons: prev.totalPhotons + 1,
        eveInterceptions: prev.eveInterceptions + (eveEnabled ? 1 : 0),
        disturbedPhotons: prev.disturbedPhotons + (newPhoton.disturbed ? 1 : 0),
        normalTransmissions: prev.normalTransmissions + (!eveEnabled ? 1 : 0)
      }));

      setCurrentPhoton(prev => prev + 1);

      setTimeout(() => setAnimatingPhoton(null), 1500);
    }, 300);

    return () => clearTimeout(timer);
  }, [isRunning, currentPhoton, photonCount, eveEnabled]);

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
      eveInterceptions: 0,
      disturbedPhotons: 0,
      normalTransmissions: 0
    });
    setAnimatingPhoton(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl text-white mb-2">Alice - Bob - Eve Simulation</h2>
        <p className="text-gray-400">Observe how eavesdropping affects quantum key distribution</p>
      </div>

      {/* Controls */}
      <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Photons</label>
            <select
              value={photonCount}
              onChange={(e) => setPhotonCount(Number(e.target.value))}
              disabled={isRunning}
              className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
            >
              <option value={64}>64</option>
              <option value={128}>128</option>
              <option value={256}>256</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Eve (Eavesdropper)</label>
            <button
              onClick={() => setEveEnabled(!eveEnabled)}
              disabled={isRunning}
              className={`w-full px-4 py-3 rounded transition-all ${
                eveEnabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {eveEnabled ? 'Enabled ⚠️' : 'Disabled ✓'}
            </button>
          </div>

          <div className="col-span-2">
            <label className="block text-gray-300 mb-2">Actions</label>
            <div className="flex gap-3">
              {!isRunning || currentPhoton >= photonCount ? (
                <button
                  onClick={handleStart}
                  disabled={currentPhoton >= photonCount && isRunning}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Stop
                </button>
              )}
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

      {/* Photon Flow Visualization */}
      <div className="bg-[#1a1f35] rounded-lg p-8 border border-gray-800">
        <h3 className="text-cyan-400 text-xl mb-6 text-center">Photon Transmission Path</h3>
        
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Alice */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <Radio className="w-12 h-12 text-white" />
            </div>
            <div className="text-white text-lg">Alice</div>
            <div className="text-gray-400 text-sm">Sender</div>
          </div>

          {/* Arrow 1 */}
          <div className="flex-1 mx-4">
            <div className={`h-1 bg-gradient-to-r from-blue-500 to-purple-500 relative ${
              animatingPhoton ? 'animate-pulse' : ''
            }`}>
              {animatingPhoton && (
                <div className="absolute top-1/2 left-0 w-4 h-4 bg-yellow-400 rounded-full animate-[slide_0.75s_ease-in-out] -translate-y-1/2" />
              )}
            </div>
            <ArrowRight className="w-8 h-8 text-purple-400 mx-auto -mt-4" />
          </div>

          {/* Eve (conditional) */}
          {eveEnabled && (
            <>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-3 animate-pulse">
                  <Eye className="w-12 h-12 text-white" />
                </div>
                <div className="text-white text-lg">Eve</div>
                <div className="text-red-400 text-sm">Eavesdropper</div>
              </div>

              <div className="flex-1 mx-4">
                <div className={`h-1 bg-gradient-to-r from-purple-500 to-cyan-500 relative ${
                  animatingPhoton ? 'animate-pulse' : ''
                }`}>
                  {animatingPhoton && (
                    <div className="absolute top-1/2 left-0 w-4 h-4 bg-red-400 rounded-full animate-[slide_0.75s_ease-in-out_0.75s] -translate-y-1/2" />
                  )}
                </div>
                <ArrowRight className="w-8 h-8 text-cyan-400 mx-auto -mt-4" />
              </div>
            </>
          )}

          {/* Bob */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-cyan-600 rounded-full flex items-center justify-center mb-3">
              <Radio className="w-12 h-12 text-white" />
            </div>
            <div className="text-white text-lg">Bob</div>
            <div className="text-gray-400 text-sm">Receiver</div>
          </div>
        </div>

        {eveEnabled && (
          <div className="mt-6 bg-red-900/30 border border-red-500/50 rounded p-4 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
              <div className="text-red-200 text-sm">
                <strong>Intercept-Resend Attack:</strong> Eve measures each photon (collapsing its quantum state) 
                and resends it to Bob. This measurement disturbs the quantum states when Eve uses wrong bases.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-cyan-400 font-mono mb-2">{stats.totalPhotons}</div>
          <div className="text-gray-400">Total Photons</div>
        </div>
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-red-400 font-mono mb-2">{stats.eveInterceptions}</div>
          <div className="text-gray-400">Eve Interceptions</div>
        </div>
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-yellow-400 font-mono mb-2">{stats.disturbedPhotons}</div>
          <div className="text-gray-400">Disturbed Photons</div>
        </div>
        <div className="bg-[#1a1f35] rounded-lg p-6 text-center border border-gray-800">
          <div className="text-5xl text-green-400 font-mono mb-2">{stats.normalTransmissions}</div>
          <div className="text-gray-400">Normal Transmissions</div>
        </div>
      </div>

      {/* Comparison Table */}
      {photons.length > 0 && (
        <div className="bg-[#1a1f35] rounded-lg overflow-hidden border border-gray-800">
          <h3 className="text-cyan-400 text-xl p-6 pb-4">Photon Transmission Details</h3>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-[#252b47] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-cyan-400 text-left">#</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Alice</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">A Basis</th>
                  {eveEnabled && (
                    <>
                      <th className="px-4 py-3 text-red-400 text-left">Eve Basis</th>
                      <th className="px-4 py-3 text-red-400 text-left">Eve Measure</th>
                      <th className="px-4 py-3 text-red-400 text-left">Resent</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-cyan-400 text-left">B Basis</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Bob</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Disturbed?</th>
                  <th className="px-4 py-3 text-cyan-400 text-left">Key Bit</th>
                </tr>
              </thead>
              <tbody>
                {photons.slice().reverse().map((photon) => (
                  <tr key={photon.photonNumber} className={`border-t border-gray-800 ${
                    photon.disturbed ? 'bg-red-900/20' : 'hover:bg-[#252b47]'
                  }`}>
                    <td className="px-4 py-3 text-white">{photon.photonNumber}</td>
                    <td className="px-4 py-3 text-cyan-400 font-mono">{photon.aliceBit}</td>
                    <td className="px-4 py-3 text-yellow-400 font-mono">{photon.aliceBasis}</td>
                    {eveEnabled && (
                      <>
                        <td className="px-4 py-3 text-red-400 font-mono">{photon.eveBasis}</td>
                        <td className="px-4 py-3 text-red-400 font-mono">{photon.eveMeasurement}</td>
                        <td className="px-4 py-3 text-red-400 font-mono">{photon.eveResent}</td>
                      </>
                    )}
                    <td className="px-4 py-3 text-yellow-400 font-mono">{photon.bobBasis}</td>
                    <td className="px-4 py-3 text-cyan-400 font-mono">{photon.bobBit}</td>
                    <td className="px-4 py-3">
                      {photon.disturbed ? (
                        <span className="text-red-400">YES ⚠️</span>
                      ) : (
                        <span className="text-green-400">NO</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {photon.keyBit !== null ? (
                        <span className="text-cyan-400 font-mono">{photon.keyBit}</span>
                      ) : (
                        <span className="text-gray-600 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
        <h3 className="text-cyan-400 text-xl mb-4">How Eve's Eavesdropping Works</h3>
        <div className="space-y-3 text-gray-300">
          <p>
            <strong className="text-white">Without Eve:</strong> Photons travel directly from Alice to Bob. 
            Bob's measurements match Alice's bits when they use the same basis.
          </p>
          <p>
            <strong className="text-white">With Eve (Intercept-Resend):</strong> Eve intercepts each photon, 
            measures it using a randomly chosen basis, and resends a new photon based on her measurement.
          </p>
          <p>
            <strong className="text-white">Quantum Disturbance:</strong> When Eve uses a different basis than Alice, 
            the measurement collapses the quantum state incorrectly, introducing errors that Bob will detect.
          </p>
          <p>
            <strong className="text-white">No-Cloning Theorem:</strong> Eve cannot copy the quantum state - 
            she must measure and resend, which inevitably disturbs the system.
          </p>
        </div>
      </div>
    </div>
  );
}
