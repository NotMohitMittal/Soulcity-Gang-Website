import GangMembers from "./GangMembers";

const HomeMember = () => {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <img src="/images/background.jpg" alt="Background" className="w-full h-full object-cover" />
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
