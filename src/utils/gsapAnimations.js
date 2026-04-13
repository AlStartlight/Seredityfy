import { gsap } from "gsap";

let ScrollTrigger;

// Only register ScrollTrigger on the client side
if (typeof window !== 'undefined') {
  const { ScrollTrigger: ST } = require("gsap/ScrollTrigger");
  ScrollTrigger = ST;
  gsap.registerPlugin(ScrollTrigger);
}

export const fadeInUp = (target, delay = 0) => {
  if (typeof window === 'undefined' || !target) return;
  gsap.fromTo(
    target,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      delay,
      ease: "power3.out",
      scrollTrigger: ScrollTrigger ? {
        trigger: target,
        start: "top 80%",
        toggleActions: "play none none none"
      } : undefined
    }
  );
};

export const staggerFadeIn = (targets, delay = 0.15) => {
  if (typeof window === 'undefined' || !targets || !targets.length) return;
  gsap.fromTo(
    targets,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: delay,
      ease: "power3.out",
      scrollTrigger: ScrollTrigger ? {
        trigger: targets[0] || targets,
        start: "top 80%",
        toggleActions: "play none none none"
      } : undefined
    }
  );
};
