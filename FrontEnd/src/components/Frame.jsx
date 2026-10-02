import Navbar from "./Navbar";

const Frame = () => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* The White Border */}
      <div className="absolute inset-5 rounded-3xl shadow-[0_0_0_100vw_white]" />

      {/* Navbar Container */}
      <div className="absolute top-0 left-15 h-20 pointer-events-auto flex items-center justify-center z-50 ">
        <Navbar />
      </div>
    </div>
  );
};

export default Frame;
