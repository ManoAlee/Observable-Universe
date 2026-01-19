import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

export default function UniverseScene({ bloomStrength = 0.7, speed = 1.0 }:{bloomStrength?:number,speed?:number}) {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 10, 25)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    const directional = new THREE.DirectionalLight(0xffffff, 0.4)
    directional.position.set(5, 10, 7)
    scene.add(directional)

    // Shader material for nodes
    const vertexShader = `
      varying vec3 vPosition;
      void main(){
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `

    const fragmentShader = `
      uniform float uTime;
      varying vec3 vPosition;
      void main(){
        float intensity = 0.5 + 0.5 * sin(uTime + length(vPosition) * 4.0);
        vec3 color = mix(vec3(0.03,0.12,0.2), vec3(0.12,0.9,0.5), intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const uniforms = { uTime: { value: 0 } }

    const shaderMat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })

    // Create cluster nodes (spheres) positioned in space
    const clusters = [
      { name: 'ODIN', pos: [-8, 0, 0], size: 2.5 },
      { name: 'ZEUS', pos: [8, 0, 0], size: 2.1 },
      { name: 'KRATOS', pos: [0, 6, -4], size: 1.8 },
      { name: 'MORFEUS', pos: [0, -5, 4], size: 1.9 }
    ]

    const nodeMeshes: THREE.Mesh[] = []

    clusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.size, 48, 32)
      const mesh = new THREE.Mesh(geo, shaderMat)
      mesh.position.set(c.pos[0], c.pos[1], c.pos[2])
      scene.add(mesh)
      nodeMeshes.push(mesh)

      // subtle label using Sprite
      const canvas = document.createElement('canvas')
      canvas.width = 256; canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(c.name, 128, 40)
      const tex = new THREE.CanvasTexture(canvas)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }))
      sprite.scale.set(5, 1.2, 1)
      sprite.position.copy(mesh.position).add(new THREE.Vector3(0, c.size + 1, 0))
      scene.add(sprite)
    })

    // Particles representing data flows
    const particlesCount = 600
    const positions = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    const pointsGeo = new THREE.BufferGeometry()
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pointsMat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.06 })
    const points = new THREE.Points(pointsGeo, pointsMat)
    scene.add(points)

    // post-processing composer (bloom)
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), bloomStrength, 0.4, 0.85)
    composer.addPass(bloomPass)

    // controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    // Animation loop
    let frameId: number
    const clock = new THREE.Clock()

    function animate() {
      const t = clock.getElapsedTime()
      uniforms.uTime.value = t * speed

      // rotate scene slowly
      scene.rotation.y = 0.08 * Math.sin(t * 0.2)

      // animate particles (simple flow)
      const pos = pointsGeo.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < particlesCount; i++) {
        let idx = i * 3
        pos.array[idx] += Math.sin(t + i) * 0.002
        pos.array[idx + 1] += Math.cos(t * 0.5 + i) * 0.001
        // wrap
        if (pos.array[idx] > 20) pos.array[idx] = -20
      }
      pos.needsUpdate = true

      controls.update()
      composer.render()
      frameId = requestAnimationFrame(animate)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '480px', borderRadius: 12, overflow: 'hidden' }} />
}
