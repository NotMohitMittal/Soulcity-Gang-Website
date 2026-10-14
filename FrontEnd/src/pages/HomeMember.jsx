import GangMembers from "./GangMembers";

const HomeMember = () => {
  return (
    <>
      <div className="absolute inset-0 z-0">
        {/* 1. The Background Video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="/videos/bg.mp4" type="video/mp4" />
          {/* Fallback text if the video fails to load */}
          Your browser does not support the video tag.
        </video>

        {/* 2. Optional: Dark Overlay (helps make text readable on top of moving video) */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 backdrop-blur-xl [-webkit-mask-image:radial-gradient(circle_at_bottom_right,black,transparent_70%)] mask-[radial-gradient(circle_at_bottom_right,black,transparent_70%)]" />
      </div>
      <div className="p-10 mt-10 w-screen h-screen overflow-y-auto text-white relative">
        <GangMembers />
      </div>
    </>

    // <div className='w-screen h-screen overflow-y-auto bg-black text-white relative'>

    //   </div>
  );
};

export default HomeMember;
