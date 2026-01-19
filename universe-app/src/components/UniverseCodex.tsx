import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UniverseCodexProps {
    mode: string
    isOpen: boolean
    onClose: () => void
}

const CODEX_DATA: Record<string, any> = {
    OPERATOR: {
        title: "NEURAL_NEXUS",
        formula: "S = k_B \\ln \\Omega",
        science: "Neural Topology & Information Entropy. This layer represents the cognitive interface where mythological operators (ODIN, ZEUS) manage the project clusters.",
        facts: ["Active Clusters: 4", "Packet Synchronization: 99.8%", "Neural Entropy: Calculated per node"]
    },
    GENESIS: {
        title: "FLRW_SINGULARITY",
        formula: "(\\frac{\\dot{a}}{a})^2 = \\frac{8\\pi G}{3}\\rho",
        science: "Cosmic Inflation using the Friedmann equations. Tracks the expansion from $t=0$ to the formation of galactic structures.",
        facts: ["Expansion Metric: Matter Dominated", "Cooling: Wien's Law", "Structure: Primordial Scaffolding"]
    },
    STRING_THEORY: {
        title: "M_THEORY_11D",
        formula: "T = \\frac{1}{2\\pi \\alpha'}",
        science: "Fundamental strings vibrating in 11 dimensions. The geometry represents a Calabi-Yau manifold where the shape determines the laws of physics.",
        facts: ["Vibration Modes: Harmonic", "Manifold: 6-Dimensional projection", "Sync: Hyperspace resonance"]
    },
    BINARY: {
        title: "DIGITAL_PHYSICS",
        formula: "I = -\\sum p_i \\log_2 p_i",
        science: "The 'It from Bit' hypothesis. Reality as a discrete computational stack where atoms are composed of binary information units.",
        facts: ["Scale: Macro to Planck", "Logic: XOR/AND Bit-Gating", "Coding: Landauer Density"]
    },
    QUANTUM: {
        title: "SCHRÖDINGER_FIELD",
        formula: "|\\Psi|^2 = \\text{Probability Density}",
        science: "Wavefunction probability clouds. Electrons exist as standing waves around a nucleus, defined by spherical harmonics.",
        facts: ["Uncertainty: Heisenberg Limit", "Collapse: Observer Mediated", "Orbital: Real Harmonics"]
    },
    COSMIC_WEB: {
        title: "SDSS_MACROSTRUCTURE",
        formula: "\\delta = \\frac{\\rho - \\bar{\\rho}}{\\bar{\\rho}}",
        science: "The large-scale structure of the universe. Biased galaxy distribution along dark matter filaments (Sloan Digital Sky Survey inspired).",
        facts: ["Node Count: 2000 Galaxy Clusters", "Filaments: Dark Matter Scaffolding", "Voids: Low Density Spacetime"]
    },
    WORMHOLE: {
        title: "SCHWARZSCHILD_BRIDGE",
        formula: "R_s = \\frac{2GM}{c^2}",
        science: "The Einstein-Rosen Bridge. Relativistic fold in spacetime causing gravitational lensing and dimensional shortcutting.",
        facts: ["Exit Point: Multiversal Shift", "Geometry: Hyperboloid Fold", "Lensing: Einstein Rings"]
    }
}

export default function UniverseCodex({ mode, isOpen, onClose }: UniverseCodexProps) {
    const data = CODEX_DATA[mode] || CODEX_DATA.OPERATOR

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="fixed right-10 top-40 z-[100] w-96 glass-panel p-8 border-r-4 border-cyan-500 pointer-events-auto"
                >
                    <div className="flex justify-between items-start mb-6">
                        <header>
                            <h2 className="text-3xl font-black text-glow text-cyan-400 leading-none">{data.title}</h2>
                            <p className="text-[10px] uppercase font-bold text-white/40 mt-1 tracking-widest">Scientific_Instruction_File</p>
                        </header>
                        <button onClick={onClose} className="text-white/20 hover:text-white transition-all text-xl">✕</button>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-[10px] font-bold text-cyan-500 mb-2 uppercase tracking-tighter">Theoretical_Formula</h3>
                            <div className="bg-white/5 p-4 rounded border border-white/10 font-mono text-cyan-300 text-sm">
                                {data.formula}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold text-cyan-500 mb-2 uppercase tracking-tighter">System_Dynamics</h3>
                            <p className="text-xs text-white/70 leading-relaxed font-mono italic">
                                "{data.science}"
                            </p>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold text-cyan-500 mb-2 uppercase tracking-tighter">Physical_Metadata</h3>
                            <ul className="grid grid-cols-1 gap-1">
                                {data.facts.map((f: string, i: number) => (
                                    <li key={i} className="text-[9px] text-white/50 flex gap-2 items-center">
                                        <div className="w-1 h-1 bg-cyan-500"></div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex gap-4">
                            <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                                <motion.div
                                    className="h-full bg-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
