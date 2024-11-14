"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const letters = [
  {
    letter: "P",
    color: "blue",
    rotate: 10,
    size: "text-[12rem]",
    left: -40,
    top: 0,
  },
  {
    letter: "a",
    color: "pink",
    rotate: 10,
    size: "text-[10rem]",
    left: -10,
    top: 40,
  },
  {
    letter: "r",
    color: "green",
    rotate: -15,
    size: "text-[11rem]",
    left: -45,
    top: 80,
  },
  {
    letter: "a",
    color: "yellow",
    rotate: 0,
    size: "text-[10rem]",
    left: -15,
    top: 100,
  },
  {
    letter: "P",
    color: "pink",
    rotate: -10,
    size: "text-[12rem]",
    left: -45,
    top: 160,
  },
  {
    letter: "o",
    color: "green",
    rotate: 10,
    size: "text-[10rem]",
    left: -15,
    top: 200,
  },
];

export default function LandingAnimation() {
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    letterRefs.current.forEach((el, index) => {
      gsap.fromTo(
        el,
        {
          y: 0,
          x: letters[index].left,
          opacity: 0,
          rotation: letters[index].rotate,
        },
        {
          y: letters[index].top,
          x: letters[index].left,
          opacity: 1,
          duration: 1,
          delay: index * 0.2,
          ease: "bounce.out",
        }
      );
    });
  }, []);

  return (
    <div className="relative h-screen bg-white">
      <div className="relative w-fit">
        {letters.map((letterObj, index) => (
          <div
            key={index}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            className={`absolute ${
              letterObj.color === "blue"
                ? "text-blue-500"
                : letterObj.color === "pink"
                ? "text-pink-500"
                : letterObj.color === "green"
                ? "text-green-500"
                : "text-yellow-500"
            } ${letterObj.size} font-bold`}
            style={{
              transform: `rotate(${letterObj.rotate}deg)`,
              left: `${letterObj.left}px`,
              top: `${letterObj.top}px`,
            }}
          >
            {letterObj.letter}
          </div>
        ))}
      </div>
    </div>
  );
}
