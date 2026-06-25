import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaRegStar,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import testimonialBackground from "../../assets/content-writing-team.png";

const testimonials = [
  {
    name: "Emily Carter",
    country: "From Australia",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "The academic guidance helped me understand the topic and organize my ideas into a clearer assignment structure.",
  },
  {
    name: "James Wilson",
    country: "From UK",
    rating: 4.5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "The report guidance clarified the requirements and helped me improve my referencing, formatting, and overall presentation.",
  },
  {
    name: "Olivia Brown",
    country: "From Australia",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "The dissertation support helped me strengthen my chapter structure, research flow, and understanding of academic tone.",
  },
  {
    name: "Harry Thompson",
    country: "From UK",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    text: "The case study feedback helped me connect theory with evidence and improve the clarity of my own draft.",
  },
  {
    name: "Sophia Martin",
    country: "From Canada",
    rating: 4.5,
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    text: "The research proposal guidance helped me refine my objectives, choose a suitable methodology, and organize my references.",
  },
  {
    name: "Ethan Clarke",
    country: "From Australia",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    text: "The literature review support showed me how to group themes, compare sources, and develop a more focused research direction.",
  },
  {
    name: "Amelia Scott",
    country: "From UK",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/26.jpg",
    text: "The presentation feedback helped me simplify complex points and arrange my slides in a clearer, more confident sequence.",
  },
  {
    name: "Noah Harris",
    country: "From New Zealand",
    rating: 3.5,
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    text: "The proofreading feedback improved grammar and sentence flow while helping me recognize areas that still needed revision.",
  },
  {
    name: "Charlotte Evans",
    country: "From Australia",
    rating: 4.5,
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    text: "The academic editing guidance helped me improve clarity, readability, and consistency while preserving my original ideas.",
  },
  {
    name: "William Parker",
    country: "From UK",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/64.jpg",
    text: "The referencing support explained citation rules clearly and helped me make my structure and source list more consistent.",
  },
  {
    name: "Gurpreet Singh",
    country: "From New Zealand",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    text: "The guidance helped me understand the assignment brief, organize my report sections, and apply the required formatting correctly.",
  },
  {
    name: "Mia Anderson",
    country: "From Australia",
    rating: 3,
    image: "https://randomuser.me/api/portraits/women/57.jpg",
    text: "The feedback helped me organize my ideas and improve clarity. I would have preferred more detailed concept explanations.",
  },
];

const getInitials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

