import React, { type ElementType, useEffect, useState, useCallback, useRef, createContext, useContext } from "react";
// --- START: Routing Imports ---
// --- MODIFIED: Added NavLink for active styling in the new Profile Layout ---
import { createHashRouter, RouterProvider, Link, Outlet, useParams, useNavigate, NavLink } from "react-router-dom";
// --- END: Routing Imports ---
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";
import { gsap } from "gsap";

// --- START: Added Imports for Ballpit Animation ---
import {
  Clock, PerspectiveCamera, Scene, WebGLRenderer, type WebGLRendererParameters, SRGBColorSpace,
  MathUtils, Vector2, Vector3, MeshPhysicalMaterial, ShaderChunk, Color, Object3D,
  InstancedMesh, PMREMGenerator, SphereGeometry, AmbientLight, PointLight,
  ACESFilmicToneMapping, Raycaster, Plane
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Observer } from 'gsap/Observer';
gsap.registerPlugin(Observer);
// --- END: Added Imports for Ballpit Animation ---

// --- ICONS ---
// --- ICONS ---
import { X as CloseIcon, ShoppingCart, Star, Minus, Plus, LogOut, Loader2, Search, Heart, Menu, Mic, Sun, Moon, User, Package, Settings, CheckCircle, XCircle, Trash2, Edit, MapPin } from "lucide-react";
// ======================================================================
// --- 1. TYPES, CONSTANTS & CONTEXT ---
// ======================================================================

interface Product {
  id: number; title: string; description: string; price: number; rating: number; stock: number; brand: string; category: string; thumbnail: string; images: string[];
}
interface CartItem {
  product_id: number; title: string; price: number; image: string; quantity: number;
}

// --- NEW: Added types for new Address and Order features ---
interface Address {
  _id: string; // MongoDB ObjectId is a string on the frontend
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface OrderItem {
  product_id: number;
  title?: string;
  price?: number;
  quantity: number;
  thumbnail?: string;
}

interface OrderDoc {
  _id: string; // MongoDB ObjectId
  user_id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "failed";
  createdAt: string; // ISO date string
}
// --- END: Added types ---

const API_BASE = import.meta.env.VITE_API_BASE;

// Context for sharing global state and functions
const AppContext = createContext<any>(null);
const useApp = () => useContext(AppContext);


// ======================================================================
// --- 2. API WRAPPER with Token Refresh Logic ---
// ======================================================================
const api = {
  async request(method: string, endpoint: string, body: any = null) {
    let accessToken = localStorage.getItem("accessToken");
    const makeRequest = async (token: string | null) => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const options: RequestInit = { method, headers };
      if (body) options.body = JSON.stringify(body);
      return fetch(`${API_BASE}${endpoint}`, options);
    };
    let res = await makeRequest(accessToken);
    if (res.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) { this.logout(); throw new Error("Session expired. Please log in again."); }
      try {
        const refreshRes = await fetch(`${API_BASE}/users/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) });
        if (!refreshRes.ok) throw new Error("Session expired.");
        const data = await refreshRes.json();
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        res = await makeRequest(data.access_token);
      } catch (error) { this.logout(); throw new Error("Session expired. Please log in again."); }
    }
    return res;
  },
  async get(endpoint: string) { return this.request('GET', endpoint); },
  async post(endpoint: string, body: any) { return this.request('POST', endpoint, body); },
  // --- NEW: Added PUT and DELETE methods for address management ---
  async put(endpoint: string, body: any) { return this.request('PUT', endpoint, body); },
  async delete(endpoint: string) { return this.request('DELETE', endpoint); },
  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));
  }
};


// ======================================================================
// --- 3. CUSTOM HOOKS ---
// ======================================================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function useTheme() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            root.classList.add(systemIsDark ? 'dark' : 'light');
        } else {
            root.classList.add(theme);
        }
        
        localStorage.setItem("theme", theme);
    }, [theme]);

    return [theme, setTheme] as const;
}


// ======================================================================
// --- 4. UI SUB-COMPONENTS ---
// ======================================================================
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-200 bg-white hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      },
      size: {
        default: "h-11 px-6 py-2",
        lg: "h-12 rounded-xl px-8 text-base",
        // --- MODIFIED: Added 'sm' and 'icon' sizes ---
        sm: "h-9 rounded-md px-3",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);

const Dialog = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ ease: "easeOut", duration: 0.2 }} className="relative z-10">
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
);

const Sheet = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-xl flex flex-col">
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
);

const ImageWithLoader = ({ src, alt, className }: { src: string; alt: string; className: string; }) => {
    const [isLoading, setIsLoading] = useState(true);
    return (
        <div className={cn("relative overflow-hidden", className)}>
            <AnimatePresence>{isLoading && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />}</AnimatePresence>
            <img src={src} alt={alt} className={cn("w-full h-full object-cover transition-opacity duration-300", isLoading ? 'opacity-0' : 'opacity-100')} onLoad={() => setIsLoading(false)} onError={(e: any) => {e.target.src = `https://placehold.co/600x800/e2e8f0/334155?text=Image+Not+Found`; setIsLoading(false)}}/>
        </div>
    );
};

const ImageZoom = ({ src, alt }: { src: string; alt: string; }) => {
    const [showZoom, setShowZoom] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);
    const lensSize = 150;
    const zoomLevel = 2.5;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;
        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        let x = e.clientX - left;
        let y = e.clientY - top;
        if (x > width - (lensSize / 2)) x = width - (lensSize / 2);
        if (x < (lensSize / 2)) x = (lensSize / 2);
        if (y > height - (lensSize / 2)) y = height - (lensSize / 2);
        if (y < (lensSize / 2)) y = (lensSize / 2);
        setMousePos({ x, y });
    };

    const lensX = mousePos.x - (lensSize / 2);
    const lensY = mousePos.y - (lensSize / 2);
    const bgPosX = -(mousePos.x * zoomLevel - lensSize * 1.25);
    const bgPosY = -(mousePos.y * zoomLevel - lensSize * 1.25);

