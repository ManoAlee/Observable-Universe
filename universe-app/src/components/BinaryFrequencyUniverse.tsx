import React from 'react';

interface Props {
    equation: string;
    constants: string;
}

export default function BinaryFrequencyUniverse({ equation, constants }: Props) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 glass-panel rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Universe Representation</h2>
            <p className="text-lg mb-1"><strong>Equation:</strong> {equation}</p>
            <p className="text-lg"><strong>Constants:</strong> {constants}</p>
            {/* Expand mathematically: show series expansion for binary entropy or frequency‑energy relation */}
            {equation.includes('I(X)') && (
                <div className="mt-4 text-sm">
                    <p>Expansion (Shannon entropy):</p>
                    <pre className="bg-gray-800 p-2 rounded">I(X) = -∑ p_i log₂ p_i</pre>
                </div>
            )}
            {equation.includes('E = hν') && (
                <div className="mt-4 text-sm">
                    <p>Energy‑frequency relation:</p>
                    <pre className="bg-gray-800 p-2 rounded">E = h × ν</pre>
                    <p>Where h = 6.626×10⁻³⁴ J·s</p>
                </div>
            )}
        </div>
    );
}
