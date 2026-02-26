import React, { useEffect, useRef } from 'react';

interface BlochSphereProps {
  currentState: string;
  aliceBasis: string;
  bobBasis: string;
}

export function BlochSphere({ currentState, aliceBasis, bobBasis }: BlochSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sphere
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw axes
    // Z-axis (vertical)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX, centerY + radius + 20);
    ctx.strokeStyle = '#6b7bb5';
    ctx.lineWidth = 2;
    ctx.stroke();

    // X-axis (horizontal)
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 20, centerY);
    ctx.lineTo(centerX + radius + 20, centerY);
    ctx.strokeStyle = '#6b7bb5';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Y-axis (depth - diagonal)
    const yAxisX = Math.cos(Math.PI / 4) * radius;
    const yAxisY = Math.sin(Math.PI / 4) * radius;
    ctx.beginPath();
    ctx.moveTo(centerX - yAxisX, centerY + yAxisY);
    ctx.lineTo(centerX + yAxisX, centerY - yAxisY);
    ctx.strokeStyle = '#6b7bb5';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw state vector
    let stateX = 0, stateY = 0, stateZ = 0;
    
    switch(currentState) {
      case '|0⟩': stateZ = 1; break;
      case '|1⟩': stateZ = -1; break;
      case '|+⟩': stateX = 1; break;
      case '|-⟩': stateX = -1; break;
    }

    const endX = centerX + stateX * radius;
    const endY = centerY - stateZ * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw state point
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // Draw Alice's basis (red)
    const aliceAngle = aliceBasis === '+' ? 0 : Math.PI / 2;
    const aliceEndX = centerX + Math.cos(aliceAngle) * radius * 0.8;
    const aliceEndY = centerY - Math.sin(aliceAngle) * radius * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(aliceEndX, aliceEndY);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Bob's basis (cyan)
    const bobAngle = bobBasis === '+' ? 0 : Math.PI / 2;
    const bobEndX = centerX + Math.cos(bobAngle) * radius * 0.7;
    const bobEndY = centerY - Math.sin(bobAngle) * radius * 0.7;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(bobEndX, bobEndY);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Z', centerX - 10, centerY - radius - 30);
    ctx.fillText('|0⟩', centerX + 10, centerY - radius - 10);
    
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('Y', centerX - yAxisX - 20, centerY + yAxisY + 20);
    
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('X |+⟩', centerX - radius - 50, centerY + 5);
    ctx.fillText('|-⟩', centerX + radius + 10, centerY + 5);
    
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('|1⟩', centerX - 10, centerY + radius + 25);

  }, [currentState, aliceBasis, bobBasis]);

  return (
    <div className="bg-[#1a1f35] rounded-lg p-6">
      <h3 className="text-center text-cyan-400 text-xl mb-6">
        Quantum State Visualization (Bloch Sphere)
      </h3>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={400} height={400} />
      </div>
      <div className="flex justify-around mt-6 text-center">
        <div>
          <div className="text-gray-400 text-sm mb-1">Current State</div>
          <div className="text-green-400 text-xl font-mono">{currentState}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Alice Basis</div>
          <div className="text-red-400 text-xl font-mono">{aliceBasis}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm mb-1">Bob Basis</div>
          <div className="text-cyan-400 text-xl font-mono">{bobBasis}</div>
        </div>
      </div>
    </div>
  );
}
