import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQKD } from '../context/QKDContext';
import { Lock, Unlock, Key, AlertCircle, CheckCircle } from 'lucide-react';
import CryptoJS from 'crypto-js';

export function EncryptionPage() {
  const navigate = useNavigate();
  const { sharedKey } = useQKD();
  
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [encryptionFormat, setEncryptionFormat] = useState<'hex' | 'base64'>('hex');
  const [encryptionError, setEncryptionError] = useState('');
  const [decryptionError, setDecryptionError] = useState('');

  const TARGET_KEY_BITS = 256;

  const validateKey = (key: string): boolean => {
    // Check if key is exactly 256 bits (256 characters of 0s and 1s)
    if (key.length !== TARGET_KEY_BITS) {
      return false;
    }
    // Check if key contains only 0s and 1s
    return /^[01]+$/.test(key);
  };

  const handleEncrypt = () => {
    setEncryptionError('');
    
    if (!message) {
      setEncryptionError('Please enter a message to encrypt');
      return;
    }

    if (!encryptionKey) {
      setEncryptionError('Please enter the 256-bit quantum key');
      return;
    }

    if (!validateKey(encryptionKey)) {
      setEncryptionError('Invalid key format. Key must be exactly 256 bits (256 characters of 0s and 1s)');
      return;
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(message, encryptionKey).toString();
      setEncryptedMessage(encrypted);
      setDecryptedMessage('');
      setDecryptionKey('');
      setDecryptionError('');
    } catch (error) {
      setEncryptionError('Encryption failed. Please try again.');
    }
  };

  const handleDecrypt = () => {
    setDecryptionError('');
    setDecryptedMessage('');
    
    if (!encryptedMessage) {
      setDecryptionError('No encrypted message to decrypt');
      return;
    }

    if (!decryptionKey) {
      setDecryptionError('Please enter the 256-bit quantum key');
      return;
    }

    if (!validateKey(decryptionKey)) {
      setDecryptionError('Invalid key format. Key must be exactly 256 bits (256 characters of 0s and 1s)');
      return;
    }

    // Check if the decryption key matches the encryption key
    if (decryptionKey !== encryptionKey) {
      setDecryptionError('❌ Decryption Failed: Key mismatch. The key you entered does not match the encryption key.');
      return;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, decryptionKey);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (decryptedText) {
        setDecryptedMessage(decryptedText);
      } else {
        setDecryptionError('❌ Decryption Failed: Invalid key or corrupted data');
      }
    } catch (error) {
      setDecryptionError('❌ Decryption Failed: Invalid key');
    }
  };

  const convertToFormat = (encrypted: string): string => {
    if (!encrypted) return '';
    
    if (encryptionFormat === 'hex') {
      try {
        return CryptoJS.enc.Base64.parse(encrypted).toString(CryptoJS.enc.Hex);
      } catch {
        return encrypted;
      }
    }
    return encrypted;
  };

  const formatKeyDisplay = (key: string) => {
    const chunks = [];
    for (let i = 0; i < key.length; i += 8) {
      chunks.push(key.slice(i, i + 8));
    }
    return chunks;
  };

  const formatKeyForTwoLines = (key: string) => {
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

  const handlePasteKey = (setter: (value: string) => void) => {
    navigator.clipboard.readText().then(text => {
      setter(text);
    }).catch(() => {
      alert('Failed to read from clipboard');
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl text-white mb-2">Secure Message Encryption & Decryption</h2>
        <p className="text-gray-400">Using Quantum-Generated 256-bit Key from BB84 Protocol</p>
      </div>

      {/* Reference Key Display (if available) */}
      {sharedKey && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-blue-400" />
            <h3 className="text-blue-400 text-lg">Reference: Your Generated Quantum Key</h3>
          </div>
          <div className="bg-[#0f1321] p-4 rounded font-mono text-xs leading-relaxed mb-3">
            {formatKeyForTwoLines(sharedKey.slice(0, 256)).map((line, lineIdx) => (
              <div key={lineIdx}>
                {line.map((chunk, idx) => (
                  <span key={idx} className="mr-3">
                    <span className="text-red-400">{chunk.slice(0, 4)}</span>
                    <span className="text-green-400">{chunk.slice(4)}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="text-blue-200 text-sm">
            <strong>Note:</strong> Copy this key and paste it below to encrypt/decrypt messages. 
            You can also generate a new key by going back to the QKD Simulator.
          </div>
        </div>
      )}

      {!sharedKey && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="text-yellow-200">
              <strong>No Quantum Key Found.</strong> You can either:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Go to the <button onClick={() => navigate('/')} className="underline text-yellow-300 hover:text-yellow-100">BB84 Simulator</button> to generate a quantum key</li>
                <li>Or manually enter any 256-bit key below for testing</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Encryption Panel */}
        <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-green-400" />
            <h3 className="text-green-400 text-xl">Alice's Encryption</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">256-bit Quantum Key (Password)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Paste your 256-bit key here..."
                  className="flex-1 bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  onClick={() => handlePasteKey(setEncryptionKey)}
                  className="bg-[#252b47] text-cyan-400 border border-gray-700 rounded px-4 py-3 hover:bg-[#2d3351] transition-colors"
                  title="Paste from clipboard"
                >
                  Paste
                </button>
              </div>
              {encryptionKey && (
                <div className="mt-2 text-xs">
                  {validateKey(encryptionKey) ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Valid 256-bit key</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Invalid key (must be exactly 256 bits: 0s and 1s only)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Confidential Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your secret message here..."
                className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500 min-h-[120px] resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Output Format</label>
              <select
                value={encryptionFormat}
                onChange={(e) => setEncryptionFormat(e.target.value as 'hex' | 'base64')}
                className="w-full bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
              >
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
              </select>
            </div>

            {encryptionError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded p-3 text-red-200 text-sm">
                {encryptionError}
              </div>
            )}

            <button
              onClick={handleEncrypt}
              disabled={!message || !encryptionKey}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Encrypt Message
            </button>

            {encryptedMessage && (
              <div>
                <label className="block text-gray-300 mb-2">Encrypted Ciphertext</label>
                <div className="bg-[#0f1321] p-4 rounded border border-green-500/30">
                  <div className="text-green-400 font-mono text-xs break-all">
                    {convertToFormat(encryptedMessage)}
                  </div>
                </div>
                <div className="text-gray-500 text-xs mt-2">
                  Format: {encryptionFormat.toUpperCase()} | Algorithm: AES-256
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decryption Panel */}
        <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Unlock className="w-6 h-6 text-cyan-400" />
            <h3 className="text-cyan-400 text-xl">Bob's Decryption</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">256-bit Quantum Key (Password)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                  placeholder="Paste your 256-bit key here..."
                  className="flex-1 bg-[#252b47] text-white border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  onClick={() => handlePasteKey(setDecryptionKey)}
                  className="bg-[#252b47] text-cyan-400 border border-gray-700 rounded px-4 py-3 hover:bg-[#2d3351] transition-colors"
                  title="Paste from clipboard"
                >
                  Paste
                </button>
              </div>
              {decryptionKey && (
                <div className="mt-2 text-xs">
                  {validateKey(decryptionKey) ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Valid 256-bit key</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Invalid key (must be exactly 256 bits: 0s and 1s only)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Encrypted Message</label>
              <textarea
                value={encryptedMessage}
                readOnly
                placeholder="Encrypted message will appear here after encryption..."
                className="w-full bg-[#252b47] text-gray-400 border border-gray-700 rounded px-4 py-3 min-h-[120px] resize-none font-mono text-xs"
              />
            </div>

            {decryptionError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded p-3 text-red-200 text-sm">
                {decryptionError}
              </div>
            )}

            <button
              onClick={handleDecrypt}
              disabled={!encryptedMessage || !decryptionKey}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Decrypt Message
            </button>

            {decryptedMessage && (
              <div>
                <label className="block text-gray-300 mb-2">Decrypted Plaintext</label>
                <div className="bg-[#0f1321] p-4 rounded border border-cyan-500/30">
                  <div className="text-cyan-400 font-mono text-sm">
                    {decryptedMessage}
                  </div>
                </div>
                <div className="bg-green-900/30 border border-green-500/50 rounded p-3 mt-3">
                  <div className="flex items-center gap-2 text-green-200 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span><strong>Success!</strong> Message decrypted successfully with matching key.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-[#1a1f35] rounded-lg p-6 border border-gray-800">
        <h3 className="text-cyan-400 text-lg mb-3">How It Works</h3>
        <div className="space-y-2 text-gray-300">
          <p>
            <strong className="text-white">1. Enter the 256-bit Key:</strong> Both Alice and Bob must have the exact same 256-bit quantum key generated from the BB84 protocol.
          </p>
          <p>
            <strong className="text-white">2. Encryption:</strong> Alice enters the key and her message. The system uses AES-256 encryption with the quantum key as the password.
          </p>
          <p>
            <strong className="text-white">3. Decryption:</strong> Bob must enter the exact same 256-bit key to decrypt the message. If the key doesn't match, decryption will fail.
          </p>
          <p>
            <strong className="text-white">4. Security:</strong> The quantum key provides perfect security because any attempt to intercept it during QKD distribution would be detected (see Eavesdropping page).
          </p>
        </div>
      </div>
    </div>
  );
}