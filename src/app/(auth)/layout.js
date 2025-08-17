export default function AuthLayout({ children }) {
  return (
    <div
      className="flex justify-center items-center w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/campus-bg.jpg')" }}
    >
      {children}
    </div>
  );
}
