import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  showSubtitle?: boolean
  className?: string
  asLink?: boolean
  href?: string
  textDark?: boolean
}

const sizeMap = {
  xs: { img: 24, text: 'text-sm', sub: 'text-[9px]' },
  sm: { img: 32, text: 'text-base', sub: 'text-[10px]' },
  md: { img: 42, text: 'text-lg', sub: 'text-xs' },
  lg: { img: 56, text: 'text-xl', sub: 'text-xs' },
  xl: { img: 72, text: 'text-2xl', sub: 'text-sm' },
}

export function Logo({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
  asLink = false,
  href = '/',
  textDark = false,
}: LogoProps) {
  const cfg = sizeMap[size]

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/20 bg-[#2d1b17] transition-transform duration-300 hover:scale-105">
        <Image
          src="/logo.jpg"
          alt="Logo Unit Kegiatan Mahasiswa Musik - Universitas Harkat Negeri"
          width={cfg.img}
          height={cfg.img}
          priority
          className="rounded-full object-cover"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span
            className={`font-black tracking-tight ${cfg.text} ${
              textDark
                ? 'text-gray-900'
                : 'bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-clip-text text-transparent'
            }`}
          >
            Harkat Studio
          </span>
          {showSubtitle && (
            <span
              className={`font-medium tracking-wide uppercase ${cfg.sub} ${
                textDark ? 'text-gray-500' : 'text-amber-200/70'
              }`}
            >
              UKM Musik Univ. Harkat Negeri
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}

export default Logo
