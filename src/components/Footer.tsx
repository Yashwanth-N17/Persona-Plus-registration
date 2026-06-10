import logo from "@/assets/persona-logo.jpeg";
import { ExternalLink, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { EVENT, EVENT_CONTACT } from "@/lib/event";

const Footer = () => (
  <footer className="relative px-6 py-8 bg-white border-t border-teal-pale/30 mt-12">
    <div className="max-w-7xl mx-auto flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <Link to="/" className="flex items-center gap-3 w-max">
        <img
          src={logo}
          alt="Persona+ logo"
          className="w-11 h-11 rounded-full object-cover shadow-[0_0_16px_rgba(74,139,175,0.35)] border border-teal-pale"
        />
        <div>
          <div className="text-xl font-bold text-gradient">Persona+</div>
          <div className="text-sm font-semibold text-teal/70">{EVENT.name}</div>
        </div>
      </Link>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center text-sm font-semibold text-teal/75">
        <a href={EVENT_CONTACT.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-teal transition-colors">
          <Instagram size={16} />
          Instagram
        </a>
        <a href={EVENT_CONTACT.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-teal transition-colors">
          <Linkedin size={16} />
          LinkedIn
        </a>
        <a href={`mailto:${EVENT_CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-teal transition-colors">
          <Mail size={16} />
          Email
        </a>
        <a href="https://jssstuniv.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-teal transition-colors">
          <ExternalLink size={16} />
          JSS STU
        </a>
      </div>

      <p className="text-sm text-teal/65 font-medium">
        Copyright &copy; {new Date().getFullYear()} Persona Plus
      </p>
    </div>
  </footer>
);

export default Footer;
