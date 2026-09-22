import { useState, useEffect, useRef } from "react";
import {
  FaBookOpen,
  FaGraduationCap,
  FaFileAlt,
  FaPenNib,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import contentWritingTeam from "../../assets/content-writing-team.png";
import ConstellationBackground from "../shared/ConstellationBackground";
import TestimonialCarousel from "../shared/TestimonialCarousel";

const servicesPreview = [
  {
    icon: <FaBookOpen />,
    title: "Assignment Help",
    desc: "Guidance on structuring assignments, understanding requirements, and improving academic writing clarity.",
  },
  {
    icon: <FaGraduationCap />,
    title: "Dissertation Support",
    desc: "Step-by-step support for planning, organizing, and refining dissertation chapters with academic guidance.",
  },
  {
    icon: <FaFileAlt />,
    title: "Technical Writing",
    desc: "Support for improving technical documentation, research presentation, and professional report clarity.",
  },
  {
    icon: <FaPenNib />,
    title: "Proofreading & Editing",
    desc: "Detailed review for grammar, structure, formatting, and citation accuracy to strengthen your final draft.",
  },
];

const highlights = [
  {
    icon: <FaShieldAlt />,
    title: "Plagiarism-Free Content",
    desc: "Every project is created from scratch and verified for originality.",
  },
  {
    icon: <FaClock />,
    title: "Fast Turnarounds",
    desc: "Reliable delivery even on tight deadlines, with clear status updates.",
  },
  {
    icon: <FaCheckCircle />,
    title: "Expert Subject Teams",
    desc: "Writers with finance, business, IT, engineering and humanities backgrounds.",
  },
];

const heroStats = [
  {
    icon: <FaUsers />,
    numericTarget: 10000,
    suffix: "+",
    label: "Happy Students",
  },
  {
    icon: <FaShieldAlt />,
    numericTarget: 98,
    suffix: "%",
    label: "Satisfaction Rate",
  },
  {
    icon: <FaFileAlt />,
    numericTarget: 25000,
    suffix: "+",
    label: "Assignments Completed",
  },
  {
    icon: <FaClock />,
    numericTarget: 24,
    suffix: "/7",
    label: "Support Available",
  },
];

function Home({ onNavigate, showIntro = false, onIntroComplete }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(heroStats.map(() => 0));

  const statsBarRef = useRef(null);

  // --- 3D tilt state for hero video frame ---
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroFrameRef = useRef(null);

  // =========================================================
  // BOOK INTRO
  // =========================================================

  useEffect(() => {
    if (!showIntro) return;

    // Mobile/tablet: 1.5 seconds
    // Desktop: 2.2 seconds
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const duration = isMobile ? 1500 : 2200;

    const timer = setTimeout(() => {
      onIntroComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [showIntro, onIntroComplete]);

  // --- Stats intersection observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsBarRef.current) {
      observer.observe(statsBarRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // --- Stats counter animation ---
  useEffect(() => {
    if (!hasAnimated) return;

    let startTime = null;
    const duration = 3200;

    const animateCounts = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      const updatedCounts = heroStats.map((stat) =>
        Math.floor(easeProgress * stat.numericTarget)
      );

      setCounts(updatedCounts);

      if (progress < 1) {
        requestAnimationFrame(animateCounts);
      } else {
        setCounts(
          heroStats.map((stat) => stat.numericTarget)
        );
      }
    };

    requestAnimationFrame(animateCounts);
  }, [hasAnimated]);

  const scrollToFooter = () => {
    document
      .getElementById("site-footer")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Hero video 3D tilt ---
  const handleFrameMouseMove = (e) => {
    const el = heroFrameRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const maxTilt = 10;

    setTilt({
      x: (py - 0.5) * -2 * maxTilt,
      y: (px - 0.5) * 2 * maxTilt,
    });
  };

  const handleFrameMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const shimmeringGoldStyle = {
    background:
      "linear-gradient(135deg, #fff1b8 0%, #f5b03a 50%, #d4af37 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundSize: "200% auto",
    animation: "shine-gold 4s linear infinite",
    display: "inline-block",
  };

  return (
    <div
      className="home-page-shell"
      style={{
        position: "relative",
        backgroundColor: "rgba(9, 9, 11, 0.85)",
      }}
    >
      <style>{`
        .home-page-shell {
          color: #fef08a;
          min-height: 100vh;
          transition: background-color 0.3s ease;
        }

        /* =====================================================
            3D OPENING BOOK INTRO
            ===================================================== */

        .home-intro-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99999;
          background: #050506;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          visibility: visible;
          overflow: hidden;
        }

        .book-3d-scene {
          perspective: 1800px;
          width: 520px;
          height: 320px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .book-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .book-spine {
          position: absolute;
          left: 50%;
          top: -4px;
          bottom: -4px;
          width: 28px;
          transform: translateX(-50%) translateZ(-15px);
          background: linear-gradient(
            90deg,
            #614610,
            #d4af37,
            #96721d
          );
          border-radius: 4px;
          z-index: 10;
          box-shadow:
            0 0 15px rgba(212, 175, 55, 0.35);
        }

        /* =====================================================
            BOOK LEFT COVER
            ===================================================== */

        .book-page-left {
          position: absolute;
          right: 50%;
          top: 0;
          width: 50%;
          height: 100%;

          background: linear-gradient(
            135deg,
            #181307,
            #0d0a03
          );

          border: 2px solid rgba(212, 175, 55, 0.8);
          border-right: none;
          border-radius: 10px 0 0 10px;

          transform-origin: right center;
          transform-style: preserve-3d;

          animation:
            open-book-left
            1.1s
            cubic-bezier(0.4, 0, 0.2, 1)
            forwards;

          z-index: 1;

          box-shadow:
            inset -10px 0 20px rgba(0, 0, 0, 0.45);
        }

        @keyframes open-book-left {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(172deg);
          }
        }

        /* =====================================================
            BOOK RIGHT COVER
            ===================================================== */

        .book-page-right {
          position: absolute;
          left: 50%;
          top: 0;
          width: 50%;
          height: 100%;

          background: linear-gradient(
            135deg,
            #1f1808,
            #110d04
          );

          border: 2px solid rgba(212, 175, 55, 0.8);
          border-left: none;
          border-radius: 0 10px 10px 0;

          transform-origin: left center;
          transform-style: preserve-3d;

          animation:
            open-book-right
            1.1s
            cubic-bezier(0.4, 0, 0.2, 1)
            forwards;

          z-index: 1;

          box-shadow:
            inset 10px 0 20px rgba(0, 0, 0, 0.45);
        }

        @keyframes open-book-right {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(-172deg);
          }
        }

        /* =====================================================
            INNER RIGHT PAGES
            ===================================================== */

        .inner-page-right-1 {
          position: absolute;
          left: 50%;
          top: 2px;
          width: 49%;
          height: 96%;

          background: linear-gradient(
            135deg,
            #261f0a,
            #151005
          );

          border: 1px solid rgba(212, 175, 55, 0.4);
          border-left: none;

          transform-origin: left center;
          transform-style: preserve-3d;

          animation:
            fan-right-1
            0.95s
            cubic-bezier(0.3, 0, 0.2, 1)
            forwards;

          z-index: 2;
        }

        @keyframes fan-right-1 {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(-158deg);
          }
        }

        .inner-page-right-2 {
          position: absolute;
          left: 50%;
          top: 4px;
          width: 48%;
          height: 92%;

          background: linear-gradient(
            135deg,
            #2d250c,
            #1a1306
          );

          border: 1px solid rgba(212, 175, 55, 0.3);
          border-left: none;

          transform-origin: left center;
          transform-style: preserve-3d;

          animation:
            fan-right-2
            0.9s
            cubic-bezier(0.25, 0, 0.2, 1)
            forwards;

          z-index: 3;
        }

        @keyframes fan-right-2 {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(-142deg);
          }
        }

        .inner-page-right-3 {
          position: absolute;
          left: 50%;
          top: 6px;
          width: 47%;
          height: 88%;

          background: linear-gradient(
            135deg,
            #342a0e,
            #1f1707
          );

          border: 1px solid rgba(212, 175, 55, 0.2);
          border-left: none;

          transform-origin: left center;
          transform-style: preserve-3d;

          animation:
            fan-right-3
            0.85s
            cubic-bezier(0.2, 0, 0.2, 1)
            forwards;

          z-index: 4;
        }

        @keyframes fan-right-3 {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(-124deg);
          }
        }

        /* =====================================================
            INNER LEFT PAGES
            ===================================================== */

        .inner-page-left-1 {
          position: absolute;
          right: 50%;
          top: 2px;
          width: 49%;
          height: 96%;

          background: linear-gradient(
            135deg,
            #201908,
            #100c04
          );

          border: 1px solid rgba(212, 175, 55, 0.4);
          border-right: none;

          transform-origin: right center;
          transform-style: preserve-3d;

          animation:
            fan-left-1
            0.95s
            cubic-bezier(0.3, 0, 0.2, 1)
            forwards;

          z-index: 2;
        }

        @keyframes fan-left-1 {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(158deg);
          }
        }

        .inner-page-left-2 {
          position: absolute;
          right: 50%;
          top: 4px;
          width: 48%;
          height: 92%;

          background: linear-gradient(
            135deg,
            #251d0a,
            #130e05
          );

          border: 1px solid rgba(212, 175, 55, 0.3);
          border-right: none;

          transform-origin: right center;
          transform-style: preserve-3d;

          animation:
            fan-left-2
            0.9s
            cubic-bezier(0.25, 0, 0.2, 1)
            forwards;

          z-index: 3;
        }

        @keyframes fan-left-2 {
          0% {
            transform: rotateY(0deg);
          }

          100% {
            transform: rotateY(142deg);
          }
        }

        /* =====================================================
            BOOK TEXT
            ===================================================== */

        .book-spread-content {
          position: absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          z-index: 999999;

          pointer-events: none;

          transform: translateZ(150px);

          isolation: isolate;
        }

        .book-inner-title {
          position: relative;

          font-family: "Cinzel", "Georgia", serif;

          font-size: 2.2rem;
          font-weight: 900;

          letter-spacing: 5px;

          color: #d4af37 !important;

          background: none !important;

          -webkit-background-clip: initial !important;
          background-clip: initial !important;

          -webkit-text-fill-color: #d4af37 !important;

          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.45),
            0 0 12px rgba(212, 175, 55, 0.4);

          text-transform: uppercase;

          opacity: 0;

          animation:
            reveal-text
            0.45s
            ease
            forwards
            0.4s;

          white-space: nowrap;

          z-index: 1000000;
        }

        .book-inner-subtitle {
          position: relative;

          font-family: "Georgia", serif;

          font-size: 0.95rem;
          font-weight: 700;

          letter-spacing: 4px;

          color: #d4af37 !important;

          -webkit-text-fill-color: #d4af37 !important;

          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.45),
            0 0 10px rgba(212, 175, 55, 0.35);

          text-transform: uppercase;

          margin-top: 10px;

          opacity: 0;

          animation:
            reveal-text
            0.4s
            ease
            forwards
            0.65s;

          white-space: nowrap;

          z-index: 1000000;
        }

        @keyframes reveal-text {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
            HERO
            ===================================================== */

        .home-page-shell .home-hero {
          background:
            radial-gradient(
              circle at 18% 16%,
              rgba(212, 175, 55, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 82% 20%,
              rgba(254, 240, 138, 0.05),
              transparent 35%
            ),
            radial-gradient(
              circle at 46% 74%,
              rgba(255, 255, 255, 0.02),
              transparent 40%
            ),
            linear-gradient(
              135deg,
              rgba(9, 9, 11, 0.9) 0%,
              rgba(18, 18, 22, 0.85) 54%,
              rgba(9, 9, 11, 0.9) 100%
            ) !important;

          position: relative;
          z-index: 1;
        }

        @keyframes shine-gold {
          to {
            background-position: 200% center;
          }
        }

        /* =====================================================
            BADGE
            ===================================================== */

        .assignopedia-badge-container {
          display: flex;
          justify-content: center;
          margin-bottom: 3.5rem;
          position: relative;
          z-index: 5;
        }

        .assignopedia-badge {
          position: relative;

          display: inline-flex;
          align-items: center;

          gap: 8px;

          padding: 0.35rem 1.25rem;

          background: rgba(18, 18, 18, 0.85);

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);

          border-radius: 50px;

          border: 1px solid rgba(212, 175, 55, 0.45);

          box-shadow:
            0 0 15px rgba(201, 162, 39, 0.2);
        }

        .assignopedia-badge-text {
          font-family: "Cinzel", "Georgia", serif;

          font-size: 0.75rem;
          font-weight: 800;

          letter-spacing: 2.5px;

          text-transform: uppercase;

          background:
            linear-gradient(
              120deg,
              #bf953f 0%,
              #fff4b8 40%,
              #aa771c 100%
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .assignopedia-badge-icon {
          font-size: 0.82rem;
          color: #f7d774;
        }

        .home-hero h1 {
          color: #ffffff;
        }

        /* =====================================================
            VIDEO
            ===================================================== */

        .hero-video-frame {
          width: 100%;

          border-radius: 16px;

          overflow: hidden;

          border:
            2px solid rgba(212, 175, 55, 0.35);

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(212, 175, 55, 0.15);

          background: #000;

          display: flex;
          align-items: center;
          justify-content: center;

          transform-style: preserve-3d;

          transition:
            transform 0.15s ease-out;
        }

        .hero-video-frame video {
          width: 100%;
          height: 400px;

          display: block;

          object-fit: cover;

          max-height: 420px;
        }

        /* =====================================================
            CARDS - WHITE
            ===================================================== */

        .summary-card,
        .service-preview-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;

          border:
            1px solid rgba(212, 175, 55, 0.35);

          background: #ffffff !important;

          position: relative;

          overflow: hidden;

          color: #111827;
        }

        .summary-card h3,
        .service-preview-card h3 {
          color: #0b2a66 !important;
        }

        .summary-card p,
        .service-preview-card p {
          color: #475569 !important;
        }

        .summary-card:hover,
        .service-preview-card:hover {
          transform: translateY(-5px);

          border-color:
            rgba(212, 175, 55, 0.7);

          box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.2);
        }

        /* =====================================================
            TABLET + MOBILE
            ===================================================== */

        @media (max-width: 768px) {
          .book-3d-scene {
            width: 360px;
            height: 230px;
          }

          /* Faster book animation */
          .book-page-left {
            animation-duration: 0.7s;
          }

          .book-page-right {
            animation-duration: 0.7s;
          }

          .inner-page-right-1 {
            animation-duration: 0.62s;
          }

          .inner-page-right-2 {
            animation-duration: 0.58s;
          }

          .inner-page-right-3 {
            animation-duration: 0.55s;
          }

          .inner-page-left-1 {
            animation-duration: 0.62s;
          }

          .inner-page-left-2 {
            animation-duration: 0.58s;
          }

          .book-inner-title {
            font-size: 1.45rem;
            letter-spacing: 3px;

            animation-duration: 0.3s;
            animation-delay: 0.25s;
          }

          .book-inner-subtitle {
            font-size: 0.7rem;
            letter-spacing: 2.5px;

            animation-duration: 0.28s;
            animation-delay: 0.4s;
          }

          .book-spine {
            width: 20px;
          }

          /* =================================================
              TRUSTED BY STUDENTS WORLDWIDE
              SMALLER / SHORTER ON TABLET & MOBILE
              ================================================= */

          .assignopedia-badge-container {
            margin-bottom: 2.2rem;
          }

          .assignopedia-badge {
            gap: 5px;
            padding: 0.2rem 0.65rem;
            min-height: 26px;
            height: 26px;
            max-width: 90%;
            box-sizing: border-box;
          }

          .assignopedia-badge-text {
            font-size: 0.56rem;
            letter-spacing: 1.4px;
            line-height: 1;
            white-space: nowrap;
          }

          .assignopedia-badge-icon {
            font-size: 0.6rem;
            flex-shrink: 0;
          }
        }

        /* =====================================================
            SMALL MOBILE
            ===================================================== */

        @media (max-width: 480px) {
          .book-3d-scene {
            width: 300px;
            height: 190px;
          }

          .book-inner-title {
            font-size: 1.15rem;
            letter-spacing: 2px;
          }

          .book-inner-subtitle {
            font-size: 0.6rem;
            letter-spacing: 2px;
            margin-top: 7px;
          }

          /* Extra compact badge */
          .assignopedia-badge-container {
            margin-bottom: 1.8rem;
          }

          .assignopedia-badge {
            gap: 4px;
            padding: 0.15rem 0.5rem;
            min-height: 23px;
            height: 23px;
            max-width: 88%;
          }

          .assignopedia-badge-text {
            font-size: 0.48rem;
            letter-spacing: 1px;
            line-height: 1;
          }

          .assignopedia-badge-icon {
            font-size: 0.52rem;
          }
        }

        /* =====================================================
            VERY SMALL PHONES
            ===================================================== */

        @media (max-width: 360px) {
          .assignopedia-badge-container {
            margin-bottom: 1.5rem;
          }

          .assignopedia-badge {
            gap: 3px;
            padding: 0.12rem 0.4rem;
            min-height: 21px;
            height: 21px;
          }

          .assignopedia-badge-text {
            font-size: 0.43rem;
            letter-spacing: 0.8px;
          }

          .assignopedia-badge-icon {
            font-size: 0.48rem;
          }
        }
      `}</style>

      {/* =====================================================
          3D BOOK INTRO
          ===================================================== */}

      {showIntro && (
        <div className="home-intro-overlay">
          <div className="book-3d-scene">

            {/* BOOK PAGES */}
            <div className="book-container">
              <div className="book-spine" />

              <div className="book-page-left" />

              <div className="inner-page-left-2" />

              <div className="inner-page-left-1" />

              <div className="inner-page-right-3" />

              <div className="inner-page-right-2" />

              <div className="inner-page-right-1" />

              <div className="book-page-right" />
            </div>

            {/* TEXT ABOVE ALL BOOK LAYERS */}
            <div className="book-spread-content">
              <div className="book-inner-title">
                Assignopedia
              </div>

              <div className="book-inner-subtitle">
                Opening Knowledge
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          HOME CONTENT
          ===================================================== */}

      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <ConstellationBackground variant="home" />
        </div>

        {/* HERO */}

        <section
          className="hero home-hero"
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="hero-bg-shape"
            aria-hidden="true"
          />

          <div
            className="container position-relative"
            style={{ zIndex: 4 }}
          >
            <div className="assignopedia-badge-container">
              <div className="assignopedia-badge">
                <FaUsers
                  aria-hidden="true"
                  className="assignopedia-badge-icon"
                />

                <span className="assignopedia-badge-text">
                  Trusted by Students Worldwide
                </span>

                <FaCheckCircle
                  aria-hidden="true"
                  className="assignopedia-badge-icon"
                />
              </div>
            </div>

            <div className="hero-content">
              <div className="hero-left">
                <h1>
                  Professional Academic
                  <br />

                  <span style={shimmeringGoldStyle}>
                    Writing Services
                  </span>
                </h1>

                <p>
                  We provide high-quality academic writing
                  assistance tailored to your academic needs.
                  Expert writers, timely delivery and
                  plagiarism-free content.
                </p>

                <div
                  className="features"
                  aria-label="Service benefits"
                >
                  <span>
                    <FaCheckCircle aria-hidden="true" />
                    Expert Writers
                  </span>

                  <span>
                    <FaCheckCircle aria-hidden="true" />
                    On-Time Delivery
                  </span>

                  <span>
                    <FaCheckCircle aria-hidden="true" />
                    Plagiarism Free
                  </span>
                </div>

                <div className="buttons">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={scrollToFooter}
                  >
                    Get Assignment Help
                  </button>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() =>
                      onNavigate("services")
                    }
                  >
                    View Services
                  </button>
                </div>
              </div>

              <div className="hero-right">
                <div
                  className="hero-video-frame"
                  ref={heroFrameRef}
                  onMouseMove={handleFrameMouseMove}
                  onMouseLeave={handleFrameMouseLeave}
                  style={{
                    transform:
                      `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  }}
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate nofullscreen"
                    onContextMenu={(e) =>
                      e.preventDefault()
                    }
                  >
                    <source
                      src="/video.mp4"
                      type="video/mp4"
                    />

                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div
            className="hero-stats-bar"
            ref={statsBarRef}
            aria-label="Assignopedia results"
          >
            {heroStats.map((stat, index) => (
              <div
                className="hero-stat"
                key={stat.label}
              >
                {stat.icon}

                <div>
                  <h3>
                    {counts[index].toLocaleString()}
                    {stat.suffix}
                  </h3>

                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}

        <section
          className="home-summary home-motion-section"
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="about-summary-hero">
            <div className="section-title">
              <span>ABOUT ASSIGNOPEDIA</span>

              <h2>
                Empowering Academic & Creative Success -
                One Word at a Time
              </h2>

              <p>
                Assignopedia Services is a Kolkata-based
                academic and content writing company
                committed to delivering excellence in
                written communication.
              </p>
            </div>

            <div className="about-summary-image">
              <img
                src={contentWritingTeam}
                alt="Professional academic and content writing team collaborating"
              />
            </div>
          </div>

          <div className="summary-grid">
            {highlights.map((item) => (
              <article
                className="summary-card"
                key={item.title}
              >
                <div className="summary-icon">
                  {item.icon}
                </div>

                <h3>{item.title}</h3>

                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SERVICES PREVIEW */}

        <section
          className="home-services-preview home-motion-section"
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="section-title">
            <span>OUR SERVICES</span>

            <h2>
              Solutions for every academic requirement
            </h2>

            <p>
              Choose from tailored writing, research
              assistance, editing, and documentation
              services.
            </p>
          </div>

          <div className="service-preview-grid">
            {servicesPreview.map((service) => (
              <article
                className="service-preview-card"
                key={service.title}
              >
                <div className="service-preview-icon">
                  {service.icon}
                </div>

                <h3>{service.title}</h3>

                <p>{service.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}

        <section
          className="home-cta home-motion-section"
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="cta-copy">
            <span>WHY CHOOSE US</span>

            <h2 style={{ color: "#000000" }}>
              Join 5000+ clients who trust
              Assignopedia for academic success.
            </h2>

            <p>
              We combine subject expertise, fast
              communication, and careful review.
            </p>
          </div>

          <div className="cta-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={() =>
                onNavigate("services")
              }
            >
              Start Your Project
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                onNavigate("contact")
              }
            >
              Contact Us
            </button>
          </div>
        </section>

        {/* TESTIMONIALS */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <TestimonialCarousel />
        </div>
      </>
    </div>
  );
}


export default Home;