    return (
        <div 
            className="relative w-full aspect-square"
            onMouseEnter={() => !isLoading && setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
        >
            <AnimatePresence>{isLoading && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />}</AnimatePresence>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={cn("w-full h-full object-cover rounded-xl transition-opacity duration-300", isLoading ? 'opacity-0' : 'opacity-100')}
                onLoad={() => setIsLoading(false)}
            />
            <AnimatePresence>
            {showZoom && (
                <>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute pointer-events-none rounded-lg border-2 border-white bg-white/20 backdrop-blur-sm"
                        style={{ width: lensSize, height: lensSize, top: lensY, left: lensX }}
                    />
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute top-0 left-[105%] h-full w-full pointer-events-none hidden md:block bg-no-repeat border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900"
                        style={{
                            backgroundImage: `url(${src})`,
                            backgroundSize: `${(imgRef.current?.width || 0) * zoomLevel}px ${(imgRef.current?.height || 0) * zoomLevel}px`,
                            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                        }}
                    />
                </>
            )}
            </AnimatePresence>
        </div>
    );
};

interface TextTypeProps {
  className?: string; text: string | string[]; as?: ElementType; typingSpeed?: number;
  pauseDuration?: number; deletingSpeed?: number; loop?: boolean;
}
const TextType = ({
  text, as: Component = 'div', typingSpeed = 50, pauseDuration = 2000,
  deletingSpeed = 30, loop = true, className = '', ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const textArray = Array.isArray(text) ? text : [text];
    const handleTyping = () => {
      const currentText = textArray[textIndex];
      if (isDeleting) {
        if (displayedText.length > 0) {
          setDisplayedText(currentText.substring(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % textArray.length);
        }
      } else {
        if (displayedText.length < currentText.length) {
          setDisplayedText(currentText.substring(0, displayedText.length + 1));
        } else if (loop || textIndex < textArray.length - 1) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(handleTyping, speed);
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, text, textIndex, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <Component className={`${className} after:content-['|'] after:ml-1 after:animate-pulse`} {...props}>
      {displayedText}
    </Component>
  );
};


// --- Ballpit Animation Component ---
// This component remains unchanged.
// ... (All Ballpit classes: X, W, Y, Z, pointer helpers, etc. are here)
interface XConfig {
 canvas?: HTMLCanvasElement;
 id?: string;
 rendererOptions?: Partial<WebGLRendererParameters>;
 size?: 'parent' | { width: number; height: number };
}

interface SizeData {
 width: number;
 height: number;
 wWidth: number;
 wHeight: number;
 ratio: number;
 pixelRatio: number;
}

class X {
 #config: XConfig;
 #postprocessing: any;
 #resizeObserver?: ResizeObserver;
 #intersectionObserver?: IntersectionObserver;
 #resizeTimer?: number;
 #animationFrameId: number = 0;
 #clock: Clock = new Clock();
 #animationState = { elapsed: 0, delta: 0 };
 #isAnimating: boolean = false;
 #isVisible: boolean = false;

 canvas!: HTMLCanvasElement;
 camera!: PerspectiveCamera;
 cameraMinAspect?: number;
 cameraMaxAspect?: number;
 cameraFov!: number;
 maxPixelRatio?: number;
 minPixelRatio?: number;
 scene!: Scene;
 renderer!: WebGLRenderer;
 size: SizeData = {
   width: 0,
   height: 0,
   wWidth: 0,
   wHeight: 0,
   ratio: 0,
   pixelRatio: 0
 };

 render: () => void = this.#render.bind(this);
 onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
 onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {};
 onAfterResize: (size: SizeData) => void = () => {};
 isDisposed: boolean = false;

 constructor(config: XConfig) {
   this.#config = { ...config };
   this.#initCamera();
   this.#initScene();
   this.#initRenderer();
   this.resize();
   this.#initObservers();
 }

 #initCamera() {
   this.camera = new PerspectiveCamera();
   this.cameraFov = this.camera.fov;
 }

 #initScene() {
   this.scene = new Scene();
 }

 #initRenderer() {
   if (this.#config.canvas) {
     this.canvas = this.#config.canvas;
   } else if (this.#config.id) {
     const elem = document.getElementById(this.#config.id);
     if (elem instanceof HTMLCanvasElement) {
       this.canvas = elem;
     } else {
       console.error('Three: Missing canvas or id parameter');
     }
   } else {
     console.error('Three: Missing canvas or id parameter');
   }
   this.canvas!.style.display = 'block';
   const rendererOptions: WebGLRendererParameters = {
     canvas: this.canvas,
     powerPreference: 'high-performance',
     ...(this.#config.rendererOptions ?? {})
   };
   this.renderer = new WebGLRenderer(rendererOptions);
   this.renderer.outputColorSpace = SRGBColorSpace;
 }

 #initObservers() {
   if (!(this.#config.size instanceof Object)) {
     window.addEventListener('resize', this.#onResize.bind(this));
     if (this.#config.size === 'parent' && this.canvas.parentNode) {
       this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
       this.#resizeObserver.observe(this.canvas.parentNode as Element);
     }
   }
   this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), {
     root: null,
     rootMargin: '0px',
     threshold: 0
   });
   this.#intersectionObserver.observe(this.canvas);
   document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
 }

 #onResize() {
   if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
   this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100);
 }

 resize() {
   let w: number, h: number;
   if (this.#config.size instanceof Object) {
     w = this.#config.size.width;
     h = this.#config.size.height;
   } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
     w = (this.canvas.parentNode as HTMLElement).offsetWidth;
     h = (this.canvas.parentNode as HTMLElement).offsetHeight;
   } else {
     w = window.innerWidth;
     h = window.innerHeight;
   }
   this.size.width = w;
   this.size.height = h;
   this.size.ratio = w / h;
   this.#updateCamera();
   this.#updateRenderer();
   this.onAfterResize(this.size);
 }

 #updateCamera() {
   this.camera.aspect = this.size.width / this.size.height;
   if (this.camera.isPerspectiveCamera && this.cameraFov) {
     if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
       this.#adjustFov(this.cameraMinAspect);
     } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
       this.#adjustFov(this.cameraMaxAspect);
     } else {
       this.camera.fov = this.cameraFov;
     }
   }
   this.camera.updateProjectionMatrix();
   this.updateWorldSize();
 }

 #adjustFov(aspect: number) {
   const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
   const newTan = tanFov / (this.camera.aspect / aspect);
   this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
 }

 updateWorldSize() {
   if (this.camera.isPerspectiveCamera) {
     const fovRad = (this.camera.fov * Math.PI) / 180;
     this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
     this.size.wWidth = this.size.wHeight * this.camera.aspect;
   } else if ((this.camera as any).isOrthographicCamera) {
     const cam = this.camera as any;
     this.size.wHeight = cam.top - cam.bottom;
     this.size.wWidth = cam.right - cam.left;
   }
 }

 #updateRenderer() {
   this.renderer.setSize(this.size.width, this.size.height);
   this.#postprocessing?.setSize(this.size.width, this.size.height);
   let pr = window.devicePixelRatio;
   if (this.maxPixelRatio && pr > this.maxPixelRatio) {
     pr = this.maxPixelRatio;
   } else if (this.minPixelRatio && pr < this.minPixelRatio) {
     pr = this.minPixelRatio;
   }
   this.renderer.setPixelRatio(pr);
   this.size.pixelRatio = pr;
 }

 get postprocessing() {
   return this.#postprocessing;
 }
 set postprocessing(value: any) {
   this.#postprocessing = value;
   this.render = value.render.bind(value);
 }

 #onIntersection(entries: IntersectionObserverEntry[]) {
   this.#isAnimating = entries[0].isIntersecting;
   this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
 }

 #onVisibilityChange() {
   if (this.#isAnimating) {
     document.hidden ? this.#stopAnimation() : this.#startAnimation();
   }
 }

 #startAnimation() {
   if (this.#isVisible) return;
   const animateFrame = () => {
     this.#animationFrameId = requestAnimationFrame(animateFrame);
     this.#animationState.delta = this.#clock.getDelta();
     this.#animationState.elapsed += this.#animationState.delta;
     this.onBeforeRender(this.#animationState);
     this.render();
     this.onAfterRender(this.#animationState);
   };
   this.#isVisible = true;
   this.#clock.start();
   animateFrame();
 }

 #stopAnimation() {
   if (this.#isVisible) {
     cancelAnimationFrame(this.#animationFrameId);
     this.#isVisible = false;
     this.#clock.stop();
   }
 }

 #render() {
   this.renderer.render(this.scene, this.camera);
 }

 clear() {
   this.scene.traverse(obj => {
     if ((obj as any).isMesh && typeof (obj as any).material === 'object' && (obj as any).material !== null) {
       Object.keys((obj as any).material).forEach(key => {
         const matProp = (obj as any).material[key];
         if (matProp && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
           matProp.dispose();
         }
       });
       (obj as any).material.dispose();
       (obj as any).geometry.dispose();
     }
   });
   this.scene.clear();
 }

 dispose() {
   this.#onResizeCleanup();
   this.#stopAnimation();
   this.clear();
   this.#postprocessing?.dispose();
   this.renderer.dispose();
   this.isDisposed = true;
 }

 #onResizeCleanup() {
   window.removeEventListener('resize', this.#onResize.bind(this));
   this.#resizeObserver?.disconnect();
   this.#intersectionObserver?.disconnect();
   document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
 }
}

interface WConfig {
 count: number;
 maxX: number;
 maxY: number;
 maxZ: number;
 maxSize: number;
 minSize: number;
 size0: number;
 gravity: number;
 friction: number;
 wallBounce: number;
 maxVelocity: number;
 controlSphere0?: boolean;
 followCursor?: boolean;
}

class W {
 config: WConfig;
 positionData: Float32Array;
 velocityData: Float32Array;
 sizeData: Float32Array;
 center: Vector3 = new Vector3();

 constructor(config: WConfig) {
   this.config = config;
   this.positionData = new Float32Array(3 * config.count).fill(0);
   this.velocityData = new Float32Array(3 * config.count).fill(0);
   this.sizeData = new Float32Array(config.count).fill(1);
   this.center = new Vector3();
   this.#initializePositions();
   this.setSizes();
 }

