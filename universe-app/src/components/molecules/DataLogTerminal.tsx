import React from 'react'
import { Billboard, Text } from '@react-three/drei'
import { LSSIData } from '../../services/universeDecoder'

interface DataLogTerminalProps {
    data: LSSIData | null
    lastUpdate: string
}

export default function DataLogTerminal({ data, lastUpdate }: DataLogTerminalProps) {
    return (
        <Billboard>
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[40, 15]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
            <Text
                position={[-18, 5, 0]}
                fontSize={1.2}
                color="#00ff00"
                anchorX="left"
                anchorY="top"
                font="/fonts/Roboto-VariableFont_wdth,wght.ttf"
            >
                {`> SYSTEM_STATUS: ONLINE\n> CONNECTION: NASA_JPL [SECURE]\n> LAST_UPDATE: ${lastUpdate}\n\n> LIVE TELEMETRY:\n  [NOAA] SOLAR_KP: ${data?.solarKp.toFixed(2) || '---'}\n  [USGS] EARTH_MAG: ${data?.earthMag.toFixed(1) || '---'}\n  [NASA] NEO_DIST: ${data?.neoDist.toFixed(2) || '---'} LD\n\n> LSSI_CALCULATED: ${data?.lssi.toFixed(2) || 'Analyzing...'}\n> PROBABILITY_MATRIX: ACTIVE`}
            </Text>
        </Billboard>
    )
}
