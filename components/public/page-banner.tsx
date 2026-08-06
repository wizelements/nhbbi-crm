import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageBannerProps {
  title: ReactNode
  subtitle?: ReactNode
  image?: string
  className?: string
}

export function PageBanner({ title, subtitle, image, className }: PageBannerProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-[220px] items-center bg-navy text-white md:min-h-[280px]',
        className
      )}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(rgba(21,34,74,0.75), rgba(21,34,74,0.75)), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold italic md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-lg text-white/90">{subtitle}</p>
        )}
      </div>
    </section>
  )
}