 #initializePositions() {
   const { config, positionData } = this;
   this.center.toArray(positionData, 0);
   for (let i = 1; i < config.count; i++) {
     const idx = 3 * i;
     positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
     positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
     positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
   }
 }

 setSizes() {
   const { config, sizeData } = this;
   sizeData[0] = config.size0;
   for (let i = 1; i < config.count; i++) {
     sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
   }
 }

 update(deltaInfo: { delta: number }) {
   const { config, center, positionData, sizeData, velocityData } = this;
   let startIdx = 0;
   if (config.controlSphere0) {
     startIdx = 1;
     const firstVec = new Vector3().fromArray(positionData, 0);
     firstVec.lerp(center, 0.1).toArray(positionData, 0);
     new Vector3(0, 0, 0).toArray(velocityData, 0);
   }
   for (let idx = startIdx; idx < config.count; idx++) {
     const base = 3 * idx;
     const pos = new Vector3().fromArray(positionData, base);
     const vel = new Vector3().fromArray(velocityData, base);
     vel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
     vel.multiplyScalar(config.friction);
     vel.clampLength(0, config.maxVelocity);
     pos.add(vel);
     pos.toArray(positionData, base);
     vel.toArray(velocityData, base);
   }
   for (let idx = startIdx; idx < config.count; idx++) {
     const base = 3 * idx;
     const pos = new Vector3().fromArray(positionData, base);
     const vel = new Vector3().fromArray(velocityData, base);
     const radius = sizeData[idx];
     for (let jdx = idx + 1; jdx < config.count; jdx++) {
       const otherBase = 3 * jdx;
       const otherPos = new Vector3().fromArray(positionData, otherBase);
       const otherVel = new Vector3().fromArray(velocityData, otherBase);
       const diff = new Vector3().copy(otherPos).sub(pos);
       const dist = diff.length();
       const sumRadius = radius + sizeData[jdx];
       if (dist < sumRadius) {
         const overlap = sumRadius - dist;
         const correction = diff.normalize().multiplyScalar(0.5 * overlap);
         const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 1));
         pos.sub(correction);
         vel.sub(velCorrection);
         pos.toArray(positionData, base);
         vel.toArray(velocityData, base);
         otherPos.add(correction);
         otherVel.add(correction.clone().multiplyScalar(Math.max(otherVel.length(), 1)));
         otherPos.toArray(positionData, otherBase);
         otherVel.toArray(velocityData, otherBase);
       }
     }
     if (config.controlSphere0) {
       const diff = new Vector3().copy(new Vector3().fromArray(positionData, 0)).sub(pos);
       const d = diff.length();
       const sumRadius0 = radius + sizeData[0];
       if (d < sumRadius0) {
         const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
         const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 2));
         pos.sub(correction);
         vel.sub(velCorrection);
       }
     }
     if (Math.abs(pos.x) + radius > config.maxX) {
       pos.x = Math.sign(pos.x) * (config.maxX - radius);
       vel.x = -vel.x * config.wallBounce;
     }
     if (config.gravity === 0) {
       if (Math.abs(pos.y) + radius > config.maxY) {
         pos.y = Math.sign(pos.y) * (config.maxY - radius);
         vel.y = -vel.y * config.wallBounce;
       }
     } else if (pos.y - radius < -config.maxY) {
       pos.y = -config.maxY + radius;
       vel.y = -vel.y * config.wallBounce;
     }
     const maxBoundary = Math.max(config.maxZ, config.maxSize);
     if (Math.abs(pos.z) + radius > maxBoundary) {
       pos.z = Math.sign(pos.z) * (config.maxZ - radius);
       vel.z = -vel.z * config.wallBounce;
     }
     pos.toArray(positionData, base);
     vel.toArray(velocityData, base);
   }
 }
}

class Y extends MeshPhysicalMaterial {
 uniforms: { [key: string]: { value: any } } = {
   thicknessDistortion: { value: 0.1 },
   thicknessAmbient: { value: 0 },
   thicknessAttenuation: { value: 0.1 },
   thicknessPower: { value: 2 },
   thicknessScale: { value: 10 }
 };

 constructor(params: any) {
   super({ ...params, defines: { USE_UV: '' } });
   this.onBeforeCompile = shader => {
     Object.assign(shader.uniforms, this.uniforms);
     shader.fragmentShader =
       `
       uniform float thicknessPower;
       uniform float thicknessScale;
       uniform float thicknessDistortion;
       uniform float thicknessAmbient;
       uniform float thicknessAttenuation;
       ` + shader.fragmentShader;
     shader.fragmentShader = shader.fragmentShader.replace(
       'void main() {',
       `
       void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
         vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
         float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
         #ifdef USE_COLOR
           vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
         #else
           vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
         #endif
         reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
       }

       void main() {
       `
     );
     const lightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
       'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
       `
         RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
         RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
       `
     );
     shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsChunk);
     if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
   };
 }
 onBeforeCompile2?: (shader: any) => void;
}

const XConfig = {
 count: 200,
 colors: [0x2E294E, 0x907AD6, 0xEFBCD5, 0xF7D7CD, 0xFFEEDD], // Example color palette
 ambientColor: 0xffffff,
 ambientIntensity: 1,
 lightIntensity: 200,
 materialParams: {
   metalness: 0.5,
   roughness: 0.5,
   clearcoat: 1,
   clearcoatRoughness: 0.15
 },
 minSize: 0.5,
 maxSize: 1,
 size0: 1,
 gravity: 0.7,
 friction: 0.99,
 wallBounce: 0.95,
 maxVelocity: 0.15,
 maxX: 5,
 maxY: 5,
 maxZ: 2,
 controlSphere0: false,
 followCursor: true
};

const U = new Object3D();

let globalPointerActive = false;
const pointerPosition = new Vector2();

interface PointerData {
 position: Vector2;
 nPosition: Vector2;
 hover: boolean;
 touching: boolean;
 onEnter: (data: PointerData) => void;
 onMove: (data: PointerData) => void;
 onClick: (data: PointerData) => void;
 onLeave: (data: PointerData) => void;
 dispose?: () => void;
}

const pointerMap = new Map<HTMLElement, PointerData>();

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
 const defaultData: PointerData = {
   position: new Vector2(),
   nPosition: new Vector2(),
   hover: false,
   touching: false,
   onEnter: () => {},
   onMove: () => {},
   onClick: () => {},
   onLeave: () => {},
   ...options
 };
 if (!pointerMap.has(options.domElement)) {
   pointerMap.set(options.domElement, defaultData);
   if (!globalPointerActive) {
     document.body.addEventListener('pointermove', onPointerMove as EventListener);
     document.body.addEventListener('pointerleave', onPointerLeave as EventListener);
     document.body.addEventListener('click', onPointerClick as EventListener);
     document.body.addEventListener('touchstart', onTouchStart as EventListener, { passive: false });
     document.body.addEventListener('touchmove', onTouchMove as EventListener, { passive: false });
     document.body.addEventListener('touchend', onTouchEnd as EventListener, { passive: false });
     document.body.addEventListener('touchcancel', onTouchEnd as EventListener, { passive: false });
     globalPointerActive = true;
   }
 }
 defaultData.dispose = () => {
   pointerMap.delete(options.domElement);
   if (pointerMap.size === 0) {
     document.body.removeEventListener('pointermove', onPointerMove as EventListener);
     document.body.removeEventListener('pointerleave', onPointerLeave as EventListener);
     document.body.removeEventListener('click', onPointerClick as EventListener);
     document.body.removeEventListener('touchstart', onTouchStart as EventListener);
     document.body.removeEventListener('touchmove', onTouchMove as EventListener);
     document.body.removeEventListener('touchend', onTouchEnd as EventListener);
     document.body.removeEventListener('touchcancel', onTouchEnd as EventListener);
     globalPointerActive = false;
   }
 };
 return defaultData;
}

function onPointerMove(e: PointerEvent) {
 pointerPosition.set(e.clientX, e.clientY);
 processPointerInteraction();
}

function processPointerInteraction() {
 for (const [elem, data] of pointerMap) {
   const rect = elem.getBoundingClientRect();
   if (isInside(rect)) {
     updatePointerData(data, rect);
     if (!data.hover) {
       data.hover = true;
       data.onEnter(data);
     }
     data.onMove(data);
   } else if (data.hover && !data.touching) {
     data.hover = false;
     data.onLeave(data);
   }
 }
}

function onTouchStart(e: TouchEvent) {
 if (e.touches.length > 0) {
   e.preventDefault();
   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
   for (const [elem, data] of pointerMap) {
     const rect = elem.getBoundingClientRect();
     if (isInside(rect)) {
       data.touching = true;
       updatePointerData(data, rect);
       if (!data.hover) {
         data.hover = true;
         data.onEnter(data);
       }
       data.onMove(data);
     }
   }
 }
}

