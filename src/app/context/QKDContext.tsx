import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QKDContextType {
  sharedKey: string;
  setSharedKey: (key: string) => void;
  simulationData: SimulationData | null;
  setSimulationData: (data: SimulationData | null) => void;
}

export interface PhotonData {
  photonNumber: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobBit: number;
  sameBasis: boolean;
  match: boolean;
  keyBit: number | null;
}

export interface SimulationData {
  photons: PhotonData[];
  totalPhotons: number;
  sameBasisCases: number;
  matchingBits: number;
  finalKeyBits: number;
}

const QKDContext = createContext<QKDContextType | undefined>(undefined);

export function QKDProvider({ children }: { children: ReactNode }) {
  const [sharedKey, setSharedKey] = useState<string>('');
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  return (
    <QKDContext.Provider value={{ sharedKey, setSharedKey, simulationData, setSimulationData }}>
      {children}
    </QKDContext.Provider>
  );
}

export function useQKD() {
  const context = useContext(QKDContext);
  if (context === undefined) {
    throw new Error('useQKD must be used within a QKDProvider');
  }
  return context;
}
