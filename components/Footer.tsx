'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M16.9706 7.92294C17.1196 7.92304 17.2626 7.98229 17.368 8.0877C17.4734 8.1931 17.5326 8.33603 17.5327 8.48509L17.5327 14.8491C17.5354 14.9245 17.5228 14.9998 17.4958 15.0703C17.4687 15.1409 17.4277 15.2052 17.3753 15.2596C17.3228 15.3139 17.2599 15.3571 17.1904 15.3867C17.1209 15.4162 17.0461 15.4314 16.9706 15.4314C16.895 15.4314 16.8203 15.4162 16.7507 15.3867C16.6812 15.3571 16.6183 15.3139 16.5659 15.2596C16.5134 15.2052 16.4724 15.1409 16.4454 15.0703C16.4183 14.9998 16.4058 14.9245 16.4084 14.8491L16.4084 9.84274L8.88304 17.3681C8.77755 17.4736 8.63447 17.5329 8.48529 17.5329C8.33611 17.5329 8.19303 17.4736 8.08754 17.3681C7.98205 17.2626 7.92279 17.1196 7.92279 16.9704C7.92279 16.8212 7.98205 16.6781 8.08754 16.5726L15.6129 9.04724L10.6066 9.04724C10.5311 9.04991 10.4559 9.03734 10.3853 9.01029C10.3148 8.98324 10.2504 8.94226 10.1961 8.8898C10.1418 8.83733 10.0985 8.77446 10.069 8.70493C10.0395 8.6354 10.0243 8.56063 10.0243 8.48509C10.0243 8.40955 10.0395 8.33479 10.069 8.26526C10.0985 8.19573 10.1418 8.13286 10.1961 8.08039C10.2504 8.02793 10.3148 7.98695 10.3853 7.9599C10.4559 7.93285 10.5311 7.92028 10.6066 7.92294L16.9706 7.92294Z" fill="#054742"/>
  </svg>
)