function onTouchMove(e: TouchEvent) {
 if (e.touches.length > 0) {
   e.preventDefault();
   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
   for (const [elem, data] of pointerMap) {
     const rect = elem.getBoundingClientRect();
     updatePointerData(data, rect);
     if (isInside(rect)) {
       if (!data.hover) {
         data.hover = true;
         data.touching = true;
         data.onEnter(data);
       }
       data.onMove(data);
     } else if (data.hover && data.touching) {
       data.onMove(data);
     }
   }
 }
}

function onTouchEnd() {
 for (const [, data] of pointerMap) {
   if (data.touching) {
     data.touching = false;
     if (data.hover) {
       data.hover = false;
       data.onLeave(data);
     }
   }
 }
}

function onPointerClick(e: PointerEvent) {
 pointerPosition.set(e.clientX, e.clientY);
 for (const [elem, data] of pointerMap) {
   const rect = elem.getBoundingClientRect();
   updatePointerData(data, rect);
   if (isInside(rect)) data.onClick(data);
 }
}

function onPointerLeave() {
 for (const data of pointerMap.values()) {
   if (data.hover) {
     data.hover = false;
     data.onLeave(data);
   }
 }
}

function updatePointerData(data: PointerData, rect: DOMRect) {
 data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top);
 data.nPosition.set((data.position.x / rect.width) * 2 - 1, (-data.position.y / rect.height) * 2 + 1);
}

function isInside(rect: DOMRect) {
 return (
   pointerPosition.x >= rect.left &&
   pointerPosition.x <= rect.left + rect.width &&
   pointerPosition.y >= rect.top &&
   pointerPosition.y <= rect.top + rect.height
 );
}

class Z extends InstancedMesh {
 config: typeof XConfig;
 physics: W;
 ambientLight: AmbientLight | undefined;
 light: PointLight | undefined;

 constructor(renderer: WebGLRenderer, params: Partial<typeof XConfig> = {}) {
   const config = { ...XConfig, ...params };
   const roomEnv = new RoomEnvironment();
   const pmrem = new PMREMGenerator(renderer);
   const envTexture = pmrem.fromScene(roomEnv).texture;
   const geometry = new SphereGeometry();
   const material = new Y({ envMap: envTexture, ...config.materialParams });
   material.envMapRotation.x = -Math.PI / 2;
   super(geometry, material, config.count);
   this.config = config;
   this.physics = new W(config);
   this.#setupLights();
   this.setColors(config.colors);
 }

 #setupLights() {
   this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
   this.add(this.ambientLight);
   this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
   this.add(this.light);
 }

 setColors(colors: number[]) {
   if (Array.isArray(colors) && colors.length > 1) {
     const colorUtils = (function (colorsArr: number[]) {
       let baseColors: number[] = colorsArr;
       let colorObjects: Color[] = [];
       baseColors.forEach(col => {
         colorObjects.push(new Color(col));
       });
       return {
         setColors: (cols: number[]) => {
           baseColors = cols;
           colorObjects = [];
           baseColors.forEach(col => {
             colorObjects.push(new Color(col));
           });
         },
         getColorAt: (ratio: number, out: Color = new Color()) => {
           const clamped = Math.max(0, Math.min(1, ratio));
           const scaled = clamped * (baseColors.length - 1);
           const idx = Math.floor(scaled);
           const start = colorObjects[idx];
           if (idx >= baseColors.length - 1) return start.clone();
           const alpha = scaled - idx;
           const end = colorObjects[idx + 1];
           out.r = start.r + alpha * (end.r - start.r);
           out.g = start.g + alpha * (end.g - start.g);
           out.b = start.b + alpha * (end.b - start.b);
           return out;
         }
       };
     })(colors);
     for (let idx = 0; idx < this.count; idx++) {
       this.setColorAt(idx, colorUtils.getColorAt(idx / this.count));
       if (idx === 0) {
         this.light!.color.copy(colorUtils.getColorAt(idx / this.count));
       }
     }

     if (!this.instanceColor) return;
     this.instanceColor.needsUpdate = true;
   }
 }

 update(deltaInfo: { delta: number }) {
   this.physics.update(deltaInfo);
   for (let idx = 0; idx < this.count; idx++) {
     U.position.fromArray(this.physics.positionData, 3 * idx);
     if (idx === 0 && this.config.followCursor === false) {
       U.scale.setScalar(0);
     } else {
       U.scale.setScalar(this.physics.sizeData[idx]);
     }
     U.updateMatrix();
     this.setMatrixAt(idx, U.matrix);
     if (idx === 0) this.light!.position.copy(U.position);
   }
   this.instanceMatrix.needsUpdate = true;
 }
}

interface CreateBallpitReturn {
 three: X;
 spheres: Z;
 setCount: (count: number) => void;
 togglePause: () => void;
 dispose: () => void;
}

function createBallpit(canvas: HTMLCanvasElement, config: any = {}): CreateBallpitReturn {
 const threeInstance = new X({
   canvas,
   size: 'parent',
   rendererOptions: { antialias: true, alpha: true }
 });
 let spheres: Z;
 threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
 threeInstance.camera.position.set(0, 0, 20);
 threeInstance.camera.lookAt(0, 0, 0);
 threeInstance.cameraMaxAspect = 1.5;
 threeInstance.resize();
 initialize(config);
 const raycaster = new Raycaster();
 const plane = new Plane(new Vector3(0, 0, 1), 0);
 const intersectionPoint = new Vector3();
 let isPaused = false;

 canvas.style.touchAction = 'none';
 canvas.style.userSelect = 'none';
 (canvas.style as any).webkitUserSelect = 'none';

 const pointerData = createPointerData({
   domElement: canvas,
   onMove() {
     raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera);
     threeInstance.camera.getWorldDirection(plane.normal);
     raycaster.ray.intersectPlane(plane, intersectionPoint);
     spheres.physics.center.copy(intersectionPoint);
     spheres.config.controlSphere0 = true;
   },
   onLeave() {
     spheres.config.controlSphere0 = false;
   }
 });
 function initialize(cfg: any) {
   if (spheres) {
     threeInstance.clear();
     threeInstance.scene.remove(spheres);
   }
   spheres = new Z(threeInstance.renderer, cfg);
   threeInstance.scene.add(spheres);
 }
 threeInstance.onBeforeRender = deltaInfo => {
   if (!isPaused) spheres.update(deltaInfo);
 };
 threeInstance.onAfterResize = size => {
   spheres.config.maxX = size.wWidth / 2;
   spheres.config.maxY = size.wHeight / 2;
 };
 return {
   three: threeInstance,
   get spheres() {
     return spheres;
   },
   setCount(count: number) {
     initialize({ ...spheres.config, count });
   },
   togglePause() {
     isPaused = !isPaused;
   },
   dispose() {
     pointerData.dispose?.();
     threeInstance.dispose();
   }
 };
}

interface BallpitProps {
 className?: string;
 followCursor?: boolean;
 [key: string]: any;
}