function TestimonialCarousel() {
  const extendedTestimonials = useMemo(
    () => [testimonials.at(-1), ...testimonials, testimonials[0]],
    []
  );
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const pendingSelectionRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [trackOffset, setTrackOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(null);

  const visibleIndex =
    (currentIndex - 1 + testimonials.length) % testimonials.length;

  const updateTrackOffset = useCallback(() => {
    const viewport = viewportRef.current;
    const activeCard = trackRef.current?.children[currentIndex];

    if (!viewport || !activeCard) {
      return;
    }

    setTrackOffset(
      viewport.clientWidth / 2 -
        (activeCard.offsetLeft + activeCard.offsetWidth / 2)
    );
  }, [currentIndex]);

  useLayoutEffect(() => {
    updateTrackOffset();
  }, [updateTrackOffset]);

  useEffect(() => {
    const handleResize = () => updateTrackOffset();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateTrackOffset]);

  useEffect(() => {
    if (isAnimating || selectedTestimonialIndex !== null) {
      return undefined;
    }

    const holdTimer = window.setTimeout(() => {
      setTransitionEnabled(true);
      setIsAnimating(true);
      setCurrentIndex((index) => index + 1);
    }, 2000);

    return () => window.clearTimeout(holdTimer);
  }, [currentIndex, isAnimating, selectedTestimonialIndex]);

  useEffect(() => {
    if (selectedTestimonialIndex === null) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      const clickedCard = event.target.closest(".testimonial-card");
      const clickedTestimonialIndex = clickedCard
        ? Number(clickedCard.dataset.testimonialIndex)
        : null;

      if (clickedTestimonialIndex !== selectedTestimonialIndex) {
        setSelectedTestimonialIndex(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [selectedTestimonialIndex]);

  const moveCarousel = (direction) => {
    if (isAnimating) {
      return;
    }

    setTransitionEnabled(true);
    setIsAnimating(true);
    setCurrentIndex((index) => index + direction);
  };

  const goToTestimonial = (index) => {
    if (isAnimating || index === visibleIndex) {
      return;
    }

    setTransitionEnabled(true);
    setIsAnimating(true);
    setCurrentIndex(index + 1);
  };

  const selectTestimonial = (testimonialIndex, renderedIndex) => {
    setSelectedTestimonialIndex(testimonialIndex);

    if (isAnimating) {
      pendingSelectionRef.current = testimonialIndex;
      return;
    }

    if (renderedIndex === currentIndex) {
      return;
    }

    setTransitionEnabled(true);
    setIsAnimating(true);
    setCurrentIndex(renderedIndex);
  };

  const finishSlide = useCallback(() => {
    if (currentIndex === 0) {
      setTransitionEnabled(false);
      setCurrentIndex(testimonials.length);
    } else if (currentIndex === testimonials.length + 1) {
      setTransitionEnabled(false);
      setCurrentIndex(1);
    }

    const pendingSelection = pendingSelectionRef.current;

    if (pendingSelection !== null) {
      pendingSelectionRef.current = null;
      window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setCurrentIndex(pendingSelection + 1);
        setIsAnimating(true);
      });
      return;
    }

    setIsAnimating(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!isAnimating) {
      return undefined;
    }

    const transitionFallback = window.setTimeout(finishSlide, 700);

    return () => window.clearTimeout(transitionFallback);
  }, [finishSlide, isAnimating]);

  return (
    <section
      className="testimonials-section"
      aria-labelledby="testimonials-title"
    >
      <div
        className="testimonials-backdrop"
        style={{ backgroundImage: `url(${testimonialBackground})` }}
        aria-hidden="true"
      />

      <div className="testimonials-shell">
        <header className="testimonials-heading">
          <h2 id="testimonials-title">Testimonials</h2>
        </header>

        <div className="testimonials-carousel">
          <button
            className="testimonial-arrow previous"
            type="button"
            onClick={() => moveCarousel(-1)}
            aria-label="Previous testimonial"
          >
            <FaChevronLeft />
          </button>

          <div className="testimonials-viewport" ref={viewportRef}>
            <div
              className="testimonials-track"
              ref={trackRef}
              style={{
                transform: `translate3d(${trackOffset}px, 0, 0)`,
                transition: transitionEnabled
                  ? "transform 600ms cubic-bezier(.22,.61,.36,1)"
                  : "none",
              }}
              onTransitionEnd={(event) => {
                if (event.target === event.currentTarget) {
                  finishSlide();
                }
              }}
            >
              {extendedTestimonials.map((testimonial, index) => {
                const testimonialIndex =
                  (index - 1 + testimonials.length) % testimonials.length;
                const isSelected =
                  selectedTestimonialIndex === testimonialIndex &&
                  index === currentIndex;

                return (
                  <article
                  className={`testimonial-card${
                    index === currentIndex ? " is-active" : ""
                  }${isSelected ? " is-selected" : ""}`}
                  data-testimonial-index={testimonialIndex}
                  key={`${testimonial.name}-${index}`}
                  aria-hidden={index !== currentIndex}
                >
                  <FaQuoteLeft className="testimonial-quote-icon" />
                  <div
                    className="testimonial-stars"
                    aria-label={`${testimonial.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, starIndex) => {
                      const starValue = starIndex + 1;

                      if (testimonial.rating >= starValue) {
                        return <FaStar key={starIndex} />;
                      }

                      if (testimonial.rating >= starValue - 0.5) {
                        return <FaStarHalfAlt key={starIndex} />;
                      }

                      return <FaRegStar key={starIndex} />;
                    })}
                  </div>
                  <blockquote>{testimonial.text}</blockquote>
                  <div className="testimonial-client">
                    <button
                      className="testimonial-avatar"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectTestimonial(testimonialIndex, index);
                      }}
                      aria-label={`Select testimonial from ${testimonial.name}`}
                      aria-pressed={isSelected}
                    >
                      <span>{getInitials(testimonial.name)}</span>
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </button>
                    <div>
                      <strong>{testimonial.name}</strong>
                      <small>{testimonial.country}</small>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          </div>

          <button
            className="testimonial-arrow next"
            type="button"
            onClick={() => moveCarousel(1)}
            aria-label="Next testimonial"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="testimonial-dots" aria-label="Choose testimonial">
          {testimonials.map((testimonial, index) => (
            <button
              className={visibleIndex === index ? "active" : ""}
              type="button"
              onClick={() => goToTestimonial(index)}
              aria-label={`Show testimonial from ${testimonial.name}`}
              aria-current={visibleIndex === index ? "true" : undefined}
              key={testimonial.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialCarousel;
