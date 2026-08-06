import { getMediaItems, type MediaItem } from '@/lib/public/data'

export async function MediaPreview() {
  const items: MediaItem[] = await getMediaItems()

  return (
    <section className="bg-gold py-16 text-navy">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-3xl font-bold md:text-4xl">
          Latest <span className="text-white">Media</span>
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl bg-white shadow"
            >
              <div className="aspect-video">
                {item.type === 'video' ? (
                  <video
                    controls
                    poster={item.poster}
                    className="h-full w-full object-cover"
                  >
                    <source src={item.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={item.src}
                    title={item.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