const Ballpit: React.FC<BallpitProps> = ({ className = '', followCursor = true, ...props }) => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const spheresInstanceRef = useRef<CreateBallpitReturn | null>(null);

 useEffect(() => {
   const canvas = canvasRef.current;
   if (!canvas) return;

   spheresInstanceRef.current = createBallpit(canvas, {
     followCursor,
     ...props
   });

   return () => {
     if (spheresInstanceRef.current) {
       spheresInstanceRef.current.dispose();
     }
   };
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 return <canvas className={cn("w-full h-full", className)} ref={canvasRef} />;
};
// --- END: Ballpit Animation Component ---


const Header = () => {
  const { user, cart, wishlist, setAuthModalOpen, setCartOpen, setWishlistOpen, theme, setTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navLinks = ["Catalogue", "Fashion", "Favourite", "Lifestyle"];

  const [effectiveTheme, setEffectiveTheme] = useState('light');
  useEffect(() => {
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setEffectiveTheme(theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme);
  }, [theme]);
 
  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">FASHION</Link>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (<a key={link} href="#" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">{link}</a>))}
          </nav>
          <div className="flex items-center space-x-1">
            <Button onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')} variant="ghost" className="relative p-2 h-auto rounded-full">
              {effectiveTheme === 'dark' ? <Sun/> : <Moon/>}
            </Button>
            <Button onClick={() => setWishlistOpen(true)} variant="ghost" className="relative p-2 h-auto rounded-full">
              <Heart />
              {wishlist.length > 0 && <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-yellow-400 text-black text-xs font-bold text-center leading-5">{wishlist.length}</span>}
            </Button>
            <Button onClick={() => setCartOpen(true)} variant="ghost" className="relative p-2 h-auto rounded-full">
              <ShoppingCart />
              {cart.length > 0 && <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-yellow-400 text-black text-xs font-bold text-center leading-5">{cart.length}</span>}
            </Button>
            {user ? (
              <div className="relative">
                <button onClick={() => setProfileDropdownOpen(o => !o)} className="w-10 h-10 ml-2 flex items-center justify-center bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 font-bold rounded-full text-lg">{user.trim().charAt(0).toUpperCase()}</button>
                <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg p-1.5">
                      <p className="px-3 py-2 font-semibold text-gray-900 dark:text-white truncate text-sm">{user}</p>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                      {/* --- MODIFIED: Changed buttons to Links for navigation --- */}
                      <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"><User size={16} /> My Profile</Link>
                      <Link to="/profile/orders" onClick={() => setProfileDropdownOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"><Package size={16} /> My Orders</Link>
                      <button onClick={() => { api.logout(); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"><LogOut size={16} /> Logout</button>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ) : (<Button onClick={() => setAuthModalOpen(true)} className="hidden md:block ml-2">SIGN UP</Button>)}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-white dark:bg-gray-950 overflow-hidden">
            <div className="py-4 px-4 space-y-2 border-t dark:border-gray-800">
              {navLinks.map(link => (<a key={link} href="#" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-md px-3 py-2">{link}</a>))}
              {!user && <Button onClick={() => { setAuthModalOpen(true); setMenuOpen(false); }} className="w-full mt-2">SIGN UP</Button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
};

const slides = [
  { id: 1, title: "Summer Sale Collections", description: "Sale! Up to 50% off!", img: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb", bg: "bg-gradient-to-r from-yellow-50 to-pink-50" },
  { id: 2, title: "Winter Sale Collections", description: "Sale! Up to 50% off!", img: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb", bg: "bg-gradient-to-r from-pink-50 to-blue-50" },
  { id: 3, title: "Spring Sale Collections", description: "Sale! Up to 50% off!", img: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb", bg: "bg-gradient-to-r from-blue-50 to-yellow-50" },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[calc(80vh)] my-8 rounded-3xl overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className={`${slide.bg} flex-shrink-0 w-full h-full flex flex-col md:flex-row text-gray-800`}>
            <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center gap-4 text-center p-4">
              {current === index && (
                <TextType
                  as="h1"
                  text={[slide.description, slide.title]}
                  typingSpeed={75} deletingSpeed={40} pauseDuration={1500}
                  className="text-5xl lg:text-7xl font-extrabold text-shadow"
                />
              )}
              <a href="#products-section">
                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.5, duration: 0.5}}>
                  <button className="rounded-md bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800 transition-colors">
                    SHOP NOW
                  </button>
                </motion.div>
              </a>
            </div>
            <div className="w-full md:w-1/2 h-full relative">
              <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute m-auto left-1/2 bottom-8 flex gap-4 -translate-x-1/2">
        {slides.map((_, index) => (
          <div key={index} onClick={() => setCurrent(index)} className={`w-3 h-3 rounded-full ring-1 ring-gray-600 cursor-pointer transition-all ${ current === index ? "scale-150 bg-gray-700" : "bg-white/50" }`} />
        ))}
      </div>
    </div>
  );
};

const CategoryCarousel = ({ categories, onCategorySelect, selectedCategory }: { categories: string[]; onCategorySelect: (category: string) => void; selectedCategory: string | null; }) => {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Explore Our Collections</h2>
      <div className="flex p-4 gap-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-5 group mx-auto">
          <div onClick={() => onCategorySelect("")} className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-500 ease-in-out ${selectedCategory && selectedCategory !== "" ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} group-hover:opacity-100 group-hover:scale-95 hover:!opacity-100 hover:!scale-105 hover:-translate-y-4`}>
              <div className={`relative h-[28rem] w-full bg-gray-200 overflow-hidden transition-all duration-300 rounded-2xl ${selectedCategory === "" || selectedCategory === null ? 'ring-4 ring-gray-900 dark:ring-yellow-400 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
                  <ImageWithLoader src={`image.jpg`} alt="All Products" className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white capitalize">All Products</h3>
              </div>
          </div>
          {categories.map((category) => (
            <div key={category} onClick={() => onCategorySelect(category)} className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-500 ease-in-out ${selectedCategory && selectedCategory !== category ? 'opacity-100 scale-95' : 'opacity-100 scale-100'} group-hover:opacity-100 group-hover:scale-95 hover:!opacity-100 hover:!scale-105 hover:-translate-y-4`}>
              <div className={`relative h-[28rem] w-full overflow-hidden transition-all duration-300 rounded-2xl ${selectedCategory === category ? 'ring-4 ring-gray-900 dark:ring-yellow-400 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
                <ImageWithLoader src={`/public/${category}.jpg`} alt={category} className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white capitalize">{category.replace(/-/g, ' ')}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductFilters = ({ search, setSearch, toggleMic, listening, micSupported, sort, setSort }: any) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
    <div className="relative w-full md:w-auto md:flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for products..." className="w-full border dark:border-gray-700 bg-transparent rounded-lg pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition" />
      <button type="button" onClick={toggleMic} disabled={!micSupported} title={!micSupported ? "Voice search not supported" : "Search with voice"} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${listening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-black dark:hover:text-white'} ${!micSupported && 'cursor-not-allowed text-gray-300'}`}>
        <Mic className="h-5 w-5"/>
      </button>
    </div>
    <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full md:w-auto border dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-900 cursor-pointer focus:ring-2 focus:ring-yellow-400 outline-none">
      <option value="id">Default Sorting</option>
      <option value="-price">Price: High to Low</option>
      <option value="price">Price: Low to High</option>
      <option value="-rating">Sort by Rating</option>
    </select>
  </div>
);

const ProductCard = ({ product }: { product: Product; }) => {
    const { formatPrice, addToCart, toggleWishlist, wishlist } = useApp();
    const isInWishlist = wishlist.some((item: Product) => item.id === product.id);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-xl">
                <Link to={`/product/${product.id}`}>
                    <ImageWithLoader src={product.images[0]} alt={product.title} className="w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"/>
                </Link>
                <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-2 right-2 bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'text-red-500 fill-current' : ''}`}/>
                </button>
            </div>
            <div className="flex-1 mb-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-base truncate hover:underline" title={product.title}>{product.title}</h3>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-lg font-bold">{formatPrice(product.price)}</div>
                    <div className="text-xs text-yellow-600 flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {product.rating.toFixed(1)}</div>
                </div>
                <Button onClick={() => addToCart(product)} className="h-10 px-4">Add</Button>
            </div>
        </div>
    );
}

const ProductCardSkeleton = () => (<div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 animate-pulse"><div className="aspect-[4/5] mb-4 bg-gray-200 dark:bg-gray-700 rounded-xl"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div><div className="flex items-center justify-between"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div><div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div></div></div>);

const Pagination = ({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (p: number) => void; }) => (
  <div className="mt-10 flex items-center justify-center gap-2">
    <Button variant="outline" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium px-4">Page {page} of {pages}</span>
    <Button variant="outline" onClick={() => onPageChange(Math.min(pages, page + 1))} disabled={page >= pages}>Next</Button>
  </div>
);

const BrandLogos = () => {
    const logos = [ "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1280px-H%26M-Logo.svg.png", "https://upload.wikimedia.org/wikipedia/commons/a/a6/Calvin_klein_logo_web23.svg", "https://upload.wikimedia.org/wikipedia/commons/0/00/Samsung_Orig_Wordmark_BLACK_RGB.png", "https://upload.wikimedia.org/wikipedia/commons/0/02/Levi%27s_logo_%282011%29.svg", "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gucci_logo.svg" ];
    return (
        <div className="py-12 border-t border-gray-100 dark:border-gray-800"><div className="max-w-5xl mx-auto flex justify-around items-center gap-8 flex-wrap">{logos.map((logo, i) => (<img key={i} src={logo} alt={`Brand ${i}`} className="h-8 object-contain dark:invert dark:brightness-0 opacity-60"/>))}</div></div>
    );
};

const Footer = () => (
    <footer className="bg-black text-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><div className="bg-yellow-400 text-black p-10 rounded-2xl text-center mb-16"><h2 className="text-3xl font-bold">JOIN SHOPPING COMMUNITY TO GET MONTHLY PROMO</h2><p className="mt-2 text-gray-800">Type your email down below and be young wild generation</p><form className="mt-6 max-w-md mx-auto flex"><input type="email" placeholder="Add your email here" className="flex-1 rounded-l-lg px-4 py-3 border-black outline-none text-black"/><button type="submit" className="bg-black text-white px-6 py-3 rounded-r-lg font-semibold">SEND</button></form></div><div className="grid grid-cols-1 md:grid-cols-4 gap-8"><div><h3 className="text-2xl font-bold">FASHION</h3><p className="mt-4 text-gray-400">Complete your style with awesome clothes from us.</p></div><div><h4 className="font-semibold">Company</h4><ul className="mt-4 space-y-2 text-gray-400"><li><a href="#" className="hover:text-white">About</a></li><li><a href="#" className="hover:text-white">Contact us</a></li><li><a href="#" className="hover:text-white">Support</a></li><li><a href="#" className="hover:text-white">Careers</a></li></ul></div><div><h4 className="font-semibold">Quick Link</h4><ul className="mt-4 space-y-2 text-gray-400"><li><a href="#" className="hover:text-white">Orders Tracking</a></li><li><a href="#" className="hover:text-white">Size Guide</a></li><li><a href="#" className="hover:text-white">FAQs</a></li></ul></div><div><h4 className="font-semibold">Legal</h4><ul className="mt-4 space-y-2 text-gray-400"><li><a href="#" className="hover:text-white">Terms & conditions</a></li><li><a href="#" className="hover:text-white">Privacy Policy</a></li></ul></div></div></div></footer>
);


const CartSheet = () => {
  const { cartOpen, setCartOpen, cart, changeQty, removeFromCart, checkout, formatPrice } = useApp();
  return (
    <Sheet isOpen={cartOpen} onClose={() => setCartOpen(false)}>
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800"><h3 className="text-xl font-bold dark:text-white">Shopping Cart</h3><Button variant="ghost" className="h-auto p-2 rounded-full" onClick={() => setCartOpen(false)}><CloseIcon size={20}/></Button></div>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6"><ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-4"/><h4 className="font-semibold text-lg dark:text-white">Your cart is empty</h4><p className="text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet.</p><Button onClick={() => setCartOpen(false)} variant="outline" className="mt-4">Start Shopping</Button></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map((it: CartItem) => (<div key={it.product_id} className="flex items-start gap-4"><ImageWithLoader src={it.image} alt={it.title} className="w-20 h-20 rounded-lg shrink-0"/><div className="flex-1"><h4 className="font-semibold dark:text-white">{it.title}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(it.price)}</p><div className="flex items-center gap-2 mt-2"><input type="number" min="1" value={it.quantity} onChange={e => changeQty(it.product_id, Number(e.target.value || 1))} className="w-16 border dark:border-gray-700 bg-transparent rounded-md px-2 py-1 text-center"/><button onClick={() => removeFromCart(it.product_id)} className="text-sm text-red-500 hover:underline">Remove</button></div></div></div>))}
          </div>
        )}
        <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50"><div className="flex justify-between font-bold text-lg mb-4 dark:text-white"><span>Subtotal</span><span>{formatPrice(cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0))}</span></div><Button onClick={checkout} disabled={cart.length === 0} className="w-full">Proceed to Checkout</Button></div>
    </Sheet>
  );
}

const WishlistSheet = () => {
    const { wishlistOpen, setWishlistOpen, wishlist, addToCart, toggleWishlist, formatPrice } = useApp();

    const handleMoveToCart = (product: Product) => {
        addToCart(product);
        toggleWishlist(product);
    }

    return (
        <Sheet isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)}>
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800"><h3 className="text-xl font-bold dark:text-white">Your Wishlist</h3><Button variant="ghost" className="h-auto p-2 rounded-full" onClick={() => setWishlistOpen(false)}><CloseIcon size={20}/></Button></div>
            {wishlist.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6"><Heart size={48} className="text-gray-300 dark:text-gray-600 mb-4"/><h4 className="font-semibold text-lg dark:text-white">Your wishlist is empty</h4><p className="text-gray-500 dark:text-gray-400">Add your favorite items to see them here.</p><Button onClick={() => setWishlistOpen(false)} variant="outline" className="mt-4">Discover Products</Button></div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.map((product: Product) => (<div key={product.id} className="flex items-start gap-4"><ImageWithLoader src={product.thumbnail} alt={product.title} className="w-20 h-20 rounded-lg shrink-0"/><div className="flex-1"><h4 className="font-semibold dark:text-white">{product.title}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(product.price)}</p><div className="flex items-center gap-4 mt-2"><button onClick={() => handleMoveToCart(product)} className="text-sm text-blue-500 hover:underline">Move to Cart</button><button onClick={() => toggleWishlist(product)} className="text-sm text-red-500 hover:underline">Remove</button></div></div></div>))}
                </div>
            )}
        </Sheet>
    );
};

// --- MODIFIED: AuthDialog component to include new registration fields ---
const AuthDialog = () => {
    const { authModalOpen, setAuthModalOpen, handleAuth } = useApp();
    const [mode, setMode] = useState<'login' | 'register'>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // --- NEW: State for additional registration fields ---
    const [dob, setDob] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");

    const [loading, setLoading] = useState(false);
    
    const submit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setLoading(true); 
        // --- MODIFIED: Pass all registration data to handleAuth ---
        await handleAuth(mode, email, username, password, { dob, street, city, state, postalCode, country }); 
        setLoading(false); 
    }

    if(!authModalOpen) return null;

    return (
        <Dialog isOpen={true} onClose={() => setAuthModalOpen(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md relative shadow-lg">
                <Button variant="ghost" className="absolute top-4 right-4 h-auto p-2 rounded-full" onClick={() => setAuthModalOpen(false)}><CloseIcon size={20}/></Button>
                <h2 className="text-2xl font-bold mb-2 text-center dark:text-white">{mode === 'login' ? 'Welcome Back!' : 'Create an Account'}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{mode === 'login' ? 'Login to continue shopping' : 'Sign up to get started'}</p>
                <form onSubmit={submit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {mode === 'register' && (
                        <>
                            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            {/* --- NEW: Added registration form fields --- */}
                            <label className="text-sm text-gray-500 dark:text-gray-400 block pt-2">Date of Birth</label>
                            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <h4 className="text-md font-semibold pt-4 text-gray-700 dark:text-gray-200">Default Address</h4>
                            <input type="text" placeholder="Street" value={street} onChange={e => setStreet(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="State / Province" value={state} onChange={e => setState(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                        </>
                    )}
                    {mode === 'login' && (
                        <>
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                        </>
                    )}
                    <Button type="submit" disabled={loading} className="w-full sticky bottom-0">{loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Login' : 'Register')}</Button>
                </form>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{mode === 'login' ? "Don't have an account? " : "Already have an account? "}<button className="font-semibold text-gray-900 dark:text-white hover:underline" onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Register' : 'Login'}</button></div>
            </div>
        </Dialog>
    );
};


// ======================================================================
// --- 5. PAGE COMPONENTS (Existing and New) ---
// ======================================================================

const HomePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sort, setSort] = useState("id");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const recognitionRef = useRef<any>(null);
    const [micSupported, setMicSupported] = useState(false);
    const [listening, setListening] = useState(false);
    
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url: string;
            if (debouncedSearch) {
                url = `${API_BASE}/products/search?search_str=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=12`;
            } else {
                const q = new URLSearchParams({ page: String(page), limit: String(12), sort });
                if (selectedCategory) q.set("category", selectedCategory);
                url = `${API_BASE}/products?${q.toString()}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data.products || []);
            setPages(data.pages || 1);
        } catch (e) {
            toast.error("Could not load products.");
        } finally { setLoading(false); }
    }, [page, selectedCategory, sort, debouncedSearch]);

    useEffect(() => {
        const fetchCategories = async () => {
          try {
            const res = await fetch(`${API_BASE}/categories`);
            setCategories((await res.json()).categories || []);
          } catch (e) { console.warn(e); }
        };
        fetchCategories();
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);
    useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory, sort]);
    
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.onstart = () => setListening(true);
        rec.onend = () => setListening(false);
        rec.onerror = (e: any) => console.error(e.error);
        rec.onresult = (e: any) => {
            const text = Array.from(e.results).map((r: any) => r[0]?.transcript ?? "").join(" ").trim();
            if (text) setSearch(text);
        };
        recognitionRef.current = rec;
        setMicSupported(true);
        return () => { try { rec.abort(); } catch {} };
    }, []);
    
    const toggleMic = () => {
        if (!recognitionRef.current) return;
        if (listening) { recognitionRef.current.stop(); }
        else { try { recognitionRef.current.start(); } catch {} }
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(cat => cat === category ? "" : category);
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Slider />
            <CategoryCarousel categories={categories} onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
            <div id="products-section" className="py-12 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Our Products</h2>
                <ProductFilters search={search} setSearch={setSearch} toggleMic={toggleMic} listening={listening} micSupported={micSupported} sort={sort} setSort={setSort} />
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    <AnimatePresence>
                        {loading ? (
                            Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : products.length === 0 ? (
                            <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-lg mt-8 border dark:border-gray-800"><h3 className="text-xl font-semibold">No Products Found</h3><p className="text-gray-500 mt-2">Try adjusting your search or filters.</p></motion.div>
                        ) : (
                            products.map(p => (
                                <motion.div layout key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <ProductCard product={p} />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
                {pages > 1 && <Pagination page={page} pages={pages} onPageChange={setPage} />}
            </div>
            <BrandLogos/>
        </>
    );
};

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { formatPrice, addToCart } = useApp();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            window.scrollTo(0, 0);
            try {
                const res = await fetch(`${API_BASE}/products/${productId}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                setProduct(data);
            } catch (error) {
                toast.error("Could not load product.");
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (product) {
            const fetchRelated = async () => {
                try {
                    const res = await fetch(`${API_BASE}/products?category=${product.category}&limit=5`);
                    let data = await res.json();
                    setRelated(data.products.filter((p: Product) => p.id !== product.id).slice(0, 4));
                } catch { setRelated([]); }
            };
            fetchRelated();
        }
    }, [product]);

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin" /></div>;
    }

    if (!product) {
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Product not found</h2><Button onClick={() => navigate('/')} className="mt-4">Go Home</Button></div>
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <ImageZoom src={product.images?.[0] || product.thumbnail} alt={product.title} />
                <div>
                    <span className="text-sm bg-yellow-100 text-yellow-800 font-medium px-2 py-1 rounded capitalize">{product.category.replace(/-/g, ' ')}</span>
                    <h1 className="text-4xl font-bold mt-2 dark:text-white">{product.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-md mt-1">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-4"><div className="flex items-center gap-1 text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={20} className={i < Math.round(product.rating) ? "fill-current" : "text-gray-300"} />)}</div><span className="text-gray-600 dark:text-gray-300 font-semibold">{product.rating.toFixed(1)}</span></div>
                    <p className="text-md text-gray-700 dark:text-gray-300 my-6">{product.description}</p>
                    <div className="text-4xl font-bold my-8 dark:text-white">{formatPrice(product.price)}</div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border dark:border-gray-700 rounded-lg"><button onClick={() => setQuantity(q => Math.max(1, q-1))} className="px-3 py-2 text-gray-600 dark:text-gray-300"><Minus size={16}/></button><span className="px-4 py-2 font-semibold">{quantity}</span><button onClick={() => setQuantity(q => q+1)} className="px-3 py-2 text-gray-600 dark:text-gray-300"><Plus size={16}/></button></div>
                        <Button onClick={() => addToCart(product, quantity)} className="flex-1 h-12" size="lg">Add to Cart</Button>
                    </div>
                </div>
            </div>
            {related.length > 0 && (
                <div className="p-6 mt-12 border-t dark:border-gray-800">
                    <h3 className="font-bold text-2xl mb-6">You Might Also Like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {related.map(p => (
                            <Link to={`/product/${p.id}`} key={p.id} className="cursor-pointer group">
                                <ImageWithLoader src={p.thumbnail} alt={p.title} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800"/>
                                <h4 className="text-md font-semibold mt-2 truncate group-hover:underline">{p.title}</h4>
                                <p className="text-md font-bold">{formatPrice(p.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- NEW: ProfileLayout component for nested profile routes ---
const ProfileLayout = () => {
    const { user } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin" /></div>;

    const navItems = [
        { path: "/profile", icon: User, label: "My Profile" },
        { path: "/profile/orders", icon: Package, label: "My Orders" },
        { path: "/profile/addresses", icon: MapPin, label: "My Addresses" },
        { path: "/profile/settings", icon: Settings, label: "Settings" },
    ];

    const activeLinkClass = "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50";
    const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50";

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-8 dark:text-white">Account</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-700">
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 font-bold rounded-full text-xl">
                                {user?.trim().charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg dark:text-white truncate">{user}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome</p>
                            </div>
                        </div>
                        <nav className="mt-4 space-y-1">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/profile"}
                                    className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors", isActive ? activeLinkClass : inactiveLinkClass)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <button onClick={api.logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
                               <LogOut className="w-5 h-5"/>
                               <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </aside>
                <main className="md:col-span-3">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[50vh]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- MODIFIED: ProfilePage is now the main dashboard inside ProfileLayout ---
const ProfilePage = () => {
    const { user } = useApp();
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Hello, {user}!</h2>
            <p className="text-gray-600 dark:text-gray-400">
                From your account dashboard, you can view your recent orders, manage your shipping addresses, and edit your account details. Select an option from the menu to get started.
            </p>
        </div>
    );
};

// --- NEW: OrdersPage component to display user's order history ---
const OrdersPage = () => {
    const [orders, setOrders] = useState<OrderDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useApp();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) {
                toast.error("Could not load your orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            {orders.length === 0 ? (
                <p className="text-gray-500">You haven't placed any orders yet.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="border dark:border-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3 pb-3 border-b dark:border-gray-800">
                                <div>
                                    <p className="font-semibold">Order Date: <span className="font-normal">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                                    <p className="text-xs text-gray-500">Order ID: {order._id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">Total: <span className="font-bold text-lg">{formatPrice(order.total)}</span></p>
                                    <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {order.items.map(item => (
                                    <div key={item.product_id} className="flex items-center gap-4">
                                        <ImageWithLoader src={item.thumbnail || ''} alt={item.title || ''} className="w-16 h-16 rounded-md shrink-0"/>
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- NEW: AddressManagementPage component ---
const AddressManagementPage = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/addresses');
            if (!res.ok) throw new Error("Failed to fetch addresses");
            const data = await res.json();
            setAddresses(data);
        } catch (error) {
            toast.error("Could not load your addresses.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleAdd = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await api.delete(`/users/addresses/${addressId}`);
            if (!res.ok) throw new Error("Failed to delete address");
            toast.success("Address deleted successfully.");
            fetchAddresses();
        } catch (error) {
            toast.error("Could not delete address.");
        }
    };

    const handleSave = async (addressData: Omit<Address, '_id' | 'isDefault'>) => {
        try {
            let res;
            if (editingAddress) { // Update
                res = await api.put(`/users/addresses/${editingAddress._id}`, addressData);
            } else { // Create
                res = await api.post('/users/addresses', addressData);
            }
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed to save address');
            toast.success(`Address ${editingAddress ? 'updated' : 'added'} successfully.`);
            setIsModalOpen(false);
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Addresses</h2>
                <Button onClick={handleAdd}>Add New Address</Button>
            </div>
            {addresses.length === 0 ? (
                <p className="text-gray-500">You haven't added any addresses yet.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                        <div key={addr._id} className="border dark:border-gray-800 rounded-lg p-4 flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{addr.street}</p>
                                <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                                <p className="text-sm text-gray-500">{addr.country}</p>
                                {addr.isDefault && <span className="mt-2 inline-block text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Default</span>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(addr)}><Edit size={16}/></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-500" onClick={() => handleDelete(addr._id)}><Trash2 size={16}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <AddressFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave}
                address={editingAddress} 
            />
        </div>
    );
};

// --- NEW: AddressFormModal component for adding/editing addresses ---
const AddressFormModal = ({ isOpen, onClose, onSave, address }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => Promise<void>, address: Address | null }) => {
    const [formData, setFormData] = useState({ street: '', city: '', state: '', postalCode: '', country: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address) {
            setFormData({
                street: address.street,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country
            });
        } else {
            setFormData({ street: '', city: '', state: '', postalCode: '', country: '' });
        }
    }, [address, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };
    
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md relative shadow-lg">
                <Button variant="ghost" className="absolute top-4 right-4 h-auto p-2 rounded-full" onClick={onClose}><CloseIcon size={20}/></Button>
                <h2 className="text-2xl font-bold mb-6">{address ? 'Edit Address' : 'Add New Address'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="street" value={formData.street} onChange={handleChange} placeholder="Street" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="State / Province" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-4 py-2" required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Save Address'}</Button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
};

const SuccessPage = () => {
    const { fetchCart } = useApp();
    
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return (
        <div className="relative flex flex-col items-center justify-center text-center py-16 md:py-20 min-h-[70vh] overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Ballpit
                    className="opacity-50"
                    count={200}
                    gravity={0.1}
                    friction={0.99}
                />
            </div>
            <div className="relative z-10 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md p-8 rounded-2xl shadow-xl">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                >
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Payment Successful!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-md mx-auto">
                    Thank you for your order. We've received your payment and are getting your items ready for shipment.
                </p>
                <Link to="/">
                    <Button className="mt-8" size="lg">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const CancelPage = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 min-h-[60vh]">
            <XCircle className="w-24 h-24 text-red-500 mb-6" />
            <h1 className="text-4xl font-bold">Order Canceled</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                Your order was canceled. You have not been charged.
            </p>
            <Link to="/">
                <Button className="mt-8" size="lg">
                    Back to Store
                </Button>
            </Link>
        </div>
    );
};


// ======================================================================
// --- 6. LAYOUT COMPONENT (Manages Global State) ---
// ======================================================================

const Layout = () => {
    const [theme, setTheme] = useTheme();
    const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    
    const isLoggedIn = !!localStorage.getItem("accessToken");
    const formatPrice = useCallback((p?: number) => `$${(p || 0).toFixed(2)}`, []);

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn) { setCart([]); return; }
        try {
            const res = await api.get('/cart');
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (data.items.length === 0) {
                setCart([]);
                return;
            }
            const productDetails = await Promise.all(
                data.items.map(async (item: any) => {
                    try {
                        const productRes = await fetch(`${API_BASE}/products/${item.product_id}`);
                        if(!productRes.ok) return null;
                        const productData = await productRes.json();
                        return { ...item, title: productData.title, price: productData.price, image: productData.thumbnail };
                    } catch { return null; }
                })
            );
            setCart(productDetails.filter(Boolean));
        } catch (e) { toast.error("Could not sync your cart."); }
    }, [isLoggedIn]);

    const fetchWishlist = useCallback(async () => {
        if (!isLoggedIn) { setWishlist([]); return; }
        try {
            const res = await api.get('/wishlist');
            if (!res.ok) throw new Error();
            const data = await res.json();
            setWishlist(data.items || []);
        } catch (e) { toast.error("Could not sync your wishlist."); }
    }, [isLoggedIn]);

    useEffect(() => {
        const handleAuthChange = () => { setUser(localStorage.getItem("user")); fetchCart(); fetchWishlist(); };
        window.addEventListener("authChange", handleAuthChange);
        fetchCart();
        fetchWishlist();
        return () => window.removeEventListener("authChange", handleAuthChange);
    }, [fetchCart, fetchWishlist]);

    const addToCart = async (product: Product, quantity = 1) => {
        if (product.stock <= 0) { toast.error("Out of stock"); return; }
        if (!isLoggedIn) { setAuthModalOpen(true); return; }
        try {
            const res = await api.post('/cart/add', { product_id: product.id, quantity });
            if(!res.ok) throw new Error((await res.json()).detail || "Failed to add item");
            await fetchCart();
            toast.success(`${product.title} added to cart!`);
            setCartOpen(true);
        } catch (error: any) { toast.error(error.message); }
    };

    const changeQty = async (product_id: number, qty: number) => {
        if (qty < 1) return;
        try {
            const res = await api.post('/cart/update_quantity', { product_id, quantity: qty });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to update quantity");
            await fetchCart();
        } catch (error: any) { toast.error(error.message); }
    };

    const removeFromCart = async (product_id: number) => {
        try {
            const res = await api.post('/cart/remove', { product_id });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to remove item");
            await fetchCart();
            toast.info("Item removed from cart.");
        } catch (error: any) { toast.error(error.message); }
    };

    const checkout = async () => {
        if (!cart.length) { toast.warning("Cart is empty"); return; }
        try {
            const checkoutData = {
                success_url: `${window.location.origin}/#/success`,
                cancel_url: `${window.location.origin}/#/cancel`,
            };
            const res = await api.post('/cart/checkout', checkoutData);
            if (!res.ok) throw new Error((await res.json()).detail || "Checkout failed");
            const body = await res.json();
            if (body.url) { window.location.href = body.url; }
            else { toast.success(`Order placed! Total: ${formatPrice(body.total)}`); fetchCart(); setCartOpen(false); }
        } catch (e: any) { toast.error(e.message); }
    };

    const toggleWishlist = async (product: Product) => {
        if(!isLoggedIn) { setAuthModalOpen(true); return; }
        const isInWishlist = wishlist.some(item => item.id === product.id);
        try {
            const res = await api.post(isInWishlist ? '/wishlist/remove' : '/wishlist/add', { product_id: product.id });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed to update wishlist");
            await fetchWishlist();
            toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!");
        } catch(error: any) { toast.error(error.message); }
    };

    // --- MODIFIED: handleAuth to accept and send new registration data ---
    const handleAuth = async (mode: 'login' | 'register', email: string, username: string, password: string, extraData?: any) => {
        try {
            const url = `${API_BASE}/users/${mode}`;
            let body;
            if (mode === "login") {
                body = { email, password };
            } else {
                body = {
                    email, username, password,
                    DOB: extraData.dob,
                    address: {
                        street: extraData.street,
                        city: extraData.city,
                        state: extraData.state,
                        postalCode: extraData.postalCode,
                        country: extraData.country,
                    }
                };
            }

            const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error((await res.json()).detail || "Authentication failed");
            
            const data = await res.json();
            if (mode === "login") {
                localStorage.setItem("accessToken", data.access_token);
                localStorage.setItem("refreshToken", data.refresh_token);
                localStorage.setItem("user", data.username || email);
                window.dispatchEvent(new Event("authChange"));
                toast.success("Login successful!");
                setAuthModalOpen(false);
            } else {
                toast.info("Registered successfully! Please login to continue.");
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const contextValue = {
        theme, setTheme, user, cart, wishlist,
        authModalOpen, setAuthModalOpen,
        cartOpen, setCartOpen,
        wishlistOpen, setWishlistOpen,
        isLoggedIn, formatPrice,
        fetchCart, fetchWishlist, addToCart, changeQty, removeFromCart,
        checkout, toggleWishlist, handleAuth
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-200 font-sans transition-colors duration-300">
                <Header />
                <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
                <Footer />
                <AuthDialog />
                <CartSheet />
                <WishlistSheet />
            </div>
        </AppContext.Provider>
    );
};


// ======================================================================
// --- 7. MAIN APP COMPONENT & ROUTER CONFIG ---
// ======================================================================

// --- MODIFIED: Added nested routes for the new Profile section ---
const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "product/:productId",
                element: <ProductDetailPage />
            },
            {
                path: "profile",
                element: <ProfileLayout />,
                children: [
                    { index: true, element: <ProfilePage /> },
                    { path: "orders", element: <OrdersPage /> },
                    { path: "addresses", element: <AddressManagementPage /> },
                    // You can add a <SettingsPage/> component here later
                    { path: "settings", element: <div><h2 className="text-2xl font-bold">Settings</h2><p>Settings page is under construction.</p></div> },
                ]
            },
            {
                path: "success",
                element: <SuccessPage />
            },
            {
                path: "cancel",
                element: <CancelPage />
            }
        ]
    }
]);

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); 
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); }
      `}</style>
      <Toaster position="bottom-right" richColors />
      <RouterProvider router={router} />
    </>
  );
}