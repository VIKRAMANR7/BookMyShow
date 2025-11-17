import { assets } from "../assets/assets";

export default function Footer() {
  return (
    <footer className="px-6 mt-40 md:px-16 lg:px-36 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        {/* Brand Section */}
        <div className="md:max-w-96">
          <img className="w-36 h-auto" src={assets.logo} alt="BookMyShow Logo" />

          <p className="mt-6 text-sm">
            Experience seamless movie ticket booking with real-time seat selection, secure payments,
            and instant confirmations. Discover the latest movies and book your favourite seats
            effortlessly.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <img src={assets.googlePlay} alt="Google Play" className="h-9" />
            <img src={assets.appStore} alt="App Store" className="h-9" />
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About us</a>
              </li>
              <li>
                <a href="#">Contact us</a>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+1-234-567-890</p>
              <p>contact@example.com</p>
            </div>
          </div>
        </div>
      </div>

      <p className="pt-4 text-center text-sm pb-5">
        © {new Date().getFullYear()} BookMyShow — All Rights Reserved.
      </p>
    </footer>
  );
}
