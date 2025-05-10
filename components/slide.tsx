"use client";

import {
  StackedCarousel,
  ResponsiveContainer,
  StackedCarouselSlideProps,
} from "react-stacked-center-carousel";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./slide.css";

// Updated data array with only an image field
const data = [
  { image: "memory1.jpg" },
  { image: "memory2.png" },
  { image: "memory3.png" },
  { image: "memory4.png" },
];

export function ResponsiveCarousel() {
  const ref = React.useRef<StackedCarousel | null>(null);

  // Autoplay functionality
  React.useEffect(() => {
    const interval = setInterval(() => {
      ref.current?.goNext();
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <ResponsiveContainer
        carouselRef={ref as React.MutableRefObject<StackedCarousel | undefined>}
        render={(width, carouselRef) => {
          return (
            <StackedCarousel
              ref={carouselRef}
              slideComponent={Slide}
              slideWidth={750}
              carouselWidth={width}
              data={data}
              maxVisibleSlide={5}
              disableSwipe
              customScales={[1, 0.85, 0.7, 0.55]}
              transitionTime={450}
            />
          );
        }}
      />
      <button
        className="slide-button left"
        onClick={() => ref.current?.goBack()}
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={30} />
      </button>
      <button
        className="slide-button right"
        onClick={() => ref.current?.goNext()}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <ChevronRight size={30} />
      </button>
    </div>
  );
}

const Slide = React.memo(function (props: StackedCarouselSlideProps) {
  const { data, dataIndex, isCenterSlide, swipeTo, slideIndex } = props;

  const { image } = data[dataIndex];

  return (
    <div className="slide-card" draggable={false}>
      <div className="cover fill">
        <div
          className="card-overlay fill"
          onClick={() => {
            if (!isCenterSlide) swipeTo(slideIndex);
          }}
        />
        <img
          className="cover-image fill"
          src={image}
          alt={`Memory ${dataIndex + 1}`}
        />
      </div>
    </div>
  );
});
