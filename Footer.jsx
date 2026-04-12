import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MapPin, Mail, Phone, Globe, MessageCircle, Video, Briefcase } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "Plumbing", href: "/services" },
    { label: "Electrical", href: "/services" },
    { label: "Cleaning", href: "/services" },
    { label: "Home Tutor", href: "/services" },
    { label: "Painting", href: "/services" },
    { label: "Delivery", href: "/services" },
    { label: "Gardening", href: "/services" },
    { label: "AC Repair", href: "/services" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "Blog", href: "/blog" },
    { label: "Rulebook", href: "/terms" },
    { label: "Press", href: "/press" },
  ],
  Contact: [
    { label: "support@locallink.com", href: "mailto:support@locallink.com", icon: Mail },
    { label: "+91 9458xxxxxx", href: "tel:+919458128469", icon: Phone },
    { label: "Plot 12/B, Digital Park, Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010", href: "#", icon: MapPin },
  ],
};

const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const socials = [
  { Icon: XIcon,         href: "#", label: "X (Twitter)" },
  { Icon: WhatsAppIcon, href: "https://wa.me/919458128469?text=Hi%20LocalLink%20Support,%20I'm%20interested%20in%20your%20services.%20Can%20you%20help%20me?", label: "WhatsApp" },
  { Icon: MessageCircle, href: "#", label: "Discord" },
  { Icon: Briefcase,     href: "#", label: "LinkedIn" },
  { Icon: Video,         href: "#", label: "YouTube" },
  { Icon: Globe,         href: "#", label: "Website" },
];

const hoverColors = {
  Services: "hover:text-violet-400",
  Company:  "hover:text-amber-400",
  Contact:  "hover:text-cyan-400",
};

const Footer = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  // Smooth spring physics for everything
  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });
  const smoothOpacity = useSpring(glowOpacity, { stiffness: 100, damping: 20 });

  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0);

  // Sync state with motion values
  useEffect(() => {
    const unsubX = springX.on("change", (val) => setLogoPos((p) => ({ ...p, x: val })));
    const unsubY = springY.on("change", (val) => setLogoPos((p) => ({ ...p, y: val })));
    const unsubO = smoothOpacity.on("change", (val) => setIntensity(val));
    return () => { unsubX(); unsubY(); unsubO(); };
  }, [springX, springY, smoothOpacity]);

  return (
    <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">
      <div className="flex items-center justify-center pt-12 pb-8 relative">
        <motion.span
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
          }}
          onMouseEnter={() => glowOpacity.set(1)}
          onMouseLeave={() => glowOpacity.set(0)}
          className="font-display font-extrabold uppercase leading-none text-[clamp(5rem,18vw,22rem)] tracking-tighter select-none cursor-default px-10 py-4"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.15)",
            backgroundImage: `radial-gradient(180px circle at ${logoPos.x}px ${logoPos.y}px, rgba(232, 78, 27, ${intensity}), transparent)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: intensity > 0.01 ? "transparent" : "rgba(255,255,255,0.03)",
            color: "transparent",
            display: "inline-block"
          }}
        >
          LocalLink
        </motion.span>
      </div>


    <div className="container mx-auto px-6 pt-12 pb-20 relative z-10">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1.4fr] gap-12 mb-16">

        <div>
          <Link to="/" className="flex items-center gap-3 group mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight">LocalLink</span>
          </Link>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
            Connecting you with trusted local service providers in your neighbourhood. Quality services, just around the corner.
          </p>

          <div className="flex gap-3 mt-8">
            {socials.map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target={label === "WhatsApp" ? "_blank" : undefined}
                rel={label === "WhatsApp" ? "noopener noreferrer" : undefined}
                aria-label={label}
                whileHover={{ y: -4, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-violet-400 hover:border-violet-400/50 hover:bg-violet-400/10 transition-colors duration-300"
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>

        {Object.keys(footerLinks).map((col) => (
          <div key={col}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">{col}</h4>
            <ul className="space-y-3">
              {footerLinks[col].map((item) => (
                <li key={item.label}>
                  {item.icon ? (
                    <a
                      href={item.href}
                      className={`flex items-center gap-2 text-sm text-white/50 transition-colors duration-200 ${hoverColors[col]}`}
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className={`text-sm text-white/50 transition-colors duration-200 ${hoverColors[col]}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25 text-center">
        <span>© {new Date().getFullYear()} LocalLink. All rights reserved.</span>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Privacy Policy", path: "/terms" },
            { label: "Terms & Conditions", path: "/terms" },
            { label: "Rulebook", path: "/terms" }
          ].map((t) => (
            <Link key={t.label} to={t.path} className="hover:text-primary transition-colors duration-200">{t.label}</Link>
          ))}
        </div>
      </div>

    </div>
  </footer>
  );
};

export default Footer;
