import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export const fadeInUp = (target, delay = 0) => {
  gsap.fromTo(
    target,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: target,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    }
  );
};

export const staggerFadeIn = (targets, delay = 0.15) => {
  gsap.fromTo(
    targets,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: targets[0] || targets,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    }
  );
}; 