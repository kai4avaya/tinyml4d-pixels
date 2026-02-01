import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Github, 
  ArrowRight,
  Globe, 
  Users, 
  Zap,
  Layers,
  Star,
  Check
} from 'lucide-react';

/**
 * UTILITY: Random Noise Generator
 */
const pseudoRandom = (x, y) => {
  return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
};

/**
 * COMPONENT: AnimatedLogo
 * Two semi-transparent squares that randomly jitter and overlap on scroll.
 */
const AnimatedLogo = () => {
  const [offsets, setOffsets] = useState({ x1: 0, y1: 0, r1: 0, x2: 0, y2: 0, r2: 0 });

  useEffect(() => {
    const handleScroll = () => {
      // Generate chaotic random offsets based on scroll
      // Reduced range slightly but sped up transition for responsive feel
      setOffsets({
        x1: (Math.random() - 0.5) * 12, 
        y1: (Math.random() - 0.5) * 12,
        r1: (Math.random() - 0.5) * 60, // Clear rotation
        x2: (Math.random() - 0.5) * 12,
        y2: (Math.random() - 0.5) * 12,
        r2: (Math.random() - 0.5) * 60,
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Changed duration to 300ms for responsiveness (no lag)
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Square 1: Blue */}
      <div 
        className="absolute w-6 h-6 bg-blue-600/70 rounded-sm backdrop-blend-multiply transition-all duration-300 ease-out"
        style={{ transform: `translate(${offsets.x1}px, ${offsets.y1}px) rotate(${offsets.r1}deg)` }}
      />
      {/* Square 2: Red/Pink Accent */}
      <div 
        className="absolute w-6 h-6 bg-red-400/70 rounded-sm backdrop-blend-multiply transition-all duration-300 ease-out"
        style={{ transform: `translate(${offsets.x2}px, ${offsets.y2}px) rotate(${offsets.r2}deg)` }}
      />
    </div>
  );
};

/**
 * COMPONENT: AnnouncementModal
 */
const AnnouncementModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white p-8 max-w-md w-full rounded-sm shadow-2xl animate-in fade-in zoom-in duration-300 border-l-4 border-blue-600">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={24} />
        </button>
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            New Launch
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Announcing Certificate Program</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Validate your expertise in Machine Learning Systems. Join our comprehensive curriculum designed by industry experts and earn a recognized credential upon completion.
          </p>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Get Early Access</label>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              required 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm transition-colors shadow-lg shadow-blue-500/30">
            Subscribe for Updates
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * COMPONENT: PixelBackground
 * Features:
 * 1. Base static noise pattern
 * 2. Scrolled-based shift (Optimized for visibility)
 * 3. "Painted" trail where mouse has hovered (persistent change)
 */
const PixelBackground = () => {
  const canvasRef = useRef(null);
  const scrollRef = useRef(0); // Use Ref for scroll to avoid re-renders/stutter
  const touchedPixels = useRef(new Map());

  // Darker palette for better visibility of the effect
  const palette = useMemo(() => [
    '#eef2ff', // 0: Background
    '#e0e7ff', // 1: Background
    '#c7d2fe', '#a5b4fc', '#818cf8', // Blues
    '#6366f1', '#fca5a5', '#86efac', '#fde047', // Accents
    '#94a3b8', '#64748b' // Slates
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    
    const handleMouseMove = (e) => { 
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const cellSize = 12;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);

      const radius = 3; 
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx*dx + dy*dy <= radius*radius) {
            const key = `${gridX + dx},${gridY + dy}`;
            touchedPixels.current.set(key, Math.random());
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;
      
      const cellSize = 12; 
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);

      // Clear with base color
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Get current scroll from Ref directly in the loop
      const currentScroll = scrollRef.current;
      // Make the scroll factor more sensitive so movement is obvious
      const scrollFactor = Math.floor(currentScroll / 4); 

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const key = `${x},${y}`;
          const isTouched = touchedPixels.current.has(key);
          
          // Add scrollFactor to Y to simulate vertical data flow
          // pseudoRandom is deterministic, so changing input Y changes output
          let noiseVal = pseudoRandom(x, y + scrollFactor);
          
          let colorIndex = 0;

          if (isTouched) {
             const touchMod = touchedPixels.current.get(key);
             // Make touched pixels flicker slightly based on scroll too
             colorIndex = Math.floor((noiseVal + touchMod + (currentScroll * 0.001)) * (palette.length - 2)) + 2; 
          } else {
             colorIndex = Math.floor(noiseVal * palette.length * 1.5); 
          }
          
          if (colorIndex >= palette.length) colorIndex = 0; 

          if (colorIndex > 1 || isTouched) {
             ctx.fillStyle = palette[colorIndex] || palette[2];
             ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [palette]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-60 pointer-events-none"
    />
  );
};

/**
 * COMPONENT: ScrollReveal
 */
const ScrollReveal = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.1 });
    
    const currentElement = domRef.current;
    if (currentElement) observer.observe(currentElement);
    
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * COMPONENT: CountUpAnimation
 */
const CountUpAnimation = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 } 
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeValue = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeValue * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, end, duration]);

  return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
};