const font = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function Footer() {
  const [email, setEmail] = useState('')
  const pathname = usePathname() ?? ''
  const footerBg =
    pathname === '/community-support' || pathname === '/profile' || pathname === '/waitlist'
      ? 'bg-[#FDF8F3]'
      : 'bg-[#F9F9F9]'

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Subscribe:', email)
    setEmail('')
  }

  return (
    <footer className={`${footerBg} relative z-[1]`}>
      {/* Footer Top */}
      <div className="border-t border-b border-[#D1CEC9]">
        <div className="max-w-[1415px] mx-auto px-4">
          <div className="flex flex-wrap">
            {/* Connect */}
            <div className="w-full md:w-1/2 py-[30px] md:py-[60px] md:border-r border-b md:border-b-0 border-[#D1CEC9]">
              <h4
                className="text-lg font-bold leading-[120%] text-black uppercase mb-5 md:mb-[47px]"
                style={font}
              >
                Connect
              </h4>
              <ul className="list-none p-0 m-0">
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 text-[#666462] text-[22px] md:text-[22px] font-normal capitalize mb-[15px] hover:opacity-70 transition-opacity"
                    style={font}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 16V8C3 6.67392 3.52678 5.40215 4.46447 4.46447C5.40215 3.52678 6.67392 3 8 3H16C17.3261 3 18.5979 3.52678 19.5355 4.46447C20.4732 5.40215 21 6.67392 21 8V16C21 17.3261 20.4732 18.5979 19.5355 19.5355C18.5979 20.4732 17.3261 21 16 21H8C6.67392 21 5.40215 20.4732 4.46447 19.5355C3.52678 18.5979 3 17.3261 3 16Z" stroke="#747474" strokeWidth="1.5"/>
                      <path d="M17.5 6.50905L17.51 6.49805" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Instagram
                    <ArrowIcon />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 text-[#666462] text-[22px] md:text-[22px] font-normal capitalize mb-[15px] hover:opacity-70 transition-opacity"
                    style={font}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <g clipPath="url(#clip0_footer_linkedin)">
                        <path d="M6.12698 3.02942C6.13163 3.6222 5.90278 4.19298 5.48991 4.61836C5.07705 5.04374 4.51334 5.28952 3.92069 5.30256C3.32928 5.28108 2.76874 5.03318 2.35492 4.61012C1.94111 4.18705 1.70567 3.62116 1.69727 3.02942C1.72282 2.45274 1.96682 1.90739 2.37974 1.50402C2.79266 1.10065 3.34358 0.86948 3.92069 0.857422C4.49611 0.869711 5.04507 1.10146 5.45522 1.50523C5.86536 1.90901 6.10568 2.45427 6.12698 3.02942ZM1.93555 9.34142C1.93555 8.03514 2.76698 8.23914 3.92069 8.23914C5.07441 8.23914 5.88869 8.03514 5.88869 9.34142V22.0683C5.88869 23.3917 5.05727 23.1209 3.92069 23.1209C2.78412 23.1209 1.93555 23.3917 1.93555 22.0683V9.34142ZM9.31727 9.34314C9.31727 8.61285 9.58812 8.34028 10.0116 8.25628C10.435 8.17228 11.8973 8.25628 12.4047 8.25628C12.9138 8.25628 13.1178 9.08771 13.1007 9.71514C13.5367 9.13142 14.1148 8.66901 14.7801 8.37194C15.4454 8.07487 16.1756 7.95302 16.9013 8.01799C17.614 7.97448 18.3279 8.08136 18.9966 8.3317C19.6653 8.58203 20.2739 8.97023 20.7828 9.47107C21.2917 9.97191 21.6896 10.5742 21.9506 11.2388C22.2116 11.9034 22.3299 12.6155 22.2978 13.3289V22.0169C22.2978 23.3403 21.4836 23.0694 20.3281 23.0694C19.1727 23.0694 18.3601 23.3403 18.3601 22.0169V15.23C18.39 14.8807 18.3444 14.5292 18.2263 14.1991C18.1083 13.8691 17.9206 13.5683 17.676 13.3172C17.4315 13.0661 17.1357 12.8706 16.8089 12.7439C16.482 12.6173 16.1317 12.5624 15.7818 12.5831C15.4333 12.574 15.0868 12.639 14.7652 12.7739C14.4437 12.9088 14.1545 13.1105 13.9169 13.3657C13.6793 13.6208 13.4986 13.9236 13.3868 14.2538C13.2751 14.5841 13.2348 14.9344 13.2687 15.2814V22.0683C13.2687 23.3917 12.4373 23.1209 11.2836 23.1209C10.1298 23.1209 9.31555 23.3917 9.31555 22.0683L9.31727 9.34314Z" stroke="#747474" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_footer_linkedin">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    LinkedIn
                    <ArrowIcon />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 text-[#666462] text-[22px] md:text-[22px] font-normal capitalize mb-[15px] hover:opacity-70 transition-opacity"
                    style={font}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 12L10.5 14V10L14 12Z" fill="#747474" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12.7084V11.2924C2 8.39739 2 6.94939 2.905 6.01839C3.811 5.08639 5.237 5.04639 8.088 4.96539C9.438 4.92739 10.818 4.90039 12 4.90039C13.182 4.90039 14.561 4.92739 15.912 4.96539C18.763 5.04639 20.189 5.08639 21.094 6.01839C21.999 6.95039 22 8.39839 22 11.2924V12.7074C22 15.6034 22 17.0504 21.095 17.9824C20.189 18.9134 18.764 18.9544 15.912 19.0344C14.562 19.0734 13.182 19.1004 12 19.1004C10.818 19.1004 9.439 19.0734 8.088 19.0344C5.237 18.9544 3.811 18.9144 2.905 17.9824C1.999 17.0504 2 15.6024 2 12.7084Z" stroke="#747474" strokeWidth="1.5"/>
                    </svg>
                    Youtube
                    <ArrowIcon />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="w-full md:w-1/2 py-[30px] md:py-[60px] md:pl-[30px] lg:pl-[60px]">
              <h4
                className="text-lg font-bold leading-[120%] text-black uppercase mb-5 md:mb-[47px]"
                style={font}
              >
                Subscribe to our Newsletter
              </h4>
              <div>
                <form onSubmit={handleSubscribe} className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xl font-normal leading-[110%] text-[#AFA79D] tracking-[-0.6px] py-3 px-3 rounded-xl border border-[#9A9894] bg-transparent outline-none flex-1 min-w-0 h-[38px] md:h-auto"
                    style={font}
                  />
                  <div className="relative z-10">
                    <button type="submit" className="flex items-center">
                      <span
                        className="text-black text-base md:text-lg font-normal leading-[120%] px-4 py-2.5 rounded-xl bg-[#C780ED]"
                        style={font}
                      >
                        Join
                      </span>
                      <span className="leading-[0] px-2.5 py-2.5 rounded-xl bg-[#C780ED]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                          <path d="M10.5 4.375L16.625 10.5M16.625 10.5L10.5 16.625M16.625 10.5H4.375" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Logo */}
      <div className="max-w-[1415px] mx-auto px-4">
        <div className="py-[40px] md:py-[70px] text-center">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/img/footerlogo.png"
              alt="Navaro Logo"
              className="mx-auto w-[80%] md:w-[730px] max-w-full"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="flex justify-between items-center pb-10">
          <span
            className="text-[12.749px] font-normal text-[#333231]"
            style={font}
          >
            &copy;{new Date().getFullYear()} Navaro
          </span>
          <Link
            href="/privacy"
            className="text-[12.749px] font-normal text-[#333231] hover:opacity-70 transition-opacity"
            style={font}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
