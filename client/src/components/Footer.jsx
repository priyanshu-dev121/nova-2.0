import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  MessageCircle, 
  Video, 
  Briefcase, 
  Sparkles 
} from "lucide-react";
import './Footer.css';

const footerLinks = {
  Services: [
    { label: "Attendance Tracker", href: "/attendance" },
    { label: "Digital Notes", href: "/notes" },
    { label: "Mess Menu", href: "/mess" },
    { label: "Complaint Portal", href: "/complaints" },
    { label: "Lost & Found", href: "/lost-found" },
  ],
  Ecosystem: [
    { label: "About Campus Nova", href: "/about" },
    { label: "Our Story", href: "/story" },
    { label: "Team Developers", href: "/developers" },
    { label: "Privacy Policy", href: "/terms" },
    { label: "Rulebook", href: "/terms" },
  ],
  Support: [
    { label: "support@campusnova.com", href: "mailto:support@campusnova.com", icon: Mail },
    { label: "+91 8840xxxxxx", href: "tel:+918840000000", icon: Phone },
    { label: "BBD University, Lucknow, UP - 226028", href: "#", icon: MapPin },
  ],
};

const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  { Icon: XIcon, href: "#", label: "X (Twitter)" },
  { Icon: MessageCircle, href: "#", label: "Discord" },
  { Icon: Briefcase, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });
  const smoothOpacity = useSpring(glowOpacity, { stiffness: 100, damping: 20 });

  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    const unsubX = springX.on("change", (val) => setLogoPos((p) => ({ ...p, x: val })));
    const unsubY = springY.on("change", (val) => setLogoPos((p) => ({ ...p, y: val })));
    const unsubO = smoothOpacity.on("change", (val) => setIntensity(val));
    return () => { unsubX(); unsubY(); unsubO(); };
  }, [springX, springY, smoothOpacity]);

  return (
    <footer className="footer-container">
      <div className="footer-hero-section">
        <motion.span
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
          }}
          onMouseEnter={() => glowOpacity.set(1)}
          onMouseLeave={() => glowOpacity.set(0)}
          className="footer-giant-text"
          style={{
            backgroundImage: `radial-gradient(200px circle at ${logoPos.x}px ${logoPos.y}px, rgba(99, 102, 241, ${intensity}), transparent)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: intensity > 0.01 ? "transparent" : "rgba(255,255,255,0.03)",
            color: "transparent",
          }}
        >
          CampusNova
        </motion.span>
      </div>

      <div className="footer-grid-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="logo">
              <div className="footer-logo-box">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight">Campus Nova</span>
            </Link>
            <p className="footer-description">
              Elevating the student experience with a complete smart campus ecosystem. Efficiency, connection, and growth in one platform.
            </p>

            <div className="footer-socials">
              {socials.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -4, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="social-link"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.keys(footerLinks).map((col) => (
            <div key={col}>
              <h4 className="footer-col-title">{col}</h4>
              <ul className="footer-links-list">
                {footerLinks[col].map((item) => (
                  <li key={item.label}>
                    {item.icon ? (
                      <a href={item.href} className="footer-link">
                        <item.icon className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.href} className="footer-link">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Campus Nova. All rights reserved.</span>
          <div className="footer-legal-links">
            <Link to="/terms">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/terms">Rulebook</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
