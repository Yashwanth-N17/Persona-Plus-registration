import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const checkHover = () => {
      const el = document.querySelectorAll("a, button, input, .interactive");
      el.forEach((node) => {
        node.addEventListener("mouseenter", () => setHovering(true));
        node.addEventListener("mouseleave", () => setHovering(false));
      });
    };
    window.addEventListener("mousemove", move);
    checkHover();
    const iv = setInterval(checkHover, 1500);
    return () => {
      window.removeEventListener("mousemove", move);
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setTrail((p) => ({ x: p.x + (pos.x - p.x) * 0.18, y: p.y + (pos.y - p.y) * 0.18 }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pos]);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full mix-blend-screen"
        style={{
          left: pos.x - 8,
          top: pos.y - 8,
          width: 16,
          height: 16,
          background: "radial-gradient(circle, #4a8baf 0%, #4a8baf 60%, transparent 100%)",
          boxShadow: "0 0 20px rgba(74, 139, 175,0.9), 0 0 40px rgba(200, 216, 228,0.6)",
          willChange: "transform",
        }}
        animate={{ scale: hovering ? 2.2 : 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 250 }}
      />
      <div
        className="pointer-events-none fixed z-[9998] rounded-full"
        style={{
          left: trail.x - 24,
          top: trail.y - 24,
          width: 48,
          height: 48,
          background: "radial-gradient(circle, rgba(74, 139, 175,0.25) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />
    </>
  );
};

export default CustomCursor;
