import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Thumbnail = ({
  title = "Armory",
  description = "A secure section for distributing heavy weaponry and tracking the gang's daily supply runs.",
  imageUrl = "/images/thumbnail.jpg",
  linkTo = "/dashboard/inventory",
}) => {
  const NOTCH = 34;

  return (
    <div className="group relative w-80 bg-[#fdfbf6] p-4 rounded-4xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out">
      <div className="relative w-full h-52 mb-4">
        {/* Image with a circular notch masked out of its top-right corner */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded-3xl"
          style={{
            WebkitMaskImage: `radial-gradient(circle ${NOTCH}px at 100% 0%, transparent ${NOTCH - 1}px, black ${NOTCH}px)`,
            maskImage: `radial-gradient(circle ${NOTCH}px at 100% 0%, transparent ${NOTCH - 1}px, black ${NOTCH}px)`,
          }}
        />

        <span className="absolute top-4 left-4 text-white font-semibold text-xl tracking-wide drop-shadow-md">
          {title}
        </span>

        {/* Arrow button, centered on the exact same corner point as the notch */}
        <div
          className="absolute z-10 bg-white p-2 rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
          style={{ top: -NOTCH * 0.55, right: -NOTCH * 0.55 }}
        >
          <Link
            to={linkTo}
            className="flex items-center justify-center bg-[#de425b] p-3 rounded-full text-white shadow-lg hover:bg-[#c83850] transition-colors duration-300"
          >
            <ArrowRight size={24} className="transition-transform duration-300 group-hover:-rotate-45" />
          </Link>
        </div>
      </div>

      <p className="text-gray-600 text-sm font-medium leading-relaxed px-2 pb-2">{description}</p>
    </div>
  );
};

export default Thumbnail;
