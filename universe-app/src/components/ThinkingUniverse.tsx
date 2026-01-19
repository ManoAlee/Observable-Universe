import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Float, Center, CameraControls } from '@react-three/drei'
import * as THREE from 'three'

interface ThinkingUniverseProps {
  clusters: any[]
  onClusterSelect: (cluster: any) => void
  chaosLevel: number
}

export default function ThinkingUniverse({ clusters, onClusterSelect, chaosLevel }: ThinkingUniverseProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const lineRef = useRef<THREE.LineSegments>(null)

  const { nodes, connections } = useMemo(() => {
    const nodePositions = clusters.map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60
    ))

    const lineIndices: number[] = []
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 40) {
          lineIndices.push(i, j)
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(
      lineIndices.map(index => nodePositions[index])
    )

    return { nodes: nodePositions, connections: lineGeometry }
  }, [clusters])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05
      pointsRef.current.position.y = Math.sin(time * 0.2) * 2
    }
    if (lineRef.current) {
      lineRef.current.rotation.y = time * 0.05
      lineRef.current.position.y = Math.sin(time * 0.2) * 2
    }
  })

  return (
    <group>
      <CameraControls makeDefault minDistance={10} maxDistance={150} />

      {/* Neural Connections */}
      <lineSegments geometry={connections} ref={lineRef}>
        <lineBasicMaterial color="#00ccff" transparent opacity={0.2 + (1 - chaosLevel) * 0.3} />
      </lineSegments>

      {/* Neural Nodes (Clusters) */}
      {nodes.map((pos, i) => (
        <NeuralNode
          key={clusters[i].id}
          position={pos}
          cluster={clusters[i]}
          onClick={() => onClusterSelect(clusters[i])}
          onHover={() => setHoveredNode(clusters[i].id)}
          onUnhover={() => setHoveredNode(null)}
          isHovered={hoveredNode === clusters[i].id}
          chaos={chaosLevel}
        />
      ))}

      {/* Background Neural Dust */}
      <NeuralDust count={2000} chaos={chaosLevel} />
    </group>
  )
}

function NeuralNode({ position, cluster, onClick, onHover, onUnhover, isHovered, chaos }: any) {
  return (
    <Float speed={2 + chaos * 5} rotationIntensity={1} floatIntensity={1}>
      <group
        position={position}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => onHover()}
        onPointerOut={() => onUnhover()}
      >
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial
            color={isHovered ? "#00ffff" : "#004466"}
            emissive={isHovered ? "#00ffff" : "#006699"}
            emissiveIntensity={isHovered ? 6 : 1}
          />
        </Sphere>

        {/* Replaced Text label with a geometric indicator */}
        <mesh position={[0, -2.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <octahedronGeometry args={[0.5]} />
          <meshBasicMaterial color={isHovered ? "#fff" : "#00ccff"} transparent opacity={0.6} />
        </mesh>

        {isHovered && (
          <pointLight intensity={10} distance={20} color="#00ffff" />
        )}
      </group>
    </Float>
  )
}

function NeuralDust({ count, chaos }: { count: number, chaos: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 100
      p[i * 3 + 1] = (Math.random() - 0.5) * 100
      p[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    return p
  }, [count])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001 * (1 + chaos * 5)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#00ffff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
    </points>
  )
}
