"use client"

interface RotatingCardProps {
  frontImageSrc?: string
  backImageSrc?: string
  className?: string // Add className prop for external styling
}

export default function RotatingCard({
  className,
}: RotatingCardProps) {
  return (
    <div className={`scene ${className}`}>
      <div className="home-card">
        {/* Front Face */}
        <div className="card-face card-front">
          <img
            src="/front-card.jpg"
            alt="Card Front"
            className="w-full h-full object-cover rounded-[18px]"
          />
        </div>

        {/* Back Face */}
        <div className="card-face card-back">
          <img
            src="back-card.jpg"
            alt="Card Back"
            className="w-full h-full object-cover rounded-[18px]"
          />
        </div>
      </div>
      <style jsx>{`
        .scene {
          perspective: 1800px; /* Increased perspective for more depth */
          perspective-origin: center center;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .home-card {
           width: 350px;
            height: 400px;
            position: relative;
            transform-style: preserve-3d;
            animation: elegantRotate 15s linear infinite;
            border-radius: 8px;
            margin: 0 auto;
            will-change: transform;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1729 100%);
            box-shadow:
                0 20px 40px rgba(195, 219, 63, 0.18),
                0 0 25px rgba(195, 219, 63, 0.12),
                0 0 0 1px rgba(195, 219, 63, 0.15),
                inset 0 1px 0 rgba(195, 219, 63, 0.1);
        }

        .card-face {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        
        .card-front {
          transform: rotateY(0deg) translateZ(5px);
        }
        
        .card-back {
          transform: rotateY(180deg) translateZ(5px);
        }
        
        @keyframes elegantRotate {
          0% {
            transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg) scale(1);
          }
          25% {
            transform: rotateY(90deg) rotateX(10deg) rotateZ(-10deg) scale(1.01);
          }
          50% {
            transform: rotateY(180deg) rotateX(-10deg) rotateZ(10deg) scale(1);
          }
          75% {
            transform: rotateY(270deg) rotateX(10deg) rotateZ(-10deg) scale(1.01);
          }
          100% {
            transform: rotateY(360deg) rotateX(0deg) rotateZ(0deg) scale(1);
          }
        }
        
        @media (max-width: 640px) {
          .credit-card {
            width: 320px;
            height: 210px;
          }
        }
      `}</style>
    </div>
  )
}