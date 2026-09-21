const FRAME_STARS = [
  { side: 'left', top: '7%', delay: '0s', duration: '5.8s', size: '1.6px' },
  { side: 'left', top: '24%', delay: '2.2s', duration: '7.1s', size: '1.2px' },
  { side: 'left', top: '48%', delay: '4.4s', duration: '6.4s', size: '1.8px' },
  { side: 'left', top: '72%', delay: '1.3s', duration: '8.2s', size: '1.3px' },
  { side: 'right', top: '13%', delay: '3.1s', duration: '6.6s', size: '1.5px' },
  { side: 'right', top: '34%', delay: '.7s', duration: '7.7s', size: '1.2px' },
  { side: 'right', top: '58%', delay: '5.2s', duration: '6.1s', size: '1.7px' },
  { side: 'right', top: '82%', delay: '2.8s', duration: '8.6s', size: '1.2px' },
];

const FAQ_STARS = [
  { left: '8%', top: '12%', delay: '.3s', duration: '7.4s' },
  { left: '26%', top: '24%', delay: '3.2s', duration: '8.6s' },
  { left: '54%', top: '10%', delay: '1.6s', duration: '6.9s' },
  { left: '72%', top: '36%', delay: '4.6s', duration: '7.8s' },
  { left: '88%', top: '18%', delay: '2.5s', duration: '9.1s' },
];

export default function CosmicStars({ zone = 'frame' }) {
  if (zone === 'faq') {
    return (
      <div className="faq-shooting-stars" aria-hidden="true">
        {FAQ_STARS.map((star, index) => (
          <i
            key={index}
            className="shooting-star shooting-star--faq"
            style={{
              '--star-left': star.left,
              '--star-top': star.top,
              '--star-delay': star.delay,
              '--star-duration': star.duration,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="frame-stars" aria-hidden="true">
      <div className="frame-stars__side frame-stars__side--left">
        {FRAME_STARS.filter((star) => star.side === 'left').map((star, index) => (
          <i
            key={index}
            className="shooting-star shooting-star--frame"
            style={{
              '--star-top': star.top,
              '--star-delay': star.delay,
              '--star-duration': star.duration,
              '--star-size': star.size,
            }}
          />
        ))}
      </div>
      <div className="frame-stars__side frame-stars__side--right">
        {FRAME_STARS.filter((star) => star.side === 'right').map((star, index) => (
          <i
            key={index}
            className="shooting-star shooting-star--frame"
            style={{
              '--star-top': star.top,
              '--star-delay': star.delay,
              '--star-duration': star.duration,
              '--star-size': star.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
