import { useEffect, useRef } from "react";

const variants = {
  services: {
    line: "219, 234, 255",
    dot: "255, 255, 255",
    accent: "244, 163, 0",
  },
  home: {
    line: "230, 236, 248",
    dot: "255, 255, 255",
    accent: "245, 180, 58",
  },
  about: {
    line: "191, 219, 254",
    dot: "255, 255, 255",
    accent: "96, 165, 250",
  },
  blog: {
    line: "224, 231, 255",
    dot: "255, 255, 255",
    accent: "168, 85, 247",
  },
  careers: {
    line: "204, 251, 241",
    dot: "255, 255, 255",
    accent: "20, 184, 166",
  },
  contact: {
    line: "254, 226, 226",
    dot: "255, 255, 255",
    accent: "244, 163, 0",
  },
};

function ConstellationBackground({ variant = "services" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    const colors = variants[variant] || variants.services;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const motionScale = prefersReducedMotion ? 0.35 : 1;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles = [];
    const pointer = { x: 0, y: 0, active: false };
    const wrapper = canvas.parentElement;
    const section = wrapper?.parentElement || wrapper;

    const createParticles = () => {
      const particleCount = Math.min(220, Math.max(90, Math.floor(width / 8)));

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx: (Math.random() - 0.5) * 0.9,
        baseVy: (Math.random() - 0.5) * 0.9,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: Math.random() * 1.8 + 1,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resizeCanvas = () => {
      const targetRect = section?.getBoundingClientRect();
      const wrapperRect = wrapper?.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const nextWidth = Math.max(
        1,
        Math.round(wrapperRect?.width || targetRect?.width || window.innerWidth)
      );
      const nextHeight = Math.max(
        360,
        Math.round(wrapperRect?.height || targetRect?.height || window.innerHeight * 0.68)
      );

      if (nextWidth === width && nextHeight === height) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createParticles();
    };

    const drawNetwork = () => {
      context.clearRect(0, 0, width, height);

      if (pointer.active) {
        const pulseRadius = 58 + Math.sin(Date.now() / 140) * 10;

        context.strokeStyle = `rgba(${colors.accent}, 0.34)`;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(pointer.x, pointer.y, pulseRadius, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = `rgba(${colors.accent}, 0.08)`;
        context.beginPath();
        context.arc(pointer.x, pointer.y, pulseRadius * 1.55, 0, Math.PI * 2);
        context.fill();
      }

      particles.forEach((particle, index) => {
        const twinkle = 0.55 + Math.sin(Date.now() / 360 + particle.phase) * 0.45;

        if (pointer.active) {
          const pointerDistance = Math.hypot(
            particle.x - pointer.x,
            particle.y - pointer.y
          );

          if (pointerDistance < 180) {
            const force = ((180 - pointerDistance) / 180) * motionScale;
            const angle = Math.atan2(particle.y - pointer.y, particle.x - pointer.x);
            const swirlAngle = angle + Math.PI / 2;

            particle.vx += Math.cos(angle) * force * 1.15;
            particle.vy += Math.sin(angle) * force * 1.15;
            particle.vx += Math.cos(swirlAngle) * force * 0.48;
            particle.vy += Math.sin(swirlAngle) * force * 0.48;
          }
        } else {
          particle.vx += (particle.baseVx - particle.vx) * 0.025;
          particle.vy += (particle.baseVy - particle.vy) * 0.025;
        }

        particle.vx *= 0.996;
        particle.vy *= 0.996;
        particle.x += particle.vx * motionScale;
        particle.y += particle.vy * motionScale;

        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1;
          particle.x = Math.min(Math.max(particle.x, 0), width);
        }

        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1;
          particle.y = Math.min(Math.max(particle.y, 0), height);
        }

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const nextParticle = particles[nextIndex];
          const distance = Math.hypot(
            particle.x - nextParticle.x,
            particle.y - nextParticle.y
          );

          if (distance < 205) {
            const opacity = (1 - distance / 205) * 0.52;

            context.strokeStyle = `rgba(${colors.line}, ${opacity})`;
            context.lineWidth = 0.8 + opacity * 1.25;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(nextParticle.x, nextParticle.y);
            context.stroke();
          }
        }

        if (pointer.active) {
          const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);

          if (pointerDistance < 235) {
            const opacity = (1 - pointerDistance / 235) * 0.62;

            context.strokeStyle = `rgba(${colors.accent}, ${opacity})`;
            context.lineWidth = 1.2;
            context.beginPath();
            context.moveTo(pointer.x, pointer.y);
            context.lineTo(particle.x, particle.y);
            context.stroke();
          }
        }

        context.fillStyle = `rgba(${colors.accent}, ${0.1 + twinkle * 0.18})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 7.2, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(${colors.line}, ${0.08 + twinkle * 0.18})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 4.8, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(${colors.dot}, ${0.72 + twinkle * 0.28})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius + twinkle * 0.85, 0, Math.PI * 2);
        context.fill();

        if (twinkle > 0.92) {
          context.strokeStyle = `rgba(${colors.dot}, ${twinkle * 0.5})`;
          context.lineWidth = 0.8;
          context.beginPath();
          context.moveTo(particle.x - 5, particle.y);
          context.lineTo(particle.x + 5, particle.y);
          context.moveTo(particle.x, particle.y - 5);
          context.lineTo(particle.x, particle.y + 5);
          context.stroke();
        }
      });

      animationFrame = requestAnimationFrame(drawNetwork);
    };

    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const clearPointer = () => {
      pointer.active = false;
    };

    resizeCanvas();
    drawNetwork();
    const interactionTarget = section || canvas;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && section
        ? new ResizeObserver(resizeCanvas)
        : null;

    window.addEventListener("resize", resizeCanvas);
    resizeObserver?.observe(section);
    interactionTarget.addEventListener("pointermove", updatePointer);
    interactionTarget.addEventListener("pointerleave", clearPointer);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      resizeObserver?.disconnect();
      interactionTarget.removeEventListener("pointermove", updatePointer);
      interactionTarget.removeEventListener("pointerleave", clearPointer);
    };
  }, [variant]);

  return (
    <div className="constellation-bg" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default ConstellationBackground;