/**
 * COMPONENT: HighlightText
 */
const HighlightText = ({ children, className = "", variant = "light" }) => {
  const bgClass = variant === "dark" 
    ? "bg-slate-900 text-white" 
    : "bg-white/90 text-slate-900 backdrop-blur-sm shadow-sm";
  
  return (
    <span className={`inline-block px-2 py-0.5 my-0.5 rounded-sm box-decoration-clone ${bgClass} ${className}`}>
      {children}
    </span>
  );
};

/**
 * COMPONENT: ParticleMorphScene
 * Three.js scene that morphs a cube into a sphere on scroll.
 */
const ParticleMorphScene = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const targetScrollProgress = useRef(0);
  const scrollProgress = useRef(0);

  useEffect(() => {
    // Config
    const CONFIG = {
        cubeSize: 8, 
        particleSize: 0.15,
        spreadCube: 4, 
        spreadSphere: 3.5, 
        rotationSpeed: 0.002,
        colors: [0x0099FF, 0xCC00CC, 0x00AA00, 0xEE0000, 0xEEAA00, 0xFF3333]
    };

    let scene, camera, renderer, particleGroup;
    let particles = [];
    let animationFrameId;

    const init = () => {
      if (!canvasRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Scene
      scene = new THREE.Scene();
      // No fog to allow gradient to show
      
      // 2. Camera
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
      camera.position.z = 8;

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        canvas: canvasRef.current 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 4. Particles
      particleGroup = new THREE.Group();
      scene.add(particleGroup);

      const boxGeo = new THREE.BoxGeometry(CONFIG.particleSize, CONFIG.particleSize, CONFIG.particleSize);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);

      const count = CONFIG.cubeSize;
      const offset = (count - 1) / 2;
      const spacing = CONFIG.spreadCube / count;

      for (let x = 0; x < count; x++) {
          for (let y = 0; y < count; y++) {
              for (let z = 0; z < count; z++) {
                  // Grid Position
                  const startX = (x - offset) * spacing;
                  const startY = (y - offset) * spacing;
                  const startZ = (z - offset) * spacing;
                  const startPos = new THREE.Vector3(startX, startY, startZ);

                  // Sphere Position
                  const endPos = startPos.clone().normalize().multiplyScalar(CONFIG.spreadSphere);
                  const radiusVariation = 1 + (Math.random() * 0.2 - 0.1);
                  endPos.multiplyScalar(radiusVariation);

                  // Material
                  const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
                  const material = new THREE.LineBasicMaterial({ 
                      color: color,
                      transparent: true,
                      opacity: 0.9,
                      linewidth: 1
                  });

                  // Mesh
                  const mesh = new THREE.LineSegments(edgesGeo, material);
                  mesh.position.copy(startPos);
                  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

                  particleGroup.add(mesh);

                  particles.push({
                      mesh,
                      startPos,
                      endPos,
                      rotSpeed: {
                          x: (Math.random() - 0.5) * 0.02,
                          y: (Math.random() - 0.5) * 0.02
                      },
                      delay: Math.random() * 0.5 
                  });
              }
          }
      }

      animate();
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth damping
      scrollProgress.current += (targetScrollProgress.current - scrollProgress.current) * 0.05;
      const sp = scrollProgress.current;

      // Rotate group
      const currentRotSpeed = CONFIG.rotationSpeed + (sp * 0.002);
      if (particleGroup) {
        particleGroup.rotation.y += currentRotSpeed;
        particleGroup.rotation.z += currentRotSpeed * 0.2;
      }

      // Update particles
      particles.forEach(p => {
          let localProgress = (sp * 1.5) - (p.delay * 0.5);
          localProgress = Math.max(0, Math.min(1, localProgress));
          const t = localProgress < .5 ? 2 * localProgress * localProgress : -1 + (4 - 2 * localProgress) * localProgress;

          p.mesh.position.lerpVectors(p.startPos, p.endPos, t);
          p.mesh.rotation.x += p.rotSpeed.x;
          p.mesh.rotation.y += p.rotSpeed.y;

          const scale = 1 + (Math.sin(t * Math.PI) * 0.5);
          p.mesh.scale.setScalar(scale);
      });

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    const onResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    const onScroll = () => {
       if (!containerRef.current) return;
       const rect = containerRef.current.getBoundingClientRect();
       const viewportHeight = window.innerHeight;
       
       // Calculate progress based on how far we've scrolled into the 400vh section
       // Total scrollable height is rect.height - viewportHeight
       const totalDistance = rect.height - viewportHeight;

       const calculatedProgress = totalDistance > 0 ? Math.max(0, Math.min(1, -rect.top / totalDistance)) : 0;
       
       console.log('Scroll Debug:', {
           rectTop: rect.top,
           rectHeight: rect.height,
           viewportHeight,
           totalDistance,
           calculatedProgress,
           isStickyActive: rect.top <= 0 && rect.bottom >= viewportHeight
       });
       
       if (totalDistance > 0) {
         // rect.top is 0 at start, negative as we scroll down
         const progress = Math.max(0, Math.min(1, -rect.top / totalDistance));
         targetScrollProgress.current = progress;
       }
    };

    init();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
      if (particleGroup) {
        // basic cleanup
        particleGroup.clear();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
         <style>{`
            @keyframes gradientBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .gradient-bg-anim {
                background: linear-gradient(135deg, #ffadad, #ffd6a5, #fdffb6, #caffbf, #9bf6ff, #a0c4ff, #bdb2ff, #ffc6ff);
                background-size: 200% 200%;
                animation: gradientBG 15s ease infinite;
            }
         `}</style>
         <div className="absolute inset-0 gradient-bg-anim -z-10" />
         <canvas ref={canvasRef} className="block w-full h-full outline-none" />
      </div>
    </div>
  );
};

/**
 * COMPONENT: NavDropdown
 */
const NavDropdown = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 px-4 py-2 font-bold bg-white/80 hover:bg-white border-b-2 border-transparent hover:border-blue-600 transition-all">
        {label} <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-56 bg-white border border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, idx) => (
            <a 
              key={idx} 
              href="#" 
              className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * MAIN COMPONENT: App
 */
export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Hero State
  const [heroState, setHeroState] = useState(() => {
    return typeof window !== 'undefined' && window.scrollY > 50 ? 'swapped' : 'initial';
  }); 

  // Trigger Modal on Load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const img1 = "https://i.pinimg.com/736x/83/c6/4e/83c64e3889dc867e789bfc91253c6d1b.jpg";
  const img2 = "https://i.pinimg.com/736x/29/3f/58/293f584bf85e9bc8545d5312cfb4f6bf.jpg";
  
  const pillarImg1 = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"; 
  const pillarImg2 = "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800"; 
  const pillarImg3 = "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800"; 

  // LOGIC to revert to initial state when scrolling back to top
  useEffect(() => {
    const handleScrollReset = () => {
      // Revert if at very top and currently swapped
      // Increased threshold to 50 to match scroll jacking trigger
      if (window.scrollY < 50 && heroState === 'swapped') {
         setHeroState('initial');
      }
    };
    
    window.addEventListener('scroll', handleScrollReset);
    return () => window.removeEventListener('scroll', handleScrollReset);
  }, [heroState]);

  // SCROLL JACKING LOGIC
  useEffect(() => {
    if (window.scrollY > 50) {
      document.body.style.overflow = 'auto';
      return;
    }

    if (heroState === 'initial') {
      document.body.style.overflow = 'hidden';
    }

    const handleInput = (e) => {
      if (showModal) return;
      if (heroState !== 'initial') return;

      // Prevent upward scroll from triggering the transition
      // This is crucial for fixing the "doesn't turn back" issue
      if (e.type === 'wheel' && e.deltaY <= 0) return;

      setHeroState('transitioning');
      
      setTimeout(() => {
        setHeroState('swapped');
        document.body.style.overflow = 'auto'; 
      }, 1500); 
    };

    window.addEventListener('wheel', handleInput);
    window.addEventListener('touchmove', handleInput);

    return () => {
      window.removeEventListener('wheel', handleInput);
      window.removeEventListener('touchmove', handleInput);
      document.body.style.overflow = 'auto'; 
    };
  }, [heroState, showModal]);

  const navStructure = {
    Learn: ['MLSys Book', 'Tiny Torch', 'Hardware Kits', 'Downloads'],
    Community: ['Forum/Discord', 'Global Workshops', 'Show & Tell'],
    Support: ['Donations', 'Subscribe'],
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <PixelBackground />
      <AnnouncementModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <AnimatedLogo />
              <span className="font-bold text-xl tracking-tight bg-white/50 px-2">tinyML <span className="text-blue-600">4D</span></span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {Object.entries(navStructure).map(([key, items]) => (
                <NavDropdown key={key} label={key} items={items} />
              ))}
              <a href="#about" className="px-4 py-2 font-bold hover:text-blue-600 bg-white/50 hover:bg-white transition-colors">About</a>
            </div>

            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 bg-white rounded-md shadow-sm"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {Object.entries(navStructure).map(([key, items]) => (
                <div key={key} className="py-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">{key}</h3>
                  <div className="pl-4 flex flex-col space-y-2">
                    {items.map(item => (
                      <a key={item} href="#" className="text-sm text-slate-600 hover:text-blue-600">{item}</a>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <a href="#about" className="block font-bold text-slate-900">About</a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <ScrollReveal>
            <div className="space-y-8">
              <HighlightText variant="light" className="text-sm font-mono tracking-widest uppercase text-blue-600 font-bold border border-blue-100">
                v2.0.4 Live
              </HighlightText>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                <HighlightText>Introduction to</HighlightText><br/>
                <HighlightText className="text-blue-600">Machine Learning</HighlightText><br/>
                <HighlightText>Systems.</HighlightText>
              </h1>
              
              <p className="text-xl lg:text-2xl leading-relaxed max-w-lg">
                <HighlightText>
                  Providing the foundation and resources for learning and teaching AI Engineering.
                </HighlightText>
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-sm shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center gap-2 group">
                  Start Learning
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-900 font-bold rounded-sm shadow-md hover:bg-slate-50 transition-all">
                  Join Community
                </button>
              </div>

              {/* Scroll Hint */}
              <div className={`transition-opacity duration-500 ${heroState !== 'initial' ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-sm font-bold text-slate-500 animate-bounce">Scroll to Explore ↓</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Visual Content (Book Cover - Fading Logic) */}
          <div className="relative group perspective-1000 flex justify-center items-center h-[500px]">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              {/* Image Container */}
              {/* REMOVED border-4 border-slate-900 */}
              <div className="relative w-full max-w-sm h-full shadow-2xl rounded-r-lg transform rotate-y-12 hover:rotate-y-0 transition-transform duration-500 flex flex-col overflow-hidden bg-white">
                 
                 {/* Image 1 (Initial) with Label */}
                 <div className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${heroState === 'initial' ? 'opacity-100' : 'opacity-0'}`}>
                   <img 
                     src={img1} 
                     alt="ML Systems Book Cover 1" 
                     className="w-full h-full object-contain bg-slate-100"
                   />
                   <div className="absolute top-4 right-4 bg-white text-slate-900 text-xs font-bold px-3 py-1 shadow-lg">
                     MLSysBook
                   </div>
                 </div>

                 {/* Image 2 (Fade In) with Label */}
                 <div className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${heroState !== 'initial' ? 'opacity-100' : 'opacity-0'}`}>
                   <img 
                     src={img2} 
                     alt="ML Systems Book Cover 2" 
                     className="w-full h-full object-contain bg-slate-100"
                   />
                   <div className="absolute top-4 right-4 bg-white text-slate-900 text-xs font-bold px-3 py-1 shadow-lg">
                     TinyTorch
                   </div>
                 </div>
                 
                 {/* Glitch Overlay for style */}
                 <div className="absolute inset-0 bg-repeat opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
              </div>
            </div>

        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Global Reach', value: 22, suffix: ' Countries', icon: <Globe className="text-blue-600" /> },
                { label: 'Community', value: 17, suffix: ' Sessions', icon: <Users className="text-green-600" /> },
                { label: 'Engagement', value: 43, suffix: ' Presenters', icon: <Zap className="text-yellow-600" /> },
                { label: 'Open Source', value: 18000, suffix: ' Stars', icon: <Github className="text-slate-900" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white/95 border border-slate-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                  <div className="mb-3 p-3 bg-slate-50 rounded-full">{stat.icon}</div>
                  <div className="font-extrabold text-2xl lg:text-3xl text-slate-900">
                    <CountUpAnimation end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- THREE PILLARS (Inner Card Style) --- */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <HighlightText className="text-3xl md:text-5xl font-extrabold mb-4">
              Three Pillars of tinyML 4D
            </HighlightText>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Learn */}
            <ScrollReveal className="delay-0">
              <div className="h-full bg-white border border-slate-200 p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="mb-4">
                   <h3 className="text-3xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Learn</h3>
                </div>

                {/* Inner Card Image - Fades in */}
                <ScrollReveal className="delay-200 w-full mb-6">
                  <div className="relative aspect-video rounded-sm overflow-hidden border border-slate-300 group">
                    <img src={pillarImg1} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Tech" />
                    <div className="absolute inset-0 bg-blue-600 mix-blend-multiply opacity-60 group-hover:opacity-20 transition-opacity"></div>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }}></div>
                  </div>
                </ScrollReveal>

                <div className="flex-grow">
                  <p className="text-slate-600 mb-4 font-medium leading-relaxed">
                    Access the definitive textbook, complete hardware kits (Arduino, Seeed, Raspberry Pi), and TinyTorch labs.
                  </p>
                  <ul className="space-y-2 text-sm font-bold text-slate-700">
                    <li className="flex items-center gap-2 text-blue-600">→ Interactive Labs</li>
                    <li className="flex items-center gap-2 text-blue-600">→ Curriculum Resources</li>
                    <li className="flex items-center gap-2 text-blue-600">→ Hardware Guides</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Participate */}
            <ScrollReveal className="delay-100">
              <div className="h-full bg-white border border-slate-200 p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="mb-4">
                   <h3 className="text-3xl font-bold text-slate-900 border-l-4 border-green-600 pl-4">Participate</h3>
                </div>

                {/* Inner Card Image - Fades in */}
                <ScrollReveal className="delay-300 w-full mb-6">
                  <div className="relative aspect-video rounded-sm overflow-hidden border border-slate-300 group">
                    <img src={pillarImg2} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Lecture" />
                    <div className="absolute inset-0 bg-green-600 mix-blend-multiply opacity-60 group-hover:opacity-20 transition-opacity"></div>
                     <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }}></div>
                  </div>
                </ScrollReveal>

                <div className="flex-grow">
                  <p className="text-slate-600 mb-4 font-medium leading-relaxed">
                    Join our global Applied AI Engineering Workshops. Present your latest findings at our monthly Show & Tell.
                  </p>
                  <ul className="space-y-2 text-sm font-bold text-slate-700">
                    <li className="flex items-center gap-2 text-green-600">→ Weekly Workshops</li>
                    <li className="flex items-center gap-2 text-green-600">→ Discord Community</li>
                    <li className="flex items-center gap-2 text-green-600">→ Expert Q&A</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Support */}
            <ScrollReveal className="delay-200">
              <div className="h-full bg-white border border-slate-200 p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="mb-4">
                   <h3 className="text-3xl font-bold text-slate-900 border-l-4 border-red-600 pl-4">Support</h3>
                </div>

                {/* Inner Card Image - Fades in */}
                <ScrollReveal className="delay-400 w-full mb-6">
                  <div className="relative aspect-video rounded-sm overflow-hidden border border-slate-300 group">
                    <img src={pillarImg3} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Support" />
                    <div className="absolute inset-0 bg-red-600 mix-blend-multiply opacity-60 group-hover:opacity-20 transition-opacity"></div>
                     <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }}></div>
                  </div>
                </ScrollReveal>

                <div className="flex-grow">
                  <p className="text-slate-600 mb-4 font-medium leading-relaxed">
                    Help us expand access to practical AI education in under-resourced regions through donations.
                  </p>
                  <ul className="space-y-2 text-sm font-bold text-slate-700">
                    <li className="flex items-center gap-2 text-red-600">→ Sponsor a Student</li>
                    <li className="flex items-center gap-2 text-red-600">→ Equipment Drives</li>
                    <li className="flex items-center gap-2 text-red-600">→ Open Collective</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* --- PARTNERSHIPS --- */}
      <section className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-6">Partnerships & Sponsorships</h2>
            <p className="text-slate-300 mb-10 text-lg">
              We are grateful for the support of our partners who make this global ecosystem possible.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-12">
              <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center font-bold">E</div>
                <span className="text-xl font-bold tracking-tight">Edge AI Foundation</span>
              </div>
              
              <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                <Layers size={40} />
                <span className="text-xl font-bold tracking-tight">ICTP</span>
              </div>

               <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center font-bold text-slate-900">S</div>
                <span className="text-xl font-bold tracking-tight">Seeed</span>
              </div>

              <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center font-serif font-bold text-slate-900">H</div>
                <span className="text-xl font-bold tracking-tight">Harvard</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
             <div className="font-bold text-xl">MLSys.Ops</div>
             <p className="text-slate-500 text-sm leading-relaxed">
               Democratizing access to machine learning systems education through open-source resources and global community building.
             </p>
             <div className="flex space-x-4">
               <a href="#" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700"><Github size={20}/></a>
               <a href="#" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700"><Globe size={20}/></a>
             </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600">The Book</a></li>
              <li><a href="#" className="hover:text-blue-600">Hardware Kits</a></li>
              <li><a href="#" className="hover:text-blue-600">TinyTorch Source</a></li>
              <li><a href="#" className="hover:text-blue-600">Curriculum</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold mb-4">Stay Updated</h4>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-sm hover:bg-slate-800 transition-colors">
                Subscribe
              </button>
            </div>
            <div className="text-xs text-slate-400">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div>&copy; 2024 MLSys Community. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-slate-900">Privacy</a>
             <a href="#" className="hover:text-slate-900">Terms</a>
             <a href="#" className="hover:text-slate-900">Mission</a>
          </div>
        </div>
      </footer>
      <ParticleMorphScene />
    </div>
  );
}
