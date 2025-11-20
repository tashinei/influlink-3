import React, { useEffect, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

const GlassSection: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 480, height: 270 });
  const [mounted, setMounted] = useState(false);
  const [offsetX, setOffsetX] = useState(0.5); // initial offset

  useEffect(() => {
    setMounted(true);
    const container = document.getElementById("glass-wrapper");
    if (container) {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    }

    const handleResize = () => {
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    // Animate offsetX back and forth
    let direction = 1;
    let animationFrame: number;

    const animate = () => {
      setOffsetX(prev => {
        let next = prev + 0.002 * direction;
        if (next > 1) {
          next = 1;
          direction = -1;
        } else if (next < 0) {
          next = 0;
          direction = 1;
        }
        return next;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const colors = ["#1E88E5", "#6EC5E9", "#90d5f3ff"]; // blue palette

  return (
    <div
      id="glass-wrapper"
      className="glass-wrapper relative w-full h-[43vh] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(to top, rgba(66, 66, 66, 0.5), rgba(12, 138, 249, 0.4))",
      }}
    >
      {/* Animated Mesh Gradient */}
      {mounted && (
        <MeshGradient
          width={dimensions.width}
          height={dimensions.height}
          colors={colors}
          distortion={1.5}
          swirl={1.2}
          grainMixer={0}
          grainOverlay={0}
          speed={1.5}
          offsetX={offsetX} // dynamic offset
          className="absolute inset-0 -z-10"
        />
      )}

      {/* Glass overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(0, 0, 0, 0)",
        }}
      />

      {/* Glass Section Content */}
      <section
        className="glass-section relative z-10 w-full flex flex-col items-center justify-center"
        style={{
          padding: "3rem 2rem",
          overflow: "hidden",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.25), inset 0 0 25px rgba(255,255,255,0.15)",
          height: "43vh",
          background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(180,230,255,0.15) 20%, rgba(104,167,230,0.1) 50%, rgba(52,158,203,0.1) 80%, rgba(255,255,255,0.2) 100%)",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Готови да се присъедините?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.35rem",
              marginBottom: "2rem",
            }}
          >
            Запишете се сега и бъдете част от революцията в инфлуенсър маркетинга.
          </p>
          <button
            className="glass-button hover:scale-105"
            style={{
              background:
                "linear-gradient(150deg, rgba(255, 255, 255, 0.15), rgba(45, 143, 230, 0.52))",
              backdropFilter: "blur(10px)",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "1rem 2rem",
              borderRadius: "50px",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              border: "4px solid rgba(255,255,255,0.25)",
            }}
            onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(150deg, rgba(120, 120, 120, 0.2), rgba(45, 143, 230, 0.52)")
            }
            onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(150deg, rgba(255, 255, 255, 0.15), rgba(45, 143, 230, 0.52)")
            }
          >
            Проверете статуса си
          </button>
        </div>
      </section>
    </div>
  );
};

export default GlassSection;
