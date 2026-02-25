import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function ImageCarousel() {
  return (
    // Added 'mx-auto' to center and 'relative' to ensure buttons position correctly
    <div className="flex justify-center w-full p-12"> 
      <Carousel 
        opts={{
          align: "start",
          loop: true, // Optional: makes it infinite
        }}
        className="w-full max-w-sm"
      >
        <CarouselContent className="-ml-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="pl-1 basis-1/2 md:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-bold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* If buttons aren't showing, they might be clipped by an 'overflow-hidden' parent */}
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}