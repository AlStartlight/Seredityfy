import React,{useState,useEffect} from 'react'
import { Link } from 'react-router-dom';
import { X,Menu } from 'lucide-react'

const HeaderComponents = () => {
const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
const [isScrolling, setIsScrolling] = useState(false);

useEffect(() => {
    const handleScroll = () => {
        setIsScrolling(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}, []);
  return (
    <header className={`fixed top-0 z-30 w-full py-5 mx-10 transition-all duration-300 ${isScrolling ? "bg-blend-hue bg-gradient-to-br from-blue-950 to-gray-950   shadow-lg" : "bg-gray-950 backdrop-blur-sm"}`}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/5">
                <div className="flex items-center justify-between h-16 ">
                    <Link to='/soller' className="flex items-center py-4 text-2xl font-extrabold text-white">
                       weeb
                    </Link>
                    {/* desktop menu button */}
                    <div className="hidden md:flex space-x-4 ml-10 gap-4">
                        <Link to="/otech/products" className="text-gray-300 hover:text-gray-500">About Us</Link>
                        <Link to="/otech/solutions" className="text-gray-300 hover:text-gray-500">Solutions</Link>
                        <Link to="/otech/pricing" className="text-gray-300 hover:text-gray-500">Pricing</Link>
                        <Link to="/otech/resource" className="text-gray-300 hover:text-gray-500">Resources</Link>
                    </div>
                    {/* CTA button */}
                    <div className="hidden md:flex ml-auto gap-6 relative z-50">
                        <Link to="/contact" className="px-4 py-2 rounded hover:bg-blue-600 flex flex-inline items-center text-gray-200 pointer-events-auto">
                                Log In
                        </Link>
                        <Link to="/contact" className="group text-sm relative inline-flex items-center  text-white bg-purple-600 px-4 py-2 rounded-sm  shadow pointer-events-none group-hover:pointer-events-auto">
                             Join Now
                        </Link>

                    </div>
                    {/* mobile menu button */}
                    <button className="md:hidden max-sm:sticky flex items-center px-3 py-2  rounded-full  text-gray-500 border-gray-600 hover:text-gray-900 hover:border-gray-900" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={20} color='white' /> : <Menu size={20} color='white' />}
                    </button>
                </div>
                {/* mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg">
                        <div className="flex flex-col mx-auto items-center p-4">
                            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
                            <Link to="/about" className="text-gray-700 hover:text-gray-900">Solutions</Link>
                            <Link to="/contact" className="text-gray-700 hover:text-gray-900">Services</Link>
                            <Link to="/contact" className="text-gray-700 hover:text-gray-900">Configure</Link>
                            {/* CTA button */}
                            <div className="flex flex-col gap-2 items-center mt-2">
                            <Link to="/contact" className="px-4 py-2 rounded hover:bg-blue-600 flex flex-inline items-center text-gray-700 pointer-events-auto">
                                Log In
                            </Link>
                            <Link to="/contact" className="group text-md relative inline-flex items-center border-2  text-black px-4 py-1 rounded-xl  shadow pointer-events-none group-hover:pointer-events-auto">
                               Sign Up Now
                            </Link>

                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
  )
}

export default HeaderComponents
